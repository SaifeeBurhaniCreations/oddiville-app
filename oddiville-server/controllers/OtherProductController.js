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
  router.post("/", upload.single("sample_image"), async (req, res) => {
    const { name, company, address, phone } = req.body;

    let sampleImageId = null;
    let clientPlainResult = null;
    const stored_date = new Date();

    let products = [];
    try {
      const rawProducts = req.body.products ?? "[]";
      products = JSON.parse(rawProducts);
      if (!Array.isArray(products)) products = [];
    } catch (e) {
      console.error("Invalid products JSON:", e);
      return res.status(400).json({ error: "Invalid products payload" });
    }

    if (!products.length) {
      return res.status(400).json({ error: "No products provided" });
    }

    try {
      if (req.file) {
        const uploaded = await uploadToS3(req.file);
        sampleImageId = uploaded.url;
      }

      await sequelize.transaction(async (t) => {
        const client = await thirdPartyClient.create(
          {
            name,
            address,
            company,
            phone,
            products: [],
          },
          { transaction: t }
        );

        const clientProductsArray = [];

        for (const prod of products) {
          /* ------------------ PRODUCT LEVEL DATA ------------------ */
          const product_name = (prod.product_name ?? "").trim();
          const selectedChambers = Array.isArray(prod.selectedChambers)
            ? prod.selectedChambers
            : [];

          const productRent = Number(prod.rent);
          const est_dispatch_date = prod.est_dispatch_date ?? null;

          if (!product_name) {
            throw new Error("product_name missing for a product");
          }

          if (isNaN(productRent)) {
            throw new Error(`Invalid rent for product: ${product_name}`);
          }

          if (!selectedChambers.length) {
            throw new Error(`No chambers selected for product: ${product_name}`);
          }

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

          const normalizeItems = (items) =>
            Array.isArray(items) ? items.map((it) => String(it)) : [];

          /* ------------------ CAPACITY CHECK ------------------ */
          const insufficient = [];

          for (const incoming of normalizedIncoming) {
            const inst = chamberMap.get(incoming.id);
            if (!inst) {
              insufficient.push({
                id: incoming.id,
                reason: "chamber_not_found",
              });
              continue;
            }

            const capacity = Number(inst.capacity ?? 0);
            const currentStock = Number(
              inst.current_stock ?? inst.stored_quantity ?? 0
            );

            const netToAdd = Math.max(0, incoming.add - incoming.sub);
            const available = Math.max(0, capacity - currentStock);

            if (netToAdd > available) {
              insufficient.push({
                id: inst.id,
                name: inst.name,
                requested: netToAdd,
                available,
                capacity,
                currentStock,
              });
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
            const chamberDataForStock = normalizedIncoming.map((c) => ({
              id: c.id,
              quantity: String(Math.max(0, c.add - c.sub)),
              rating: c.rating,
            }));

            stock = await stockClient.create(
              {
                product_name,
                category: "other",
                unit: "kg",
                chamber: chamberDataForStock,
              },
              { transaction: t }
            );

            for (const { id } of chamberDataForStock) {
              const chamber = chamberMap.get(id);
              if (chamber) {
                chamber.items = normalizeItems(chamber.items);
                if (!chamber.items.includes(String(stock.id))) {
                  chamber.items.push(String(stock.id));
                  await chamber.save({ transaction: t });
                }
              }
            }
          } else {
            let chambersList = Array.isArray(stock.chamber) ? stock.chamber : [];

            chambersList = chambersList.map((ch) => ({
              id: String(ch.id),
              quantity: String(ch.quantity ?? "0"),
              rating: ch.rating,
            }));

            for (const incoming of normalizedIncoming) {
              const net = incoming.add - incoming.sub;

              const idx = chambersList.findIndex(
                (i) =>
                  String(i.id) === incoming.id &&
                  i.rating === incoming.rating
              );

              if (idx >= 0) {
                chambersList[idx].quantity = String(
                  Math.max(
                    0,
                    Number(chambersList[idx].quantity) + net
                  )
                );
              } else {
                chambersList.push({
                  id: incoming.id,
                  quantity: String(Math.max(0, net)),
                  rating: incoming.rating,
                });
              }

              const chamber = chamberMap.get(incoming.id);
              if (chamber) {
                chamber.items = normalizeItems(chamber.items);
                if (!chamber.items.includes(String(stock.id))) {
                  chamber.items.push(String(stock.id));
                  await chamber.save({ transaction: t });
                }
              }
            }

            await stockClient.update(
              { chamber: chambersList },
              { where: { id: stock.id }, transaction: t }
            );
          }

          /* ------------------ OTHERS ITEM (PER PRODUCT RENT) ------------------ */
          const stored_quantity = normalizedIncoming.reduce(
            (s, c) => s + Math.max(0, c.add - c.sub),
            0
          );

          await otherItemClient.create(
            {
              product_id: stock.id,
              client_id: client.id,
              stored_quantity,
              rent: productRent,
              stored_date,
              dispatched_date: null,
              est_dispatch_date,
              sample_image: sampleImageId,
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

        const clientPlain = client.get({ plain: true });
        clientPlain.products = clientProductsArray;
        clientPlainResult = clientPlain;
      });

      return res.status(201).json(clientPlainResult);
    } catch (err) {
      console.error("Server error:", err);

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
  });


  router.patch("/update-quantity/:othersItemId/:id", async (req, res) => {
    const { id: stockIdParam, othersItemId } = req.params;
    let { chambers = [], add_quantity = 0, sub_quantity = 0 } = req.body;

    try {
      add_quantity = Number(add_quantity || 0);
      sub_quantity = Number(sub_quantity || 0);
      chambers = Array.isArray(chambers) ? chambers : [];

      await sequelize.transaction(async (t) => {
        const stockRow = await stockClient.findByPk(stockIdParam, { transaction: t, lock: t.LOCK.UPDATE });
        if (!stockRow) throw Object.assign(new Error("Chamber stock not found"), { status: 404 });

        const item = await otherItemClient.findByPk(othersItemId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!item) throw Object.assign(new Error("OthersItem not found"), { status: 404 });

        const currentChambers = Array.isArray(stockRow.chamber) ? stockRow.chamber : [];

        const chamberIdsToLock = currentChambers
          .filter((sc) => chambers.includes(sc.id))
          .map((sc) => sc.id);

        const lockedChamberInstances = chamberIdsToLock.length
          ? await chamberClient.findAll({ where: { id: chamberIdsToLock }, transaction: t, lock: t.LOCK.UPDATE })
          : [];

        const chamberMap = new Map(lockedChamberInstances.map((c) => [String(c.id), c]));

        if (add_quantity > 0) {
          const insufficient = [];
          for (const stockChamber of currentChambers) {
            if (!chambers.includes(stockChamber.id)) continue;
            const inst = chamberMap.get(String(stockChamber.id));
            if (!inst) {
              insufficient.push({ id: stockChamber.id, reason: "chamber_not_found" });
              continue;
            }
            const capacity = Number(inst.capacity ?? 0);
            const currentStock = Number(inst.current_stock ?? inst.stored_quantity ?? 0);
            const netAdd = add_quantity;
            const available = Math.max(0, capacity - currentStock);
            if (netAdd > available) {
              insufficient.push({
                id: inst.id,
                name: inst.name,
                requested: netAdd,
                available,
                capacity,
                currentStock,
              });
            }
          }
          if (insufficient.length > 0) {
            const err = new Error("Insufficient chamber capacity for requested add_quantity");
            err.details = insufficient;
            throw err;
          }
        }

        const updatedChambers = currentChambers.map((stockChamber) => {
          if (!chambers.includes(stockChamber.id)) return stockChamber;
          let quantity = Number(stockChamber.quantity ?? 0);
          if (add_quantity) quantity += add_quantity;
          if (sub_quantity) quantity -= sub_quantity;
          if (quantity < 0) quantity = 0;
          return { ...stockChamber, quantity: quantity.toString() };
        });

        await stockClient.update({ chamber: updatedChambers }, { where: { id: stockRow.id }, transaction: t });

        let stored_quantity = Number(item.stored_quantity ?? 0);
        if (add_quantity) stored_quantity += add_quantity;
        if (sub_quantity) stored_quantity -= sub_quantity;
        if (stored_quantity < 0) stored_quantity = 0;

        await otherItemClient.update({ stored_quantity }, { where: { id: othersItemId }, transaction: t });

        const chamberMatch = updatedChambers.find((sc) => chambers.includes(sc.id));
        const chamberIdForHistory = chamberMatch ? chamberMatch.id : null;

        await historyClient.create(
          {
            product_id: item.id,
            deduct_quantity: sub_quantity,
            remaining_quantity: stored_quantity,
            chamber_id: chamberIdForHistory,
          },
          { transaction: t }
        );

      });

      const updatedStock = await stockClient.findByPk(stockIdParam, { raw: true });
      return res.status(200).json(updatedStock);
    } catch (error) {
      console.error("Error during update chamberStock by id:", error?.message || error);
      if (error && error.details) {
        return res.status(400).json({ error: error.message, details: error.details });
      }
      const status = error && error.status ? error.status : 500;
      return res.status(status).json({ error: error.message || "Internal server error, please try again later." });
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

  router.patch("/:id", async (req, res) => {
    try {
      const client = await thirdPartyClient.findByPk(req.params.id);
      if (!client) return res.status(404).json({ error: "Not found" });
      await client.update(req.body);
      res.json(client);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

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
