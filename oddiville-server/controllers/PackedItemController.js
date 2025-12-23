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


const parsedPackages = async ({ packages, product_name, transaction }) => {
  const result = [];

  for (const pkg of packages) {
    const dryItem = await DryWarehouse.findOne({
      where: {
        item_name: `${product_name}:${pkg.size}`,
        unit: pkg.unit || "gm",
      },
      transaction,
    });

    result.push({
      size: String(pkg.size),
      unit: pkg.unit || "gm",
      rawSize: pkg.rawSize,
      quantity: Number(pkg.quantity),
      dry_item_id: dryItem ? dryItem.id : null,
    });
  }

  return result;
};

const buildPackedPackaging = (pkg, type) => ({
  size: { value: Number(pkg.size), unit: pkg.unit || "gm" },
  type,
  count: Number(pkg.quantity),
});

const upsertPackaging = (existing, incoming) => {
  const list = Array.isArray(existing) ? [...existing] : [];

  for (const inc of incoming) {
    const found = list.find(
      (p) =>
        p.size.value === inc.size.value &&
        p.size.unit === inc.size.unit &&
        p.type === inc.type
    );

    found ? (found.count += inc.count) : list.push(inc);
  }
  return list;
};

const upsertPackages = (existing, incoming) => {
  const list = Array.isArray(existing) ? [...existing] : [];

  for (const inc of incoming) {
    const found = list.find(
      (p) => String(p.size) === String(inc.size) && p.unit === inc.unit
    );

    found
      ? (found.quantity = Number(found.quantity) + Number(inc.quantity))
      : list.push(inc);
  }
  return list;
};

const tareWeightByType = {
  pouch: [
    { max: 100, tare: 0.4 },
    { max: 250, tare: 0.6 },
    { max: 500, tare: 0.9 },
    { max: 1000, tare: 1.5 },
    { max: 2000, tare: 2.5 },
    { max: 5000, tare: 4 },
    { max: 10000, tare: 7 },
    { max: 25000, tare: 15 },
    { max: 30000, tare: 18 },
    { max: 50000, tare: 25 },
  ],
  bag: [
    { max: 1000, tare: 1 },
    { max: 5000, tare: 2 },
    { max: 25000, tare: 5 },
  ],
  box: [
    { max: 5000, tare: 3 },
    { max: 25000, tare: 8 },
    { max: Infinity, tare: 15 },
  ],
};

function getTareWeight({ type, size, unit }) {
  const sizeInGram =
    unit.toLowerCase() === "kg" ? Number(size) * 1000 : Number(size);

  const ranges = tareWeightByType[type];
  if (!ranges) return 1;

  const found = ranges.find((r) => sizeInGram <= r.max);
  return found ? found.tare : 1;
}

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
        return { ...item, chamber: filteredChambers };
      })
      .filter((item) => item.chamber.length > 0);

    return res.status(200).json(cleaned);
  } catch (error) {
    console.error("Error during fetching packed items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      product_name,
      unit,
      image,
      rating = "5",
      type = "bag",
      chambers = [],
      packages = [],
      rawProducts = [],
    } = req.body;

    if (!product_name || !unit || !rating || !packages.length || !chambers.length) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid payload" });
    }

    const normalizedType = type.trim().toLowerCase();

    /* -------- PREPARE DATA -------- */

    const packageList = await parsedPackages({
      packages,
      product_name,
      transaction: t,
    });

    /* 🔹 OPTIMIZATION: build once */
    const packageUnitMap = {};
    for (const p of packageList) {
      packageUnitMap[String(p.size)] = p.unit || "gm";
    }

    const incomingPackaging = packages.map((p) =>
      buildPackedPackaging(p, normalizedType)
    );

    const chamberIds = chambers.map((c) => String(c.id));
    const chambersFromDB = await chambersClient.findAll({
      where: { id: { [Op.in]: chamberIds } },
      transaction: t,
    });

    const dryChamberIds = new Set(
      chambersFromDB.filter((c) => c.tag === "dry").map((c) => String(c.id))
    );

    const incomingChambers = chambers
      .filter((c) => !dryChamberIds.has(String(c.id)))
      .map((c) => ({
        id: String(c.id),
        quantity: String(c.quantity),
        rating: String(rating),
      }));

    if (!incomingChambers.length) {
      await t.rollback();
      return res.status(400).json({ error: "Packed cannot be stored in dry chamber" });
    }

    /* -------- FIND OR CREATE PACKED STOCK (BY RATING) -------- */

    let stock = await chamberStockClient.findOne({
      where: { product_name, category: "packed", rating: String(rating) },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!stock) {
      stock = await chamberStockClient.create(
        {
          product_name,
          category: "packed",
          rating: String(rating),
          unit,
          image: image || null,
          chamber: incomingChambers,
          packages: packageList,
          packaging: incomingPackaging,
        },
        { transaction: t }
      );
    } else {
      const mergedChambers = [...(stock.chamber || [])];

      for (const inc of incomingChambers) {
        const found = mergedChambers.find(
          (c) => c.id === inc.id && c.rating === inc.rating
        );

        found
          ? (found.quantity = String(Number(found.quantity) + Number(inc.quantity)))
          : mergedChambers.push(inc);
      }

      await stock.update(
        {
          chamber: mergedChambers,
          packages: upsertPackages(stock.packages, packageList),
          packaging: upsertPackaging(stock.packaging, incomingPackaging),
        },
        { transaction: t }
      );
    }

    /* -------- RAW MATERIAL DEDUCTION -------- */

    for (const raw of rawProducts) {
      const rawStock = await chamberStockClient.findOne({
        where: { product_name: raw.product_name, category: "material" },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!rawStock) continue;

      const updated = rawStock.chamber.map((c) => {
        const used = raw.chambers?.find((u) => String(u.id) === String(c.id));
        if (!used) return c;

        return {
          ...c,
          quantity: String(Math.max(0, Number(c.quantity) - Number(used.quantity))),
        };
      });

      await rawStock.update({ chamber: updated }, { transaction: t });
    }

    /* DRY WAREHOUSE DEDUCTION */

    const usageBySize = {};
    for (const p of packageList) {
      usageBySize[p.size] =
        (usageBySize[p.size] || 0) + Number(p.quantity);
    }

    for (const size in usageBySize) {
      const dry = await DryWarehouse.findOne({
        where: {
          item_name: `${product_name}:${size}`,
          unit: packageUnitMap[String(size)] || "gm",
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!dry) {
        throw new Error(`Dry item missing for size ${size}`);
      }

      const tare = getTareWeight({
        type: normalizedType,
        size,
        unit: packageUnitMap[String(size)] || "gm",
      });

      const usedKg = (usageBySize[size] * tare) / 1000;

      const availableKg = Number(dry.quantity_unit);
      if (availableKg < usedKg) {
        throw new Error(`Insufficient dry stock for ${product_name}:${size}`);
      }

      dry.quantity_unit = String(Number(dry.quantity_unit) - usedKg);
      await dry.save({ transaction: t });
    }

    /* PACKAGES TYPES DEDUCTION */

    const pkgRow = await packagesClient.findOne({
      where: { product_name },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (pkgRow?.types) {
      const updated = pkgRow.types.map((tp) => {
        const usedPackets = usageBySize[String(tp.size)] || 0;

        const tare = getTareWeight({
          type: normalizedType,
          size: tp.size,
          unit: tp.unit || "gm",
        });

        const usedGram = usedPackets * tare;
        const availableGram = Number(tp.quantity) * 1000;

        if (usedGram > availableGram) {
          throw new Error(`Insufficient package stock for size ${tp.size}`);
        }

        return {
          ...tp,
          quantity: String((availableGram - usedGram) / 1000),
        };
      });

      await pkgRow.update({ types: updated }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json(stock);
  } catch (err) {
    await t.rollback();
    console.error("PACK ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;