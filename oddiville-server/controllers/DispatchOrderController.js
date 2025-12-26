const router = require("express").Router();
const {
  DispatchOrder: orderClient,
  ChamberStock: stockClient,
  // Packages: packageClient,
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

const allocateChamberQuantities = async (parsedProducts) => {
  const updatedChamberAllocations = [];

  for (const product of parsedProducts) {
    const { name, chambers = [] } = product;
    const stock = await stockClient.findOne({ where: { product_name: name } });

    if (!stock || !Array.isArray(stock.chamber)) continue;

    for (const productChamber of chambers) {
      const chamberId = productChamber.id;
      const requiredQty = Number(productChamber.quantity || 0);

      // Filter matching chamber entries from stock
      const matchingStockEntries = stock.chamber
        .filter((entry) => entry.id === chamberId)
        .sort((a, b) => Number(b.quantity) - Number(a.quantity)); // High to low quantity

      let remainingQty = requiredQty;
      const allocations = [];

      for (const entry of matchingStockEntries) {
        const available = Number(entry.quantity || 0);
        if (available <= 0) continue;

        const take = Math.min(remainingQty, available);
        remainingQty -= take;

        allocations.push({
          id: chamberId,
          name,
          quantity: take,
          rating: entry.rating,
        });

        if (remainingQty <= 0) break;
      }

      if (remainingQty > 0) {
        throw new Error(
          `Insufficient stock in chamber ${chamberId} for product ${name}. Required: ${requiredQty}, Missing: ${remainingQty}`
        );
      }

      updatedChamberAllocations.push(...allocations);
    }
  }

  return updatedChamberAllocations;
};

function validateProducts(products) {
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new Error("Products are required.");
  }

  // Prepare filtered products with only valid chambers
  const filteredProducts = products.map((product) => {
    if (!product.name) {
      throw new Error("Product name is required for all products.");
    }
    if (!product.chambers || !Array.isArray(product.chambers)) {
      throw new Error(
        `Chambers should be an array for product: ${product.name}`
      );
    }

    // Check for missing chamber ids (for all chambers)
    product.chambers.forEach((chamber) => {
      if (!chamber.id) {
        throw new Error(`Chamber ID is required for product: ${product.name}`);
      }
    });

    // Only keep chambers with a valid quantity (> 0)
    const validChambers = product.chambers.filter(
      (chamber) =>
        chamber.id &&
        chamber.quantity !== "" &&
        chamber.quantity !== null &&
        chamber.quantity !== undefined &&
        !isNaN(Number(chamber.quantity)) &&
        Number(chamber.quantity) > 0
    );

    // At least one chamber must have valid quantity (> 0)
    if (validChambers.length === 0) {
      throw new Error(
        `Product "${product.name}" must have at least one chamber with quantity greater than 0.`
      );
    }

    // Always return only valid chambers!
    return {
      ...product,
      chambers: validChambers,
    };
  });

  // Calculate total quantity across all valid chambers
  const totalQuantity = filteredProducts.reduce(
    (total, product) =>
      total +
      product.chambers.reduce(
        (sum, chamber) => sum + Number(chamber.quantity),
        0
      ),
    0
  );

  if (totalQuantity === 0) {
    throw new Error(
      "Total quantity across all products must be greater than 0."
    );
  }

  return filteredProducts;
}

function validatePackages(packages, product_name, dbTypes) {
  if (!packages || !Array.isArray(packages) || packages.length === 0) {
    throw new Error("Packages are required.");
  }

  if (!dbTypes) {
    throw new Error(`No package types found for product: ${product_name}`);
  }

  const normalize = (v) => v?.toString().trim().toLowerCase();

  for (const { size, unit, quantity } of packages) {
    const dbType = dbTypes.find(
      (t) =>
        normalize(t.size) === normalize(size) &&
        normalize(t.unit) === normalize(unit)
    );

    if (!dbType) {
      throw new Error(
        `Package type with size ${size} and unit ${unit} not found.`
      );
    }

    if (Number(quantity) > Number(dbType.quantity)) {
      throw new Error(
        `Requested quantity (${quantity}) for size ${size} ${unit} exceeds stock (${dbType.quantity}).`
      );
    }
  }
}

function parseProducts(products) {
  return products.map((product) => ({
    name: product.name,
    chambers: Array.isArray(product.chambers)
      ? product.chambers.map((chamber) => ({
          id: chamber.id,
          name: chamber.name,
          quantity: chamber.quantity,
        }))
      : [],
  }));
}

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

router.post("/create", async (req, res) => {
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

console.log("usedBagsByProduct", usedBagsByProduct);

    if (!customer_name) {
      throw new Error("Customer name is required");
    }

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Products are required");
    }

    if (
      !usedBagsByProduct ||
      typeof usedBagsByProduct !== "object"
    ) {
      throw new Error("usedBagsByProduct is required for stock deduction");
    }

    for (const productId of Object.keys(usedBagsByProduct)) {
      const productUsage = usedBagsByProduct[productId];

      const stock = await stockClient.findOne({
        where: { id: productId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!stock) {
        throw new Error(`Stock not found for productId ${productId}`);
      }

      if (!Array.isArray(stock.chamber)) {
        throw new Error(`Invalid chamber data for productId ${productId}`);
      }

      for (const pkgKey of Object.keys(productUsage)) {
        const pkgUsage = productUsage[pkgKey];
        const byChamber = pkgUsage?.byChamber || {};

        for (const chamberId of Object.keys(byChamber)) {
          const packetsToDeduct = Number(byChamber[chamberId]);

          if (!packetsToDeduct || packetsToDeduct <= 0) continue;

          const chamberIndex = stock.chamber.findIndex(
            (c) => String(c.id) === String(chamberId)
          );

          if (chamberIndex === -1) {
            throw new Error(
              `Chamber ${chamberId} not found for productId ${productId}`
            );
          }

          const oldQty = Number(stock.chamber[chamberIndex].quantity || 0);

          if (oldQty < packetsToDeduct) {
            throw new Error(
              `Insufficient stock in chamber ${chamberId}. Available: ${oldQty}, Required: ${packetsToDeduct}`
            );
          }

          const newQty = oldQty - packetsToDeduct;

          stock.chamber[chamberIndex].quantity = String(newQty);
        }
      }

      await stockClient.update(
        { chamber: stock.chamber },
        { where: { id: stock.id }, transaction: t }
      );
    }

    const order = await orderClient.create(
      {
        customer_name,
        address,
        state: typeof state === "object" ? state.name : state,
        country: country?.label || country,
        city,
        status: "pending",
        est_delivered_date,
        products,
      },
      { transaction: t }
    );

    await t.commit();

    const totalPackets = Object.values(usedBagsByProduct).reduce(
      (sum, productUsage) => {
        return (
          sum +
          Object.values(productUsage).reduce(
            (pkgSum, pkg) => pkgSum + Number(pkg.totalPackets || 0),
            0
          )
        );
      },
      0
    );

    dispatchAndSendNotification({
      type: "order-ready",
      title: customer_name,
      description: [`${products.length} Products`, `${totalPackets} Packets`],
      id: order.id,
      extraData: { id: order.id, status: "pending" },
    });

    return res.status(201).json(order);
  } catch (error) {
    try {
      await t.rollback();
    } catch (_) {}

    console.error("Error creating dispatch order:", error.message);
    return res.status(400).json({ error: error.message });
  }
});

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

    // Send notifications based on status change
    const totalWeight = order?.products?.reduce((sum, product) => {
      const chamberSum = product?.chambers?.reduce(
        (cSum, chamber) => cSum + (Number(chamber.quantity) || 0),
        0
      );
      return sum + chamberSum;
    }, 0);

    const description = [order?.product_name, `${totalWeight} Kg`];

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
          const uploaded = await uploadToS3({file, folder: "dispatchOrder/challan"});
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

    const totalWeight = products.reduce((sum, product) => {
      const chamberSum =
        product?.chambers?.reduce(
          (cSum, chamber) => cSum + (Number(chamber.quantity) || 0),
          0
        ) || 0;
      return sum + chamberSum;
    }, 0);

    let truck = null;
    if (updatedData.truck_details?.number) {
      truck = await truckClient.findOne(
        { where: { number: updatedData.truck_details.number } },
        { transaction: t }
      );

      if (!truck) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: "Truck not found for given number" });
      }

      const truckCapacity = Number(truck.size || 0);

      if (totalWeight > truckCapacity) {
        await t.rollback();
        return res.status(400).json({
          error: "Truck capacity exceeded",
          details: {
            truckCapacity,
            requiredCapacity: totalWeight,
          },
        });
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
      const description = [order?.product_name, `${totalWeight} Kg`];
      dispatchAndSendNotification({
        type: "order-shipped",
        description,
        title: order?.customer_name,
        id: order?.id,
      });
    } else if (updatedData?.status === "completed") {
      const description = [order?.product_name, `${totalWeight} Kg`];
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
    } catch (_) {}
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
