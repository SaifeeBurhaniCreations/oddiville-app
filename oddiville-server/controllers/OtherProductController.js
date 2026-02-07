const router = require("express").Router();
const {
  ChamberStock: stockClient,
  Chambers: chamberClient,
  SampleImages: sampleImageClient,
  History: historyClient,
  OthersItem: otherItemClient,
  ThirdPartyClient: thirdPartyClient,
} = require("../models");
const sequelize = require("../config/database");

require("dotenv").config();

const { uploadToS3, deleteFromS3 } = require("../services/s3Service");
const upload = require("../middlewares/upload");
const { extractKeyFromUrl } = require("../utils/fileUtils");
const { linkStockToChambers } = require("../utils/stockUtils");

router.get("/", async (req, res) => {
  try {
    const clients = await thirdPartyClient.findAll();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/products", async (req, res) => {
  try {
    const products = await otherItemClient.findAll();
    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
});

router.get("/history/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const products = await historyClient.findAll({ where: { product_id: id } });

    res.status(200).json(products);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
});

// GET by ID
router.get("/item/:id", async (req, res) => {
  try {
    const item = await otherItemClient.findOne({
      where: { product_id: req.params.id },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/stock/:id", async (req, res) => {
  try {
    const item = await stockClient.findOne({
      where: { id: req.params.id },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await thirdPartyClient.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET by name
router.get("/name/:name", async (req, res) => {
  try {
    const client = await thirdPartyClient.findOne({
      where: { name: req.params.name },
    });
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", upload.any({ limits: { files: 10 } }), async (req, res) => {
  const { name, company, address, phone } = req.body;

  const stored_date = new Date();
  let clientPlainResult = null;

  /* ------------------ PARSE PRODUCTS ------------------ */
  let products = [];
  try {
    products = JSON.parse(req.body.products ?? "[]");
    if (!Array.isArray(products)) products = [];
  } catch (e) {
    return res.status(400).json({ error: "Invalid products payload" });
  }

  if (!products.length) {
    return res.status(400).json({ error: "No products provided" });
  }

  try {
    /* ------------------ UPLOAD ALL PRODUCT IMAGES ------------------ */
    const productImageMap = {};

    for (const file of req.files || []) {
      const match = file.fieldname.match(/^products\[(\d+)\]\[sample_image\]$/);

      if (!match) continue;

      const index = Number(match[1]);
      const uploaded = await uploadToS3({
        file,
        folder: "third-party-products",
      });

      productImageMap[index] = uploaded.url;
    }

    /* ------------------ TRANSACTION ------------------ */
    await sequelize.transaction(async (t) => {
      const client = await thirdPartyClient.create(
        { name, company, address, phone, products: [] },
        { transaction: t },
      );

      const clientProductsArray = [];

      /* ------------------ LOOP PRODUCTS ------------------ */
      for (let i = 0; i < products.length; i++) {
        const prod = products[i];

        const product_name = (prod.product_name ?? "").trim();
        const selectedChambers = Array.isArray(prod.selectedChambers)
          ? prod.selectedChambers
          : [];

        const productRent = Number(prod.rent);
        const est_dispatch_date = prod.est_dispatch_date ?? null;
        const sampleImage = productImageMap[i] ?? null;

        if (!product_name) throw new Error("product_name missing");
        if (isNaN(productRent))
          throw new Error(`Invalid rent: ${product_name}`);
        if (!selectedChambers.length)
          throw new Error(`No chambers for product: ${product_name}`);

        /* ------------------ NORMALIZE CHAMBERS ------------------ */
        const normalizedIncoming = selectedChambers.map((c) => ({
          id: String(c.id),
          add: Number(c.add_quantity ?? c.quantity ?? 0),
          sub: Number(c.sub_quantity ?? 0),
          rating: c.rating ?? company,
        }));

        const chamberIds = normalizedIncoming.map((c) => c.id);

        const chamberInstances = await chamberClient.findAll({
          where: { id: chamberIds },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const chamberMap = new Map(
          chamberInstances.map((c) => [String(c.id), c]),
        );

        /* ------------------ CAPACITY CHECK ------------------ */
        const insufficient = [];

        for (const incoming of normalizedIncoming) {
          const inst = chamberMap.get(incoming.id);
          if (!inst) continue;

          const capacity = Number(inst.capacity ?? 0);
          const currentStock = Number(inst.current_stock ?? 0);
          const netAdd = Math.max(0, incoming.add - incoming.sub);

          if (netAdd > capacity - currentStock) {
            insufficient.push({ id: inst.id, netAdd });
          }
        }

        if (insufficient.length) {
          const err = new Error("Insufficient chamber capacity");
          err.details = insufficient;
          throw err;
        }

        /* ------------------ STOCK UPSERT ------------------ */
        let stock = await stockClient.findOne({
          where: { product_name, category: "other" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!stock) {
          stock = await stockClient.create(
            {
              product_name,
              category: "other",
              unit: "kg",
              image: sampleImage,
              chamber: normalizedIncoming.map((c) => ({
                id: c.id,
                quantity: String(Math.max(0, c.add - c.sub)),
                rating: c.rating,
              })),
            },
            { transaction: t },
          );
        }

        const stored_quantity = normalizedIncoming.reduce(
          (s, c) => s + Math.max(0, c.add - c.sub),
          0,
        );

        await linkStockToChambers(stock.id, chamberIds, t, chamberClient);

        /* ------------------ SAVE CLIENT PRODUCT ------------------ */
        await otherItemClient.create(
          {
            product_id: stock.id,
            client_id: client.id,
            stored_quantity,
            rent: productRent,
            stored_date,
            dispatched_date: null,
            est_dispatch_date,
            sample_image: sampleImage,
            history: [],
          },
          { transaction: t },
        );

        const freshStock = await stockClient.findByPk(stock.id, {
          transaction: t,
          raw: true,
        });

        clientProductsArray.push(freshStock);
      }

      await client.update(
        { products: clientProductsArray.map((p) => p.id) },
        { transaction: t },
      );

      clientPlainResult = {
        ...client.get({ plain: true }),
        products: clientProductsArray,
      };
    });

    return res.status(201).json(clientPlainResult);
  } catch (err) {
    console.error(err);
    console.error("POST ERROR MESSAGE:", err.message);
    console.error("POST ERROR DETAILS:", err.details);

    return res.status(err.details ? 400 : 500).json({
      error: err.message || "Internal server error",
      details: err.details,
    });
  }
});

router.patch("/update-quantity/:othersItemId/:id", async (req, res) => {
  const { id: stockIdParam, othersItemId } = req.params;
  let { chambers = [], add_quantity = 0, sub_quantity = 0 } = req.body;

  try {
    chambers = Array.isArray(chambers) ? chambers : [];

    await sequelize.transaction(async (t) => {
      // Lock stock row
      const stockRow = await stockClient.findByPk(stockIdParam, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!stockRow) {
        throw Object.assign(new Error("Chamber stock not found"), {
          status: 404,
        });
      }

      // Lock item row
      const item = await otherItemClient.findByPk(othersItemId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!item) {
        throw Object.assign(new Error("OthersItem not found"), { status: 404 });
      }

      // Get current chambers from stock
      const currentChambers = Array.isArray(stockRow.chamber)
        ? stockRow.chamber
        : [];

      // Extract chamber IDs from request
      const chamberIdsFromRequest = chambers.map((c) => c.id).filter(Boolean);

      if (chamberIdsFromRequest.length === 0) {
        throw Object.assign(
          new Error("At least one chamber must be specified"),
          { status: 400 },
        );
      }

      // Lock chamber instances
      const lockedChamberInstances = await chamberClient.findAll({
        where: { id: chamberIdsFromRequest },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const chamberMap = new Map(
        lockedChamberInstances.map((c) => [String(c.id), c]),
      );

      // Validate capacity for additions
      const insufficient = [];

      for (const requestChamber of chambers) {
        const chamberId = requestChamber.id;
        const addQty = Number(requestChamber.add_quantity || 0);

        if (addQty <= 0) continue;

        const chamberInstance = chamberMap.get(String(chamberId));
        if (!chamberInstance) {
          insufficient.push({
            id: chamberId,
            reason: "chamber_not_found",
          });
          continue;
        }

        const capacity = Number(chamberInstance.capacity ?? 0);
        const currentStock = Number(
          chamberInstance.current_stock ?? chamberInstance.stored_quantity ?? 0,
        );
        const available = Math.max(0, capacity - currentStock);

        if (addQty > available) {
          insufficient.push({
            id: chamberInstance.id,
            name: chamberInstance.name,
            requested: addQty,
            available,
            capacity,
            currentStock,
          });
        }
      }

      if (insufficient.length > 0) {
        const err = new Error(
          "Insufficient chamber capacity for requested quantities",
        );
        err.details = insufficient;
        throw err;
      }


      const requestMap = new Map(chambers.map(c => [c.id, c]));

      const updatedChambers = currentChambers.map((stockChamber) => {
        // Find matching chamber from request
        const requestChamber = requestMap.get(stockChamber.id);

        if (!requestChamber) return stockChamber;

        let quantity = Number(stockChamber.quantity ?? 0);
        const addQty = Number(requestChamber.add_quantity || 0);
        const subQty = Number(requestChamber.sub_quantity || 0);

        if (subQty > quantity) {
          throw Object.assign(
            new Error("Insufficient stock to deduct from chamber"),
            { status: 400 }
          );
        }

        quantity += addQty;
        quantity -= subQty;

        return {
          ...stockChamber,
          quantity: quantity.toString(),
        };
      });

      // Update stock with new chamber quantities
      await stockClient.update(
        { chamber: updatedChambers },
        { where: { id: stockRow.id }, transaction: t },
      );

      // Calculate total add/sub quantities across all chambers
      const totalAddQuantity = chambers.reduce(
        (sum, c) => sum + Number(c.add_quantity || 0),
        0,
      );
      const totalSubQuantity = chambers.reduce(
        (sum, c) => sum + Number(c.sub_quantity || 0),
        0,
      );

      // Update item stored quantity
      let stored_quantity = Number(item.stored_quantity ?? 0);
      stored_quantity += totalAddQuantity;
      stored_quantity -= totalSubQuantity;
      stored_quantity = Math.max(0, stored_quantity);

      await otherItemClient.update(
        { stored_quantity },
        { where: { id: othersItemId }, transaction: t },
      );

      // Create history entries for each chamber with activity
      for (const requestChamber of chambers) {
        const addQty = Number(requestChamber.add_quantity || 0);
        const subQty = Number(requestChamber.sub_quantity || 0);
        console.log("requestChamber", requestChamber);
        console.log("item.id", item.id);

        // Only create history if there's actual activity
        if (addQty > 0 || subQty > 0) {
          await historyClient.create(
            {
              product_id: item.id,
              chamber_id: requestChamber.id, // This will never be null now
              deduct_quantity: subQty,
              add_quantity: addQty, // Include add_quantity if your schema supports it
              remaining_quantity: stored_quantity,
            },
            { transaction: t },
          );
        }
      }
    });

    // Fetch and return updated stock
    const updatedStock = await stockClient.findByPk(stockIdParam, {
      raw: true,
    });
    const updatedItem = await otherItemClient.findByPk(othersItemId, { raw: true });

    return res.json({
      success: true,
      stock: updatedStock,
      item: updatedItem,
    });

  } catch (error) {
    console.error(
      "Error during update chamberStock by id:",
      error?.message || error,
    );

    if (error && error.details) {
      return res.status(400).json({
        error: error.message,
        details: error.details,
      });
    }

    const status = error && error.status ? error.status : 500;
    return res.status(status).json({
      error: error.message || "Internal server error, please try again later.",
    });
  }
});

router.patch("/:id", upload.any(), async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const client = await thirdPartyClient.findByPk(id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!client) {
      await t.rollback();
      return res.status(404).json({ error: "Client not found" });
    }

    /* =====================
         1️⃣ UPDATE BASIC DATA
         ===================== */
    const { name, company, address, phone } = req.body;

    await client.update({ name, company, address, phone }, { transaction: t });

    /* =====================
         2️⃣ UPDATE PRODUCTS
         ===================== */
    let products = [];

    try {
      if (req.body.products) {
        products =
          typeof req.body.products === "string"
            ? JSON.parse(req.body.products)
            : req.body.products;
      }
    } catch (e) {
      return res.status(400).json({ error: "Invalid products payload" });
    }
    console.log("products", products);

    /* =====================
         3️⃣ HANDLE IMAGES (OPTIONAL)
         ===================== */
    if (req.files?.length) {
      for (const file of req.files) {
        const match = file.fieldname.match(/^products\[(\d+)\]\[sample_image\]$/);
        if (!match) continue;

        const index = Number(match[1]);
        const productId = products[index]?.id;
        if (!productId) continue;

        const existingItem = await otherItemClient.findOne({
          where: {
            client_id: client.id,
            product_id: productId,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!existingItem) continue;

        const uploaded = await uploadToS3({
          file,
          folder: "third-party-products",
        });

        await existingItem.update(
          { sample_image: uploaded.url },
          { transaction: t }
        );
      }
    }


    await t.commit();

    return res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    await t.rollback();
    console.error("PATCH error:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/image", upload.single("sample_image"), async (req, res) => {
  const t = await sequelize.transaction();

  try {
    if (!req.file) {
      await t.rollback();
      return res.status(400).json({ error: "Image file required" });
    }

    const client = await thirdPartyClient.findByPk(req.params.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!client) {
      await t.rollback();
      return res.status(404).json({ error: "Client not found" });
    }

    const existingItem = await otherItemClient.findOne({
      where: { client_id: client.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!existingItem) {
      await t.rollback();
      return res.status(404).json({ error: "Item not found" });
    }

    const oldImageUrl = existingItem.sample_image;

    const uploaded = await uploadToS3({
      file: req.file,
      folder: "third-party-products",
    });

    await existingItem.update(
      { sample_image: uploaded.url },
      { transaction: t },
    );

    await t.commit();

    if (oldImageUrl) {
      const oldKey = extractKeyFromUrl(oldImageUrl);
      if (oldKey) {
        await deleteFromS3(oldKey);
      }
    }

    return res.status(200).json({
      message: "Image updated successfully",
      image: uploaded.url,
    });
  } catch (err) {
    await t.rollback();
    console.error("IMAGE PATCH error:", err);
    return res.status(500).json({ error: "Failed to update image" });
  }
});

router.delete("/:id", async (req, res) => {
  const clientId = req.params.id;

  const t = await sequelize.transaction();
  try {
    const client = await thirdPartyClient.findByPk(clientId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!client) {
      await t.rollback();
      return res.status(404).json({ error: "Client not found" });
    }

    // 1) Load all others items for this client
    const items = await otherItemClient.findAll({
      where: { client_id: client.id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    for (const item of items) {
      if (item.sample_image) {
        const key = extractKeyFromUrl(item.sample_image);
        if (key) {
          await deleteFromS3(key);
        }
      }
    }

    const itemIds = items.map((it) => it.id);
    const productIds = items.map((it) => it.product_id);

    // 2) Delete history for these items
    if (itemIds.length > 0) {
      await historyClient.destroy({
        where: { product_id: itemIds },
        transaction: t,
      });
    }

    // 3) For each stock (ChamberStock), clean chamber JSON and chamber.items
    if (productIds.length > 0) {
      const stocks = await stockClient.findAll({
        where: { id: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      for (const stock of stocks) {
        const chamberArr = Array.isArray(stock.chamber) ? stock.chamber : [];

        // Collect chamber IDs for this stock
        const chamberIds = chamberArr.map((c) => String(c.id));

        if (chamberIds.length > 0) {
          const chambers = await chamberClient.findAll({
            where: { id: chamberIds },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          for (const chamber of chambers) {
            const itemsArray = Array.isArray(chamber.items)
              ? chamber.items.map((v) => String(v))
              : [];

            const filteredItems = itemsArray.filter(
              (pid) => pid !== String(stock.id),
            );

            // If chamber has no more items, you can optionally clear its chamber stock,
            // or leave it empty. Here, just update items.
            chamber.items = filteredItems;
            await chamber.save({ transaction: t });
          }
        }

        // Option A: if this stock is only used by this client, delete it entirely
        // Option B: if stock can be shared across clients, just leave it.
        // For now, delete stock if no chambers refer to it anymore.

        const stillChambers = chamberArr.length;
        if (!stillChambers) {
          await stock.destroy({ transaction: t });
        } else {
          // Or optionally clear quantities / leave as is
          // stock.chamber = chamberArr;
          // await stock.save({ transaction: t });
        }
      }
    }

    // 4) Delete OthersItem rows for this client
    if (itemIds.length > 0) {
      await otherItemClient.destroy({
        where: { id: itemIds },
        transaction: t,
      });
    }

    // 5) Finally delete client itself
    await client.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ message: "Client and related data deleted" });
  } catch (err) {
    await t.rollback();
    console.error("Delete client cascade error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
});

module.exports = router;
