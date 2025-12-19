  const router = require("express").Router();
  const {
    ChamberStock: stockClient,
    Chambers: chamberClient,
    SampleImages: sampleImageClient,
    History: historyClient,
    OthersItem: otherItemClient,
    ThirdPartyClient: thirdPartyClient,
  } = require("../models");
  const { v4: uuidv4 } = require("uuid");
  const multer = require("multer");
  const { PutObjectCommand } = require("@aws-sdk/client-s3");
  const s3 = require("../utils/s3Client");
  const sequelize = require("../config/database");

  require("dotenv").config();

  const upload = multer();

  const uploadToS3 = async (file) => {
    const id = uuidv4();
    const fileKey = `third-party-products/${id}-${file.originalname}`;
    const bucketName = process.env.AWS_BUCKET_NAME;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { url, key: fileKey };
  };

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

router.post("/", upload.any(), async (req, res) => {
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
      const match = file.fieldname.match(
        /^products\[(\d+)\]\[sample_image\]$/
      );

      if (!match) continue;

      const index = Number(match[1]);

      const uploaded = await uploadToS3(file);

      productImageMap[index] = uploaded.url;
    }

    /* ------------------ TRANSACTION ------------------ */
    await sequelize.transaction(async (t) => {
      const client = await thirdPartyClient.create(
        { name, company, address, phone, products: [] },
        { transaction: t }
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
        if (isNaN(productRent)) throw new Error(`Invalid rent: ${product_name}`);
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
          chamberInstances.map((c) => [String(c.id), c])
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
              chamber: normalizedIncoming.map((c) => ({
                id: c.id,
                quantity: String(Math.max(0, c.add - c.sub)),
                rating: c.rating,
              })),
            },
            { transaction: t }
          );
        }

        const stored_quantity = normalizedIncoming.reduce(
          (s, c) => s + Math.max(0, c.add - c.sub),
          0
        );

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
          { transaction: t }
        );

        const freshStock = await stockClient.findByPk(stock.id, {
          transaction: t,
          raw: true,
        });

        clientProductsArray.push(freshStock);
      }

      await client.update(
        { products: clientProductsArray.map((p) => p.id) },
        { transaction: t }
      );

      clientPlainResult = {
        ...client.get({ plain: true }),
        products: clientProductsArray,
      };
    });

    return res.status(201).json(clientPlainResult);
  } catch (err) {
    console.error(err);

    return res.status(err.details ? 400 : 500).json({
      error: err.message || "Internal server error",
      details: err.details,
    });
  }
});

// router.patch("/update-quantity/:othersItemId/:id", async (req, res) => {
//     const { id: stockIdParam, othersItemId } = req.params;
//     let { chambers = [], add_quantity = 0, sub_quantity = 0 } = req.body;
//     console.log(req.body);
    
//     try {
//       add_quantity = Number(add_quantity || 0);
//       sub_quantity = Number(sub_quantity || 0);
//       chambers = Array.isArray(chambers) ? chambers : [];

//       await sequelize.transaction(async (t) => {
//         const stockRow = await stockClient.findByPk(stockIdParam, { transaction: t, lock: t.LOCK.UPDATE });
//         if (!stockRow) throw Object.assign(new Error("Chamber stock not found"), { status: 404 });

//         const item = await otherItemClient.findByPk(othersItemId, { transaction: t, lock: t.LOCK.UPDATE });
//         if (!item) throw Object.assign(new Error("OthersItem not found"), { status: 404 });

//         const currentChambers = Array.isArray(stockRow.chamber) ? stockRow.chamber : [];

//         const chamberIdsToLock = currentChambers
//           .filter((sc) => chambers.includes(sc.id))
//           .map((sc) => sc.id);

//         const lockedChamberInstances = chamberIdsToLock.length
//           ? await chamberClient.findAll({ where: { id: chamberIdsToLock }, transaction: t, lock: t.LOCK.UPDATE })
//           : [];

//         const chamberMap = new Map(lockedChamberInstances.map((c) => [String(c.id), c]));

//         if (add_quantity > 0) {
//           const insufficient = [];
//           for (const stockChamber of currentChambers) {
//             if (!chambers.includes(stockChamber.id)) continue;
//             const inst = chamberMap.get(String(stockChamber.id));
//             if (!inst) {
//               insufficient.push({ id: stockChamber.id, reason: "chamber_not_found" });
//               continue;
//             }
//             const capacity = Number(inst.capacity ?? 0);
//             const currentStock = Number(inst.current_stock ?? inst.stored_quantity ?? 0);
//             const netAdd = add_quantity;
//             const available = Math.max(0, capacity - currentStock);
//             if (netAdd > available) {
//               insufficient.push({
//                 id: inst.id,
//                 name: inst.name,
//                 requested: netAdd,
//                 available,
//                 capacity,
//                 currentStock,
//               });
//             }
//           }
//           if (insufficient.length > 0) {
//             const err = new Error("Insufficient chamber capacity for requested add_quantity");
//             err.details = insufficient;
//             throw err;
//           }
//         }

//         const updatedChambers = currentChambers.map((stockChamber) => {
//           if (!chambers.includes(stockChamber.id)) return stockChamber;
//           let quantity = Number(stockChamber.quantity ?? 0);
//           if (add_quantity) quantity += add_quantity;
//           if (sub_quantity) quantity -= sub_quantity;
//           if (quantity < 0) quantity = 0;
//           return { ...stockChamber, quantity: quantity.toString() };
//         });

//         await stockClient.update({ chamber: updatedChambers }, { where: { id: stockRow.id }, transaction: t });

//         let stored_quantity = Number(item.stored_quantity ?? 0);
//         if (add_quantity) stored_quantity += add_quantity;
//         if (sub_quantity) stored_quantity -= sub_quantity;
//         if (stored_quantity < 0) stored_quantity = 0;

//         await otherItemClient.update({ stored_quantity }, { where: { id: othersItemId }, transaction: t });

//         const chamberMatch = updatedChambers.find((sc) => chambers.includes(sc.id));
//         const chamberIdForHistory = chamberMatch ? chamberMatch.id : null;

//         await historyClient.create(
//           {
//             product_id: item.id,
//             deduct_quantity: sub_quantity,
//             remaining_quantity: stored_quantity,
//             chamber_id: chamberIdForHistory,
//           },
//           { transaction: t }
//         );

//       });

//       const updatedStock = await stockClient.findByPk(stockIdParam, { raw: true });
//       return res.status(200).json(updatedStock);
//     } catch (error) {
//       console.error("Error during update chamberStock by id:", error?.message || error);
//       if (error && error.details) {
//         return res.status(400).json({ error: error.message, details: error.details });
//       }
//       const status = error && error.status ? error.status : 500;
//       return res.status(status).json({ error: error.message || "Internal server error, please try again later." });
//     }
//   });

  router.patch("/update-quantity/:othersItemId/:id", async (req, res) => {
  const { id: stockIdParam, othersItemId } = req.params;
  let { chambers = [], add_quantity = 0, sub_quantity = 0 } = req.body;
  
  try {
    // Parse chambers array from request body
    // Expected format: chambers = [{ id: 'uuid', add_quantity: 500, sub_quantity: 0 }, ...]
    chambers = Array.isArray(chambers) ? chambers : [];

    await sequelize.transaction(async (t) => {
      // Lock stock row
      const stockRow = await stockClient.findByPk(stockIdParam, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      if (!stockRow) {
        throw Object.assign(new Error("Chamber stock not found"), { status: 404 });
      }

      // Lock item row
      const item = await otherItemClient.findByPk(othersItemId, { 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      if (!item) {
        throw Object.assign(new Error("OthersItem not found"), { status: 404 });
      }

      // Get current chambers from stock
      const currentChambers = Array.isArray(stockRow.chamber) ? stockRow.chamber : [];

      // Extract chamber IDs from request
      const chamberIdsFromRequest = chambers.map(c => c.id).filter(Boolean);
      
      if (chamberIdsFromRequest.length === 0) {
        throw Object.assign(
          new Error("At least one chamber must be specified"), 
          { status: 400 }
        );
      }

      // Lock chamber instances
      const lockedChamberInstances = await chamberClient.findAll({ 
        where: { id: chamberIdsFromRequest }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });

      const chamberMap = new Map(
        lockedChamberInstances.map((c) => [String(c.id), c])
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
            reason: "chamber_not_found" 
          });
          continue;
        }

        const capacity = Number(chamberInstance.capacity ?? 0);
        const currentStock = Number(
          chamberInstance.current_stock ?? chamberInstance.stored_quantity ?? 0
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
        const err = new Error("Insufficient chamber capacity for requested quantities");
        err.details = insufficient;
        throw err;
      }

      // Update chamber quantities in stock
      const updatedChambers = currentChambers.map((stockChamber) => {
        // Find matching chamber from request
        const requestChamber = chambers.find(c => c.id === stockChamber.id);
        
        if (!requestChamber) return stockChamber;

        let quantity = Number(stockChamber.quantity ?? 0);
        const addQty = Number(requestChamber.add_quantity || 0);
        const subQty = Number(requestChamber.sub_quantity || 0);

        quantity += addQty;
        quantity -= subQty;
        quantity = Math.max(0, quantity);

        return { 
          ...stockChamber, 
          quantity: quantity.toString() 
        };
      });

      // Update stock with new chamber quantities
      await stockClient.update(
        { chamber: updatedChambers }, 
        { where: { id: stockRow.id }, transaction: t }
      );

      // Calculate total add/sub quantities across all chambers
      const totalAddQuantity = chambers.reduce(
        (sum, c) => sum + Number(c.add_quantity || 0), 
        0
      );
      const totalSubQuantity = chambers.reduce(
        (sum, c) => sum + Number(c.sub_quantity || 0), 
        0
      );

      // Update item stored quantity
      let stored_quantity = Number(item.stored_quantity ?? 0);
      stored_quantity += totalAddQuantity;
      stored_quantity -= totalSubQuantity;
      stored_quantity = Math.max(0, stored_quantity);

      await otherItemClient.update(
        { stored_quantity }, 
        { where: { id: othersItemId }, transaction: t }
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
            { transaction: t }
          );
        }
      }
    });

    // Fetch and return updated stock
    const updatedStock = await stockClient.findByPk(stockIdParam, { raw: true });
    return res.status(200).json({
      success: true,
      data: updatedStock
    });

  } catch (error) {
    console.error("Error during update chamberStock by id:", error?.message || error);
    
    if (error && error.details) {
      return res.status(400).json({ 
        error: error.message, 
        details: error.details 
      });
    }
    
    const status = error && error.status ? error.status : 500;
    return res.status(status).json({ 
      error: error.message || "Internal server error, please try again later." 
    });
  }
});

  // router.patch("/deduct-quantity/:othersItemId", async (req, res) => {
  //   const { sub_quantity } = req.body;
  //   const { othersItemId } = req.params;

  //   try {
  //     const item = await otherItemClient.findByPk(othersItemId);
  //     if (!item) return res.status(404).json({ error: "OthersItem not found" });

  //     const deductQty = Number(sub_quantity);
  //     if (Number(item.stored_quantity) < deductQty) {
  //       return res.status(400).json({ error: "Not enough quantity to deduct" });
  //     }

  //     const stock = await stockClient.findByPk(item?.product_id);
  //     if (!stock || !Array.isArray(stock.chamber)) {
  //       return res
  //         .status(400)
  //         .json({ error: "No chamber stock data available for this product" });
  //     }

  //     const chambersSorted = [...stock.chamber]
  //       .filter((entry) => Number(entry.quantity) > 0)
  //       .sort((a, b) => Number(b.quantity) - Number(a.quantity));

  //     let remainingQty = deductQty;
  //     const chamberUpdates = [];
  //     const historyEntries = [];

  //     for (const chamber of chambersSorted) {
  //       if (remainingQty <= 0) break;

  //       const available = Number(chamber.quantity);
  //       const take = Math.min(available, remainingQty);
  //       remainingQty -= take;

  //       chamberUpdates.push({
  //         id: chamber.id,
  //         newQuantity: available - take,
  //       });

  //       historyEntries.push({
  //         product_id: item.id,
  //         deduct_quantity: take,
  //         remaining_quantity: available - take,
  //         chamber_id: chamber.id,
  //       });
  //     }

  //     if (remainingQty > 0) {
  //       return res
  //         .status(400)
  //         .json({
  //           error: `Insufficient chamber stock. Missing ${remainingQty} units.`,
  //         });
  //     }

  //     const newStoredQty = Number(item.stored_quantity) - deductQty;

  //     const updatedChambers = stock.chamber.map((chamber) => {
  //       const update = chamberUpdates.find((u) => u.id === chamber.id);
  //       return update ? { ...chamber, quantity: update.newQuantity } : chamber;
  //     });

  //     console.log(updatedChambers);
  //     console.log(historyEntries);
  //     console.log(newStoredQty);

  //     return;
  //     await stock.update({ chamber: updatedChambers });

  //     const createdEntries = await historyClient.bulkCreate(historyEntries);

  //     await item.update({
  //       stored_quantity: newStoredQty,
  //       history: [
  //         ...(item.history || []),
  //         ...createdEntries.map((val) => val.id).filter(Boolean),
  //       ],
  //     });

  //     res.json({
  //       message: "Quantity deducted successfully",
  //       item,
  //       deducted: deductQty,
  //       chamberUpdates,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ error: err.message });
  //   }
  // });

router.patch(
  "/:id",
  upload.single("sample_image"),
  async (req, res) => {
    const t = await sequelize.transaction();

    try {
      const client = await thirdPartyClient.findByPk(req.params.id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!client) {
        await t.rollback();
        return res.status(404).json({ error: "Client not found" });
      }

      /* BASIC CLIENT UPDATE */
      const { name, company, address, phone } = req.body;

      await client.update(
        { name, company, address, phone },
        { transaction: t }
      );

      /* PARSE PRODUCTS */
      let products = [];
      try {
        products = JSON.parse(req.body.products || "[]");
        if (!Array.isArray(products)) products = [];
      } catch (e) {
        await t.rollback();
        return res.status(400).json({ error: "Invalid products payload" });
      }

      if (!products.length) {
        await t.rollback();
        return res.status(400).json({ error: "No products provided" });
      }

      /* IMAGE HANDLING */
      let uploadedImageUrl = null;
      if (req.file) {
        const uploaded = await uploadToS3(req.file);
        uploadedImageUrl = uploaded.url;
      }

      const normalizeItems = (items) =>
        Array.isArray(items) ? items.map((i) => String(i)) : [];

      const clientProductIds = [];

      for (const prod of products) {
        const product_name = String(prod.product_name || "").trim();
        if (!product_name) {
          throw new Error("product_name missing");
        }

        const rent = Number(prod.rent);
        if (isNaN(rent)) {
          throw new Error(`Invalid rent for ${product_name}`);
        }

        const est_dispatch_date = prod.est_dispatch_date || null;

        const selectedChambers = Array.isArray(prod.selectedChambers)
          ? prod.selectedChambers
          : [];

        if (!selectedChambers.length) {
          throw new Error(`No chambers selected for ${product_name}`);
        }

        /* NORMALIZE CHAMBERS */
        const normalizedIncoming = selectedChambers.map((c) => ({
          id: String(c.id),
          add: Number(c.quantity ?? 0),
          rating: c.rating ?? client.company ?? "other",
        }));

        const chamberIds = normalizedIncoming.map((c) => c.id);

        const chamberInstances = await chamberClient.findAll({
          where: { id: chamberIds },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const chamberMap = new Map(
          chamberInstances.map((c) => [String(c.id), c])
        );

        /* CAPACITY CHECK */
        const insufficient = [];

        for (const inc of normalizedIncoming) {
          const chamber = chamberMap.get(inc.id);
          if (!chamber) {
            insufficient.push({ id: inc.id, reason: "chamber_not_found" });
            continue;
          }

          const capacity = Number(chamber.capacity ?? 0);
          const current = Number(chamber.current_stock ?? 0);
          const available = Math.max(0, capacity - current);

          if (inc.add > available) {
            insufficient.push({
              id: chamber.id,
              requested: inc.add,
              available,
              capacity,
            });
          }
        }

        if (insufficient.length) {
          const err = new Error("Insufficient chamber capacity");
          err.details = insufficient;
          throw err;
        }

        /* CHAMBER STOCK UPSERT */
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
              chamber: normalizedIncoming.map((c) => ({
                id: c.id,
                quantity: String(c.add),
                rating: c.rating,
              })),
            },
            { transaction: t }
          );
        } else {
          let chamberList = Array.isArray(stock.chamber)
            ? stock.chamber.map((c) => ({
                id: String(c.id),
                quantity: String(c.quantity ?? "0"),
                rating: c.rating,
              }))
            : [];

          for (const inc of normalizedIncoming) {
            const idx = chamberList.findIndex((c) => c.id === inc.id);
            if (idx >= 0) {
              chamberList[idx].quantity = String(
                Number(chamberList[idx].quantity) + inc.add
              );
            } else {
              chamberList.push({
                id: inc.id,
                quantity: String(inc.add),
                rating: inc.rating,
              });
            }
          }

          await stock.update({ chamber: chamberList }, { transaction: t });
        }

        /* LINK STOCK TO CHAMBERS */
        for (const ch of normalizedIncoming) {
          const chamber = chamberMap.get(ch.id);
          if (chamber) {
            chamber.items = normalizeItems(chamber.items);
            if (!chamber.items.includes(String(stock.id))) {
              chamber.items.push(String(stock.id));
              await chamber.save({ transaction: t });
            }
          }
        }

        /* OTHERS ITEM UPSERT */
        const stored_quantity = normalizedIncoming.reduce(
          (s, c) => s + Math.max(0, c.add),
          0
        );

        const existingItem = await otherItemClient.findOne({
          where: {
            client_id: client.id,
            product_id: stock.id,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        const finalImage =
          uploadedImageUrl ||
          (typeof prod.sample_image === "string"
            ? prod.sample_image
            : null);

        if (existingItem) {
          await existingItem.update(
            {
              stored_quantity,
              rent,
              est_dispatch_date,
              sample_image: finalImage ?? existingItem.sample_image,
            },
            { transaction: t }
          );
        } else {
          await otherItemClient.create(
            {
              client_id: client.id,
              product_id: stock.id,
              stored_quantity,
              rent,
              stored_date: new Date(),
              est_dispatch_date,
              sample_image: finalImage,
              history: [],
            },
            { transaction: t }
          );
        }

        clientProductIds.push(stock.id);
      }

      /* UPDATE CLIENT PRODUCTS */
      await client.update(
        { products: clientProductIds },
        { transaction: t }
      );

      await t.commit();

      const freshClient = await thirdPartyClient.findByPk(client.id);

      return res.status(200).json(freshClient);
    } catch (err) {
      await t.rollback();
      console.error("PATCH error:", err);

      if (err.details) {
        return res.status(400).json({
          error: err.message,
          details: err.details,
        });
      }

      return res.status(500).json({
        error: err.message || "Internal server error",
      });
    }
  }
);

  router.delete("/:id", async (req, res) => {
    try {
      const client = await thirdPartyClient.findByPk(req.params.id);
      if (!client) return res.status(404).json({ error: "Not found" });
      await client.destroy();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  module.exports = router;
