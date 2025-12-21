const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Chambers: chambersClient,
  ChamberStock: chamberStockClient,
  DryWarehouse,
  Packages: packagesClient,
  sequelize,
} = require("../models");
require("dotenv").config();
const { uploadToS3, deleteFromS3 } = require("../services/s3Service");  
const upload = require("../middlewares/upload");
// chamber-stock/packed-item

const parsedPackages = async ({ packages, product_name, transaction }) => {
  if (!Array.isArray(packages)) return [];

  const result = [];

  for (const pkg of packages) {
    const dryItemName = `${product_name}:${pkg.size}`;

    const dryPackage = await DryWarehouse.findOne({
      where: {
        item_name: dryItemName,
        unit: pkg.unit || "gm",
      },
      transaction,
    });

    result.push({
      size: pkg.size,
      unit: pkg.unit,
      rawSize: pkg.rawSize,
      quantity: pkg.quantity,      
      dry_item_id: dryPackage ? dryPackage.id : null,
    });
  }

  return result;
};

router.get("/", async (req, res) => {
  try {
    const packedItemChamberStock = await chamberStockClient.findAll({
      where: { category: "packed" },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const dryChambers = await chambersClient.findAll({
      where: { tag: "dry" },
      raw: true,
    });

    const dryIds = new Set(dryChambers.map((c) => String(c.id)));

    const cleaned = packedItemChamberStock
      .map((item) => {
        const chamber = Array.isArray(item.chamber) ? item.chamber : [];

        const filteredChambers = chamber.filter(
          (c) => !dryIds.has(String(c.id))
        );

        return {
          ...item,
          chamber: filteredChambers,
        };
      })
      .filter((item) => item.chamber.length > 0);

    console.log("cleaned", JSON.stringify(cleaned, null, 2));
    return res.status(200).json(cleaned);
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
  const t = await sequelize.transaction();

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
      await t.rollback();
      return res.status(400).json({
        error: "product_name, unit and chambers are required.",
      });
    }

    const validChambers = chambers.filter(
      (c) => c?.id && !isNaN(Number(c.quantity))
    );

    if (!validChambers.length) {
      await t.rollback();
      return res.status(400).json({
        error: "Invalid chamber payload.",
      });
    }

    const packageList = await parsedPackages({
      packages,
      product_name,
      transaction: t,
    });

    const chamberIds = validChambers.map((c) => String(c.id));

    const chambersFromDB = await chambersClient.findAll({
      where: { id: { [Op.in]: chamberIds } },
      transaction: t,
    });

    if (!chambersFromDB.length) {
      await t.rollback();
      return res.status(404).json({ error: "Chambers not found." });
    }

    const dryChamberIds = new Set(
      chambersFromDB.filter(c => c.tag === "dry").map(c => String(c.id))
    );

    const newChamberData = validChambers
      .filter(c => !dryChamberIds.has(String(c.id)))
      .map(c => ({
        id: String(c.id),
        quantity: String(c.quantity),
        rating: "5",
      }));

    if (!newChamberData.length) {
      await t.rollback();
      return res.status(400).json({
        error: "Packed items must be stored in non-dry chambers.",
      });
    }

    // CREATE / UPDATE PACKED STOCK 
    let packedStock = await chamberStockClient.findOne({
      where: { product_name, category: "packed" },
      transaction: t,
    });

    if (packedStock) {
      const merged = [...(packedStock.chamber || [])];

      for (const incoming of newChamberData) {
        const idx = merged.findIndex(c => c.id === incoming.id);
        if (idx >= 0) {
          merged[idx].quantity = String(
            Number(merged[idx].quantity) + Number(incoming.quantity)
          );
        } else {
          merged.push(incoming);
        }
      }

      await packedStock.update(
        {
          unit,
          image: image || packedStock.image,
          chamber: merged,
          packages: packageList.length ? packageList : packedStock.packages,
        },
        { transaction: t }
      );
    } else {
      packedStock = await chamberStockClient.create(
        {
          product_name,
          category: "packed",
          unit,
          image: image || null,
          chamber: newChamberData,
          packages: packageList.length ? packageList : null,
        },
        { transaction: t }
      );
    }

    // RAW MATERIAL DEDUCTION
    for (const raw of Array.isArray(rawProducts) ? rawProducts : []) {
      const rawStock = await chamberStockClient.findOne({
        where: { product_name: raw.product_name, category: "material" },
        transaction: t,
      });

      if (!rawStock) continue;

      const updatedChambers = rawStock.chamber.map(c => {
        const used = raw.chambers?.find(u => String(u.id) === String(c.id));
        if (!used) return c;

        return {
          ...c,
          quantity: String(
            Math.max(0, Number(c.quantity) - Number(used.quantity))
          ),
        };
      });

      await rawStock.update(
        { chamber: updatedChambers },
        { transaction: t }
      );
    }

    // DRY WAREHOUSE DEDUCTION
    const usageBySize = {};

for (const pkg of packageList) {
  const key = String(pkg.size);
  usageBySize[key] = (usageBySize[key] || 0) + Number(pkg.quantity || 0);
}

    for (const pkg of packageList) {
      const count = Number(pkg.quantity || 0);
      if (count <= 0) continue;

      const unitLower = (pkg.unit || "").toLowerCase();
      const emptyBagGram = unitLower === "kg" ? 1.5 : 1;
      const usedKg = (count * emptyBagGram) / 1000;

      const dryItemName = `${product_name}:${pkg.size}`;

      const dryItem = await DryWarehouse.findOne({
        where: { item_name: dryItemName, unit: unitLower || "gm" },
        transaction: t,
      });

      if (!dryItem) {
        await t.rollback();
        return res.status(400).json({
          error: `DryWarehouse item not found: ${dryItemName}`,
        });
      }

      dryItem.quantity_unit = String(
        Math.max(0, Number(dryItem.quantity_unit) - usedKg)
      );

      await dryItem.save({ transaction: t });
    }

    // PACKAGES.TYPES DEDUCTION
    const packageRow = await packagesClient.findOne({
      where: { product_name },
      transaction: t,
    });

    if (packageRow && Array.isArray(packageRow.types)) {

      const updatedTypes = packageRow.types.map(type => {
            const used = usageBySize[String(type.size)] || 0;
            if (!used) return type;
            if (used > Number(type.quantity)) {
              throw new Error(
                `Insufficient package stock for size ${type.size}`
              );
            }

            return {
              ...type,
              quantity: String(
                Math.max(0, Number(type.quantity || 0) - used)
              ),
            };
          });

      await packageRow.update(
        { types: updatedTypes },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json(packedStock);

  } catch (error) {
    await t.rollback();
    console.error("PACK ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// router.post("/", async (req, res) => {
//   try {
//     const {
//       product_name,
//       unit,
//       image,
//       chambers,  
//       rawProducts,
//       packages = [], 
//     } = req.body;

//     if (
//       !product_name ||
//       !unit ||
//       !Array.isArray(chambers) ||
//       chambers.length === 0
//     ) {
//       return res.status(400).json({
//         error:
//           "product_name, unit and chambers (with id & quantity) are required.",
//       });
//     }

//     const validChambers = chambers.filter(
//       (c) => c && c.id != null && !isNaN(Number(c.quantity))
//     );

//     if (validChambers.length === 0) {
//       return res.status(400).json({
//         error: "Each chamber must contain id and a valid numeric quantity.",
//       });
//     }

//     const packageList = Array.isArray(packages) ? packages : [];

//     const chamberIds = validChambers.map((c) => String(c.id));

//     const existing = await chamberStockClient.findOne({
//       where: { product_name, category: "packed" },
//     });

//     const chambersFromDB = await chambersClient.findAll({
//       where: { id: { [Op.in]: chamberIds } },
//     });

//     if (!chambersFromDB || chambersFromDB.length === 0) {
//       return res.status(404).json({
//         error: "No chambers found for requested IDs.",
//       });
//     }

//     const foundIds = new Set(chambersFromDB.map((c) => String(c.id)));
//     const missingIds = chamberIds.filter((id) => !foundIds.has(String(id)));

//     if (missingIds.length > 0) {
//       return res.status(400).json({
//         error: `Some chambers are invalid: ${missingIds.join(", ")}`,
//       });
//     }

//     const newChamberData = validChambers.map((c) => ({
//       id: String(c.id),
//       quantity: String(c.quantity),
//       rating: "5",
//     }));

//     let packedItemChamberStock;

//     if (existing) {
//       const mergedChambers = [...(existing.chamber || [])];

//       for (const incoming of newChamberData) {
//         const idx = mergedChambers.findIndex(
//           (c) => String(c.id) === String(incoming.id)
//         );

//         if (idx >= 0) {
//           const prevQty = Number(mergedChambers[idx].quantity || 0);
//           const addQty = Number(incoming.quantity || 0);

//           mergedChambers[idx] = {
//             ...mergedChambers[idx],
//             quantity: String(prevQty + addQty),
//             rating: mergedChambers[idx].rating ?? incoming.rating ?? "5",
//           };
//         } else {
//           mergedChambers.push(incoming);
//         }
//       }

//       await existing.update({
//         unit,
//         image: image || existing.image,
//         chamber: mergedChambers,
//       });

//       packedItemChamberStock = existing;
//     } else {
//       packedItemChamberStock = await chamberStockClient.create({
//         product_name,
//         category: "packed",
//         unit,
//         image: image || null,
//         chamber: newChamberData,
//       });
//     }

//     for (const chamber of chambersFromDB) {
//       const itemsSet = new Set(chamber.items || []);
//       itemsSet.add(packedItemChamberStock.id);

//       chamber.items = Array.from(itemsSet);
//       await chamber.save();
//     }

//     // --- RAW MATERIAL DEDUCTION
//     const rawProductsArray = Array.isArray(rawProducts) ? rawProducts : [];

//     for (const raw of rawProductsArray) {
//       const rawStock = await chamberStockClient.findOne({
//         where: {
//           product_name: raw.product_name,
//           category: "material",
//         },
//       });

//       if (!rawStock) continue;

//       const updatedChamber = (rawStock.chamber || []).map((c) => {
//         const used = (raw.chambers || []).find(
//           (u) => String(u.id) === String(c.id)
//         );
//         if (!used) return c;

//         const remaining = Number(c.quantity) - Number(used.quantity);
//         return {
//           ...c,
//           quantity: String(Math.max(remaining, 0)),
//         };
//       });

//       await rawStock.update({ chamber: updatedChamber });
//     }

//     // --- PACKAGING DEDUCTION FROM DRY WAREHOUSE ---
//     try {
//       const totalPackedKg = validChambers.reduce(
//         (sum, c) => sum + Number(c.quantity || 0),
//         0
//       );

//       const packageList = Array.isArray(packages) ? packages : [];

//       const firstPkg = packageList[0];

//       if (!firstPkg) {
//         console.log("[PACKAGING] No packages in payload, skipping deduction.");
//       } else {
//         const sizeNum = Number(firstPkg.size);
//         const pkgUnit = (firstPkg.unit || "").toLowerCase();
//         const rawSize = firstPkg.rawSize || "";

//         let packageSizeGram = 250;
//         if (!Number.isNaN(sizeNum) && sizeNum > 0) {
//           if (pkgUnit === "kg") {
//             packageSizeGram = sizeNum * 1000;
//           } else {
//             packageSizeGram = sizeNum;
//           }
//         }

//         const emptyBagWeightGram = 1;

//         const piecesProduced =
//           packageSizeGram > 0 ? (totalPackedKg * 1000) / packageSizeGram : 0;

//         const packagingUsedKg =
//           (piecesProduced * emptyBagWeightGram) / 1000;

//         if (packagingUsedKg > 0) {
//           const dryItemName = `${product_name}:${sizeNum}`;

//           const packItem = await DryWarehouse.findOne({
//             where: {
//               item_name: dryItemName, 
//               unit: pkgUnit || "gm", 
//             },
//           });

//           if (packItem) {
//             const currentQtyKg = Number(packItem.quantity_unit || "0");
//             const remaining = Math.max(0, currentQtyKg - packagingUsedKg);

//             packItem.quantity_unit = String(remaining);
//             await packItem.save();
//           } else {
//             console.warn(
//               "[PACKAGING] No DryWarehouse row found for",
//               { item_name: dryItemName, unit: pkgUnit || "gm" }
//             );
//           }
//         }
//       }
//     } catch (pkgErr) {
//       console.warn("Failed to deduct packaging from dry warehouse:", pkgErr);
//     }

//     return res.status(201).json(packedItemChamberStock);
//   } catch (error) {
//     console.error(
//       "Error during creating packed chamber stock:",
//       error?.message || error
//     );
//     return res
//       .status(500)
//       .json({ error: "Internal server error, try later." });
//   }
// });

module.exports = router;