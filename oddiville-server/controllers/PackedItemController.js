const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Chambers: ChambersClient,
  ChamberStock: ChamberStockClient,
  DryWarehouse,
  Packages: packagesClient,
  sequelize,
} = require("../models");
require("dotenv").config();
const { getTareWeight } = require("../constants/tareWeight");

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

const buildPackageKey = (product, size) => `${product}:${size}`;

const mergeBy = (list, predicate, onFound, onNew) => {
  const copy = Array.isArray(list) ? [...list] : [];
  const found = copy.find(predicate);
  if (found) onFound(found);
  else copy.push(onNew());
  return copy;
};

const normalizeUnit = (u) => (u || "gm").toLowerCase();
const packetsToKg = ({ count, tare }) => (count * tare) / 1000;
/* ------------------------------------------------------------------ */
/* POST /packed                                                       */
/* ------------------------------------------------------------------ */

router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
const DEBUG_ROLLBACK = false;

  try {
    const {
      product_name,
      unit = "kg",
      image,
      rating = "5",
      type = "pouch",
      chambers = [],
      packages = [],
      rawProducts = [],
    } = req.body;

    if (!product_name || !packages.length || !chambers.length) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid payload" });
    }

    const normalizedType = type.trim().toLowerCase();

    /* -------------------------------------------------------------- */
    /* 1. PREPARE PACKAGES (COUNT ONLY)                               */
    /* -------------------------------------------------------------- */

    const preparedPackages = [];

    for (const p of packages) {
      const size = String(p.size);
      const unit = normalizeUnit(p.unit);

      const dryItem = await DryWarehouse.findOne({
        where: {
          item_name: buildPackageKey(product_name, size),
          unit: "kg",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      preparedPackages.push({
        size,
        unit,
        rawSize: p.rawSize,
        quantity: Number(p.quantity), // PACKET COUNT
        dry_item_id: dryItem ? dryItem.id : null,
      });
    }

    /* -------------------------------------------------------------- */
    /* 2. PREPARE PACKAGING (FOR PACKED STOCK)                        */
    /* -------------------------------------------------------------- */

    const incomingPackaging = packages.map((p) => ({
      size: { value: Number(p.size), unit: normalizeUnit(p.unit) },
      type: normalizedType,
      count: Number(p.quantity),
    }));

    /* -------------------------------------------------------------- */
    /* 3. PREPARE CHAMBERS (KG ONLY)                                  */
    /* -------------------------------------------------------------- */

    const chamberIds = chambers.map((c) => String(c.id));
    const dbChambers = await ChambersClient.findAll({
      where: { id: { [Op.in]: chamberIds } },
      transaction: t,
    });

    const dryIds = new Set(
      dbChambers.filter((c) => c.tag === "dry").map((c) => String(c.id))
    );

    const incomingChambers = chambers
      .filter((c) => !dryIds.has(String(c.id)))
      .map((c) => ({
        id: String(c.id),
        quantity: String(c.quantity), // KG
        rating: String(rating),
      }));

    if (!incomingChambers.length) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Packed items cannot go to dry chambers" });
    }

    /* -------------------------------------------------------------- */
    /* 4. UPSERT PACKED CHAMBER STOCK                                 */
    /* -------------------------------------------------------------- */

    let stock = await ChamberStockClient.findOne({
      where: { product_name, category: "packed" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!stock) {
      stock = await ChamberStockClient.create(
        {
          product_name,
          category: "packed",
          unit,
          image: image || null,
          chamber: incomingChambers,
          packages: preparedPackages,
          packaging: incomingPackaging,
        },
        { transaction: t }
      );
    } else {
      // MERGE CHAMBERS
      let mergedChambers = [...stock.chamber];
      for (const inc of incomingChambers) {
        mergedChambers = mergeBy(
          mergedChambers,
          (c) => c.id === inc.id,
          (c) => (c.quantity = String(Number(c.quantity) + Number(inc.quantity))),
          () => inc
        );
      }

      // MERGE PACKAGING
      let mergedPackaging = [...stock.packaging];
      for (const inc of incomingPackaging) {
        mergedPackaging = mergeBy(
          mergedPackaging,
          (p) =>
            p.size.value === inc.size.value &&
            p.size.unit === inc.size.unit &&
            p.type === inc.type,
          (p) => (p.count += inc.count),
          () => inc
        );
      }

      // MERGE PACKAGES (COUNT)
      let mergedPackages = [...(stock.packages || [])];
      for (const inc of preparedPackages) {
        mergedPackages = mergeBy(
          mergedPackages,
          (p) => p.size === inc.size && p.unit === inc.unit,
          (p) => (p.quantity += inc.quantity),
          () => inc
        );
      }

      await stock.update(
        {
          chamber: mergedChambers,
          packaging: mergedPackaging,
          packages: mergedPackages,
        },
        { transaction: t }
      );
    }

    /* -------------------------------------------------------------- */
    /* 5. DEDUCT RAW MATERIALS (KG)                                   */
    /* -------------------------------------------------------------- */

    for (const raw of rawProducts) {
      const rawStock = await ChamberStockClient.findOne({
        where: { product_name: raw.product_name, category: "material" },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!rawStock) continue;

      rawStock.chamber = rawStock.chamber.map((c) => {
        const used = raw.chambers?.find(
          (u) => String(u.id) === String(c.id)
        );
        if (!used) return c;
        return {
          ...c,
          quantity: String(
            Math.max(0, Number(c.quantity) - Number(used.quantity))
          ),
        };
      });

      await rawStock.save({ transaction: t });
    }

    /* -------------------------------------------------------------- */
    /* 6. DEDUCT EMPTY PACKAGING (DRY WAREHOUSE, KG)                  */
    /* -------------------------------------------------------------- */

    for (const p of preparedPackages) {
      const tare = getTareWeight({
        type: normalizedType,
        size: p.size,
        unit: p.unit,
      });

      const usedKg = (p.quantity * tare) / 1000;

      const dry = await DryWarehouse.findOne({
        where: {
          item_name: buildPackageKey(product_name, p.size),
          unit: "kg",
          unit: "kg",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const insufficient = !dry || Number(dry.quantity_unit) < usedKg;

      if (insufficient) {
        throw new Error(
          `Insufficient empty packaging for ${product_name}:${p.size}`
        );
      }

      dry.quantity_unit = String(Number(dry.quantity_unit) - usedKg);
      await dry.save({ transaction: t });
    }

    /* -------------------------------------------------------------- */
    /* 7. DEDUCT PACKAGES TABLE (COUNT)                               */
    /* -------------------------------------------------------------- */

    const pkgRow = await packagesClient.findOne({
      where: { product_name },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    // console.log("BEFORE pkgRow.types:", JSON.stringify(pkgRow?.types, null, 2));

    if (pkgRow?.types) {
       pkgRow.types = pkgRow.types.map((tp) => {
    const used = preparedPackages.find(
      (p) => String(p.size) === String(tp.size)
    );
    if (!used) return tp;

    const tare = getTareWeight({
      type: normalizedType,
      size: tp.size,
      unit: tp.unit,
    });

    const usedKg = packetsToKg({
      count: used.quantity,
      tare,
    });

    const availableKg = Number(tp.quantity);

    if (availableKg < usedKg) {
      throw new Error(
        `Insufficient package stock for ${tp.size}${tp.unit}`
      );
    }

    const remainingKg = Math.max(0, availableKg - usedKg);

    return {
      ...tp,
      quantity: remainingKg.toFixed(3), 
    };
  });

      // console.log("AFTER pkgRow.types:", JSON.stringify(pkgRow.types, null, 2));

      await pkgRow.save({ transaction: t });
    }
          
      if (DEBUG_ROLLBACK) {
        console.warn("⚠️ DEBUG MODE: rolling back transaction intentionally");
        await t.rollback();
        return res.status(409).json({
          debug: true,
          message: "Debug rollback – no data persisted",
        });
      }

    await t.commit();
    return res.status(201).json(stock);
  } catch (err) {
    await t.rollback();
    console.error("PACK ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => { 
  try {
    const packedItemChamberStock = await ChamberStockClient.findAll({
      where: { category: "packed" },
      order: [["createdAt", "DESC"]],
      raw: true,
    });

    const dryChambers = await ChambersClient.findAll({
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
        return { ...item, chamber: filteredChambers };
      })
      .filter((item) => item.chamber.length > 0);

    return res.status(200).json(cleaned);
  } catch (error) {
    console.error("Error during fetching packed items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;