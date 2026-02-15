const router = require("express").Router();
const safeRoute = require("../sbc/utils/safeRoute/index");
const {
  DispatchOrder: orderClient,
  ChamberStock: stockClient,
  Packages: packagesClient,
  TruckDetails: truckClient,
  sequelize,
} = require("../models");
const {
  updateDispatchOrderNotificationStatus,
} = require("../utils/UpdateDispatchNotificationStatus");

const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");
const notificationTypes = require("../types/notification-types");
require("dotenv").config();

const { uploadToS3, deleteFromS3 } = require("../services/s3Service");
const upload = require("../middlewares/upload");

// Get all dispatch orders
router.get("/", async (req, res) => {
  try {
    const orders = await orderClient.findAll();
    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching dispatch orders:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get a dispatch order by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderClient.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching dispatch order:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * CREATE DISPATCH ORDER
 * Payload:
 * {
 *   customer_name,
 *   address,
 *   state,
 *   country,
 *   city,
 *   est_delivered_date,
 *   products: [{ id, product_name, image, rating }],
 *   usedBagsByProduct: {
 *     [productId]: {
 *       [packageKey]: {
 *         totalBags,
 *         totalPackets,
 *         byChamber: { [chamberId]: bags },
 *         packet: {
 *           size,
 *           unit,
 *           packetsPerBag,
 *         },
 *       }
 *     }
 *   }
 * }
 */
router.post("/create", safeRoute(async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      customer_name,
      address,
      state,
      country,
      city,
      est_delivered_date,
      products,
      usedBagsByProduct,
    } = req.body;

    /* -------------------- Packages Fetching -------------------- */
    const productNames = products.map(p => p.product_name);

    const packages = await packagesClient.findAll({
      where: { product_name: productNames },
      transaction: t,
    });

    const packageMap = new Map(
      packages.map(p => [p.product_name.toLowerCase(), p.package_image?.url || p.image?.url])
    );
    if (!customer_name) throw new Error("Customer name is required");
    if (!Array.isArray(products) || products.length === 0)
      throw new Error("Products are required");

    if (!usedBagsByProduct || typeof usedBagsByProduct !== "object")
      throw new Error("usedBagsByProduct is required");

    /* -------------------- STOCK DEDUCTION -------------------- */
    for (const productId of Object.keys(usedBagsByProduct)) {
      const productUsage = usedBagsByProduct[productId];
      const productName = productId.split("::")[0];

      const stock = await stockClient.findOne({
        where: { product_name: productName },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) {
        throw new Error(`Stock not found for productId ${productId}`);
      }

      if (!Array.isArray(stock.chamber)) {
        throw new Error(`Invalid chamber data for productId ${productId}`);
      }

      for (const packageKey of Object.keys(productUsage)) {
        const usage = productUsage[packageKey];
        const { byChamber = {}, packet, totalBags = 0 } = usage;

        const packetsToDeduct =
          Number(totalBags) * Number(packet?.packetsPerBag || 1);

        /* -------------------- PACKET DEDUCTION -------------------- */
        if (Array.isArray(stock.packages) && packet) {
          const pkgIndex = stock.packages.findIndex(
            (p) =>
              Number(p.size) === Number(packet.size) &&
              p.unit === packet.unit
          );

          if (pkgIndex !== -1) {
            const oldPackets = Number(stock.packages[pkgIndex].quantity || 0);

            if (oldPackets < packetsToDeduct) {
              throw new Error(
                `Insufficient packets. Available: ${oldPackets}, Required: ${packetsToDeduct}`
              );
            }

            stock.packages[pkgIndex].quantity =
              String(oldPackets - packetsToDeduct);
          }
        }

        /* -------------------- CHAMBER DEDUCTION -------------------- */
        const expectedRating = Number(packageKey.split("-")[2]);

        for (const chamberId of Object.keys(byChamber)) {
          const bagsToDeduct = Number(byChamber[chamberId]);
          if (!bagsToDeduct || bagsToDeduct <= 0) continue;

          const chamberIndex = stock.chamber.findIndex(
            (c) =>
              String(c.id) === String(chamberId) &&
              Number(c.rating) === expectedRating
          );

          if (chamberIndex === -1) {
            throw new Error(
              `Chamber ${chamberId} with rating ${expectedRating} not found`
            );
          }

          const oldQty = Number(stock.chamber[chamberIndex].quantity || 0);

          if (oldQty < bagsToDeduct) {
            throw new Error(
              `Insufficient stock in chamber ${chamberId}. Available: ${oldQty}, Required: ${bagsToDeduct}`
            );
          }

          stock.chamber[chamberIndex].quantity =
            String(oldQty - bagsToDeduct);
        }
      }

      await stockClient.update(
        {
          chamber: stock.chamber,
          packages: stock.packages,
        },
        { where: { id: stock.id }, transaction: t }
      );
    }

    /* -------------------- CREATE ORDER -------------------- */
    const order = await orderClient.create(
      {
        customer_name,
        address,
        state: typeof state === "object" ? state.name : state,
        country: country?.label || country,
        city,
        status: "pending",
        est_delivered_date,
        products: products.map((p) => ({
          id: p.id,
          product_name: p.product_name,
          image: packageMap.get(p.product_name.toLowerCase()) || null,
          rating: p.rating,
        })),
        dispatched_items: usedBagsByProduct,
      },
      { transaction: t },
    );

    await t.commit();

    /* -------------------- NOTIFICATION -------------------- */
    const totalBags = Object.values(usedBagsByProduct).reduce(
      (sum, productUsage) =>
        sum +
        Object.values(productUsage).reduce(
          (pkgSum, pkg) => pkgSum + Number(pkg.totalBags || 0),
          0,
        ),
      0,
    );

    dispatchAndSendNotification({
      type: "order-ready",
      title: customer_name,
      description: [`${products.length === 1 ? products[0].product_name : products.length + " Products"}`, `${totalBags} Bags`],
      id: order.id,
      extraData: { id: order.id, status: "pending" },
    });

    return res.status(201).json(order);
  } catch (error) {
    await t.rollback();
    console.error("Dispatch create error:", error.message);
    return res.status(400).json({ error: error.message });
  }
}));

router.patch("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const status = req.body;

    const validStatuses = ["pending", "in-progress", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error:
          "Invalid status. Valid statuses are: pending, in-progress, completed",
      });
    }

    // Find the order
    const order = await orderClient.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update only the status
    await order.update({ status });

    const description = [`${order.products.length} Products`];

    if (status === "in-progress") {
      dispatchAndSendNotification({
        type: "order-shipped",
        description,
        title: order?.customer_name,
        id: order?.id,
      });
      updateDispatchOrderNotificationStatus(order?.id, "in-progress");
    } else if (status === "completed") {
      dispatchAndSendNotification({
        type: "order-reached",
        description,
        title: order?.customer_name,
        id: order?.id,
      });
    }
    updateDispatchOrderNotificationStatus(order?.id, "completed");

    return res.status(200).json({
      message: "Order status updated successfully",
      order: {
        id: order.id,
        status: order.status,
        customer_name: order.customer_name,
        product_name: order.product_name,
      },
    });
  } catch (error) {
    console.error("Error updating order status:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/update/:id", upload.any(), async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const order = await orderClient.findByPk(id, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    const updatableFields = [
      "customer_name",
      "address",
      "postal_code",
      "state",
      "country",
      "city",
      "status",
      "dispatch_date",
      "delivered_date",
      "products",
      "truck_details",
    ];

    const dateFields = ["dispatch_date", "delivered_date"];
    let updatedData = {};
    let sampleImagesUrls = [];

    if (req.body.existing_sample_images) {
      try {
        const existingImages = JSON.parse(req.body.existing_sample_images);
        if (Array.isArray(existingImages)) {
          sampleImagesUrls = [...existingImages];
        }
      } catch (e) {
        console.log("Error parsing existing_sample_images:", e);
        return res
          .status(400)
          .json({ error: "Invalid JSON format for existing_sample_images" });
      }
    }

    const uploadedKeys = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const uploaded = await uploadToS3({
            file,
            folder: "dispatchOrder/challan",
          });
          uploadedKeys.push(uploaded.key);
          return uploaded.url;
        } catch (uploadError) {
          for (const key of uploadedKeys) {
            await deleteFromS3(key);
          }
          console.error("Error uploading file:", uploadError);
          throw new Error(`Failed to upload file: ${file.originalname}`);
        }
      });

      try {
        const newImageUrls = await Promise.all(uploadPromises);
        sampleImagesUrls = [...sampleImagesUrls, ...newImageUrls];
      } catch (uploadError) {
        return res.status(500).json({ error: uploadError.message });
      }
    }

    if (sampleImagesUrls.length > 0) {
      updatedData.sample_images = sampleImagesUrls;
    }

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        if (dateFields.includes(field)) {
          const dateInput = req.body[field];
          const parsedDate = new Date(JSON.parse(dateInput));
          if (isNaN(parsedDate.getTime())) {
            await t.rollback();
            return res
              .status(400)
              .json({ error: `Invalid date format for ${field}` });
          }
          updatedData[field] = parsedDate;
        } else if (field === "truck_details") {
          let truckDetails;
          try {
            truckDetails =
              typeof req.body.truck_details === "string"
                ? JSON.parse(req.body.truck_details)
                : req.body.truck_details;
          } catch (e) {
            await t.rollback();
            return res
              .status(400)
              .json({ error: "Invalid JSON format for truck_details" });
          }

          updatedData.truck_details = {
            ...(order.truck_details || {}),
            ...truckDetails,
          };
        } else if (field === "products") {
          updatedData.products =
            typeof req.body.products === "string"
              ? JSON.parse(req.body.products)
              : req.body.products;
        } else {
          updatedData[field] = req.body[field];
        }
      }
    }

    const products = updatedData.products || order.products || [];

    let truck = null;
    if (updatedData.truck_details?.number) {
      truck = await truckClient.findOne(
        { where: { number: updatedData.truck_details.number } },
        { transaction: t },
      );

      if (!truck) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Truck not found for given number" });
      }

      const totalBags = Object.values(order.usedBagsByProduct || {}).reduce(
        (sum, productUsage) =>
          sum +
          Object.values(productUsage).reduce(
            (pkgSum, pkg) => pkgSum + Number(pkg.totalBags || 0),
            0
          ),
        0
      );

      if (totalBags > truck.size) {
        throw new Error(
          `Truck capacity exceeded. Capacity: ${truck.size} bags, Required: ${totalBags} bags`
        );
      }
    }

    await order.update(updatedData, { transaction: t });

    if (truck) {
      if (truck.isMyTruck && truck.active) {
        await truck.update({ active: false }, { transaction: t });
      } else {
        await truck.destroy({ transaction: t });
      }
    }

    await t.commit();

    if (updatedData?.status === "in-progress") {
      const description = [`${products.length} Products`];

      dispatchAndSendNotification({
        type: "order-shipped",
        description,
        title: order?.customer_name,
        id: order?.id,
      });
    } else if (updatedData?.status === "completed") {
      const description = [`${products.length} Products`];
      dispatchAndSendNotification({
        type: "order-reached",
        description,
        title: order?.customer_name,
        id: order?.id,
      });
    }

    return res.status(200).json(order);
  } catch (error) {
    try {
      await t.rollback();
    } catch (_) { }
    console.error("Error updating dispatch order:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a dispatch order
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderClient.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    await order.destroy();
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting dispatch order:", error?.message || error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
