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

    const incomingPackaging = packages.map((p) =>
      buildPackedPackaging(p, normalizedType)
    );

    const chamberIds = chambers.map((c) => String(c.id));
    const chambersFromDB = await Chambers.findAll({
      where: { id: { [Op.in]: chamberIds } },
      transaction: t,
    });

    const dryChambers = new Set(
      chambersFromDB.filter((c) => c.tag === "dry").map((c) => String(c.id))
    );

    const incomingChambers = chambers
      .filter((c) => !dryChambers.has(String(c.id)))
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

    let stock = await ChamberStock.findOne({
      where: { product_name, category: "packed", rating: String(rating) },
      transaction: t,
    });

    if (!stock) {
      stock = await ChamberStock.create(
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
      /* ---- CHAMBER UPSERT (id + rating) ---- */
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
      const rawStock = await ChamberStock.findOne({
        where: { product_name: raw.product_name, category: "material" },
        transaction: t,
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

    /* -------- DRY WAREHOUSE DEDUCTION -------- */

    const usageBySize = {};
    for (const p of packageList) {
      usageBySize[p.size] =
        (usageBySize[p.size] || 0) + Number(p.quantity);
    }

    for (const size in usageBySize) {
      const dry = await DryWarehouse.findOne({
        where: { item_name: `${product_name}:${size}` },
        transaction: t,
      });

      if (!dry) throw new Error(`Dry item missing: ${size}`);

      dry.quantity_unit = String(
        Math.max(0, Number(dry.quantity_unit) - usageBySize[size] / 1000)
      );

      await dry.save({ transaction: t });
    }

    /* -------- PACKAGES TYPES DEDUCTION -------- */

    const pkgRow = await Packages.findOne({
      where: { product_name },
      transaction: t,
    });

    if (pkgRow?.types) {
      const updated = pkgRow.types.map((t) => {
        const used = usageBySize[String(t.size)] || 0;
        const remaining = Math.max(0, Number(t.quantity) * 1000 - used) / 1000;
        return { ...t, quantity: String(remaining) };
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