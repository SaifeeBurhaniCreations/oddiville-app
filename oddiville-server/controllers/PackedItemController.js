const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Chambers: chambersClient,
  ChamberStock: chamberStockClient,
  DryWarehouse,
} = require("../models");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3Client");
require("dotenv").config();
const upload = multer();

const uploadToS3 = async (file) => {
  const id = uuidv4();
  const fileKey = `chamber-stock/packed-item/${id}-${file.originalname}`;
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
    const packedItemChamberStock = await chamberStockClient.findAll({
      where: { category: "packed" },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    return res.status(200).json(packedItemChamberStock);
  } catch (error) {
    console.error(
      "Error during fetching packed items:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 10;
//     const offset = parseInt(req.query.offset) || 0;
//     const search = req.query.search || "";

//     const whereClause = {
//       category: "packed",   
//     };

//     if (search) {
//       whereClause.product_name = {
//         [Op.iLike]: `%${search}%`,
//       };
//     }

//     const packedItemChamberStock = await chamberStockClient.findAll({
//       where: whereClause,
//       limit,
//       offset,
//       order: [["createdAt", "DESC"]],
//       raw: true,
//     });

//     res.status(200).json(packedItemChamberStock);
//   } catch (error) {
//     console.error(
//       "Error during fetching packed items:",
//       error?.message || error
//     );
//     return res
//       .status(500)
//       .json({ error: "Internal server error, please try again later." });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const {
      product_name,
      unit,
      image,
      chambers,  
      rawProducts,
      packages = [], 
    } = req.body;

    if (
      !product_name ||
      !unit ||
      !Array.isArray(chambers) ||
      chambers.length === 0
    ) {
      return res.status(400).json({
        error:
          "product_name, unit and chambers (with id & quantity) are required.",
      });
    }

    const validChambers = chambers.filter(
      (c) => c && c.id != null && !isNaN(Number(c.quantity))
    );

    if (validChambers.length === 0) {
      return res.status(400).json({
        error: "Each chamber must contain id and a valid numeric quantity.",
      });
    }

    const packageList = Array.isArray(packages) ? packages : [];

    const chamberIds = validChambers.map((c) => String(c.id));

    const existing = await chamberStockClient.findOne({
      where: { product_name, category: "packed" },
    });

    const chambersFromDB = await chambersClient.findAll({
      where: { id: { [Op.in]: chamberIds } },
    });

    if (!chambersFromDB || chambersFromDB.length === 0) {
      return res.status(404).json({
        error: "No chambers found for requested IDs.",
      });
    }

    const foundIds = new Set(chambersFromDB.map((c) => String(c.id)));
    const missingIds = chamberIds.filter((id) => !foundIds.has(String(id)));

    if (missingIds.length > 0) {
      return res.status(400).json({
        error: `Some chambers are invalid: ${missingIds.join(", ")}`,
      });
    }

    const newChamberData = validChambers.map((c) => ({
      id: String(c.id),
      quantity: String(c.quantity),
      rating: "5",
    }));

    let packedItemChamberStock;

    if (existing) {
      const mergedChambers = [...(existing.chamber || [])];

      for (const incoming of newChamberData) {
        const idx = mergedChambers.findIndex(
          (c) => String(c.id) === String(incoming.id)
        );

        if (idx >= 0) {
          const prevQty = Number(mergedChambers[idx].quantity || 0);
          const addQty = Number(incoming.quantity || 0);

          mergedChambers[idx] = {
            ...mergedChambers[idx],
            quantity: String(prevQty + addQty),
            rating: mergedChambers[idx].rating ?? incoming.rating ?? "5",
          };
        } else {
          mergedChambers.push(incoming);
        }
      }

      await existing.update({
        unit,
        image: image || existing.image,
        chamber: mergedChambers,
      });

      packedItemChamberStock = existing;
    } else {
      packedItemChamberStock = await chamberStockClient.create({
        product_name,
        category: "packed",
        unit,
        image: image || null,
        chamber: newChamberData,
      });
    }

    for (const chamber of chambersFromDB) {
      const itemsSet = new Set(chamber.items || []);
      itemsSet.add(packedItemChamberStock.id);

      chamber.items = Array.from(itemsSet);
      await chamber.save();
    }

    // --- RAW MATERIAL DEDUCTION
    const rawProductsArray = Array.isArray(rawProducts) ? rawProducts : [];

    for (const raw of rawProductsArray) {
      const rawStock = await chamberStockClient.findOne({
        where: {
          product_name: raw.product_name,
          category: "material",
        },
      });

      if (!rawStock) continue;

      const updatedChamber = (rawStock.chamber || []).map((c) => {
        const used = (raw.chambers || []).find(
          (u) => String(u.id) === String(c.id)
        );
        if (!used) return c;

        const remaining = Number(c.quantity) - Number(used.quantity);
        return {
          ...c,
          quantity: String(Math.max(remaining, 0)),
        };
      });

      await rawStock.update({ chamber: updatedChamber });
    }

    // --- PACKAGING DEDUCTION FROM DRY WAREHOUSE ---
    try {
      const totalPackedKg = validChambers.reduce(
        (sum, c) => sum + Number(c.quantity || 0),
        0
      );

      const packageList = Array.isArray(packages) ? packages : [];

      const firstPkg = packageList[0];

      if (!firstPkg) {
        console.log("[PACKAGING] No packages in payload, skipping deduction.");
      } else {
        const sizeNum = Number(firstPkg.size);
        const pkgUnit = (firstPkg.unit || "").toLowerCase();
        const rawSize = firstPkg.rawSize || "";

        let packageSizeGram = 250;
        if (!Number.isNaN(sizeNum) && sizeNum > 0) {
          if (pkgUnit === "kg") {
            packageSizeGram = sizeNum * 1000;
          } else {
            packageSizeGram = sizeNum;
          }
        }

        const emptyBagWeightGram = 1;

        const piecesProduced =
          packageSizeGram > 0 ? (totalPackedKg * 1000) / packageSizeGram : 0;

        const packagingUsedKg =
          (piecesProduced * emptyBagWeightGram) / 1000;

        if (packagingUsedKg > 0) {
          const dryItemName = `${product_name}:${sizeNum}`;

          const packItem = await DryWarehouse.findOne({
            where: {
              item_name: dryItemName, 
              unit: pkgUnit || "gm", 
            },
          });

          console.log("[PACKAGING] DryWarehouse row:", packItem && {
            id: packItem.id,
            item_name: packItem.item_name,
            unit: packItem.unit,
            quantity_unit: packItem.quantity_unit,
          });

          if (packItem) {
            const currentQtyKg = Number(packItem.quantity_unit || "0");
            const remaining = Math.max(0, currentQtyKg - packagingUsedKg);

            console.log("[PACKAGING] currentQtyKg:", currentQtyKg);
            console.log("[PACKAGING] remainingQtyKg:", remaining);

            packItem.quantity_unit = String(remaining);
            await packItem.save();
          } else {
            console.warn(
              "[PACKAGING] No DryWarehouse row found for",
              { item_name: dryItemName, unit: pkgUnit || "gm" }
            );
          }
        }
      }
    } catch (pkgErr) {
      console.warn("Failed to deduct packaging from dry warehouse:", pkgErr);
    }

    return res.status(201).json(packedItemChamberStock);
  } catch (error) {
    console.error(
      "Error during creating packed chamber stock:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal server error, try later." });
  }
});

module.exports = router;