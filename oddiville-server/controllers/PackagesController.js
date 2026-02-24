const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Packages,
  DryWarehouse: DryWarehouseClient,
  Chambers: ChambersClient,
  ChamberStock: ChamberStockClient,
  sequelize,
} = require("../models");
const { uploadToS3, deleteFromS3 } = require("../services/s3Service");
const { getTareWeight } = require("../constants/tareWeight"); 
const upload = require("../middlewares/upload");

const normalizeSize = (v) => String(v).trim();
const normalizeUnit = (v) => String(v).trim().toLowerCase();
const normalizeProduct = (v) => String(v).trim().toLowerCase();

const pouchKey = (product, size, unit) =>
  `${String(product).trim().toLowerCase()}:${normalizeSize(size)}${normalizeUnit(unit)}`;

// GET all packages
router.get("/", async (req, res) => {
  const search = req.query.search || "";

  const whereClause = {};

  if (search) {
    whereClause.product_name = {
  [Op.iLike]: `%${normalizeProduct(search)}%`,
};
  }
  try {
    const packages = await Packages.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET packages by product_name
router.get("/product/:productName", async (req, res) => {
  try {
    const { productName } = req.params;

    if (
  !productName ||
  productName === "Select product"
) {
  return res.status(400).json({
    error: "Invalid product name",
  });
}

const pkg = await Packages.findOne({
  where: { product_name: normalizeProduct(productName) },
  raw: true,
});

if (!pkg) {
  return res.status(404).json({ error: "No packages found for this product." });
}

return res.status(200).json(pkg);

  } catch (error) {
    console.error(
      "Error fetching packages by product_name:",
      error.message
    );
    return res.status(500).json({ error: "Internal server error." });
  }
});


// GET package by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });
    return res.status(200).json(pkg);
  } catch (error) {
    console.error("Error fetching package:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "package_image", maxCount: 1 },
  ]),
  async (req, res) => {
    let uploadedImage = null;
    let uploadedPackageImage = null;

    try {
      let { product_name, raw_materials, types, chamber_name } = req.body;

      if (typeof raw_materials === "string") raw_materials = JSON.parse(raw_materials);
      if (typeof types === "string") types = JSON.parse(types);

      product_name = normalizeProduct(product_name);
      chamber_name = chamber_name.trim();

      /* ---------- SAVE ORIGINAL POUCH COUNTS ---------- */
      const pouchCounts = {};
      types.forEach(tp => {
        const key = `${String(tp.size).trim()}${String(tp.unit).trim().toLowerCase()}`;
pouchCounts[key] = Number(tp.quantity);
      });

      /* ---------- CONVERT TO KG FOR PLASTIC ---------- */
      types = types.map(tp => {
        const tare = getTareWeight({ type: "pouch", size: tp.size, unit: tp.unit });
        const kg = (Number(tp.quantity) * tare) / 1000;
        return { size: normalizeSize(tp.size), unit: normalizeUnit(tp.unit), quantity: kg.toFixed(3) };
      });

      if (req.files?.image?.[0])
        uploadedImage = await uploadToS3({ file: req.files.image[0], folder: "packages" });

      if (req.files?.package_image?.[0])
        uploadedPackageImage = await uploadToS3({ file: req.files.package_image[0], folder: "packages" });

      const result = await sequelize.transaction(async (t) => {

        const pkg = await Packages.create({
          product_name,
          raw_materials,
          types,
          chamber_name,
          image: uploadedImage && { url: uploadedImage.url, key: uploadedImage.key },
          package_image: uploadedPackageImage && { url: uploadedPackageImage.url, key: uploadedPackageImage.key },
        }, { transaction: t });

        const chamber = await ChambersClient.findOne({ where: { chamber_name }, transaction: t });
        if (!chamber) throw new Error("Chamber not found");

        /* ---------- CREATE DRYWAREHOUSE POUCH COUNT ---------- */
        for (const tp of types) {
          const key = `${String(tp.size).trim()}${String(tp.unit).trim().toLowerCase()}`;
const count = pouchCounts[key] || 0;
          const item_name = pouchKey(product_name, tp.size, tp.unit);

          const [dryItem, created] = await DryWarehouseClient.findOrCreate({
            where: { item_name },
            defaults: {
              item_name,
              warehoused_date: new Date(),
              description: `${product_name} ${tp.size}${tp.unit} pouch`,
              chamber_id: chamber.id,
              quantity: count,
              unit: "pcs",
              unit_weight_grams: getTareWeight({ type: "pouch", size: tp.size, unit: tp.unit })
            },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          if (!created) {
            dryItem.quantity = Number(dryItem.quantity) + count;
            await dryItem.save({ transaction: t });
          }
        }

        return pkg;
      });

      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.patch("/:id/add-type", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { product_name, size, unit, quantity } = req.body;

    if (!size || quantity == null || !unit)
      throw new Error("Missing required fields");

    const numericQty = parseFloat(quantity);
    if (isNaN(numericQty)) throw new Error("Invalid quantity");

    const pkg = await Packages.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pkg) throw new Error("Package not found");

    let types = Array.isArray(pkg.types) ? [...pkg.types] : [];

    const exists = types.find(t =>
  normalizeSize(t.size) === normalizeSize(size) &&
  normalizeUnit(t.unit) === normalizeUnit(unit)
);

    if (exists) throw new Error("Type already exists. Use increase-quantity route.");

    const tare = getTareWeight({ type: "pouch", size, unit });
const kg = (numericQty * tare) / 1000;

types.push({ size: normalizeSize(size), unit: normalizeUnit(unit), quantity: kg.toFixed(3) });

    pkg.types = types;
    await pkg.save({ transaction: t });

    const chamber = await ChambersClient.findOne({
      where: { chamber_name: pkg.chamber_name },
      transaction: t
    });

    if (!chamber) throw new Error("Chamber not found");

    const itemName = pouchKey(pkg.product_name, size, unit);

    const [dryItem, created] = await DryWarehouseClient.findOrCreate({
      where: { item_name: itemName },
      defaults: {
        item_name: itemName,
        warehoused_date: new Date(),
        description: `${product_name} ${size}${unit}`,
        chamber_id: chamber.id,
        quantity: numericQty,
        unit: "pcs",
        unit_weight_grams: getTareWeight({ type: "pouch", size, unit })
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!created) {
      dryItem.quantity = Number(dryItem.quantity) + numericQty;
      await dryItem.save({ transaction: t });
    }

    await t.commit();
    return res.json({ success: true, pkg, dryItem });

  } catch (err) {
    await t.rollback();
    return res.status(400).json({ error: err.message });
  }
});

router.patch("/:id/increase-quantity", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { size, unit, quantity } = req.body;

    if (!size || !unit || quantity == null)
      throw new Error("Missing required fields");

    const numericQty = parseFloat(quantity);
    if (isNaN(numericQty)) throw new Error("Invalid quantity");

    const pkg = await Packages.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pkg) throw new Error("Package not found");

    let types = Array.isArray(pkg.types) ? [...pkg.types] : [];

    const index = types.findIndex(t => normalizeSize(t.size) === normalizeSize(size) &&
normalizeUnit(t.unit) === normalizeUnit(unit)
);
    if (index === -1) throw new Error("Type not found");

    const tare = getTareWeight({ type: "pouch", size, unit });
const addedKg = (numericQty * tare) / 1000;

types[index].quantity =
  (parseFloat(types[index].quantity) + addedKg).toFixed(3);

    pkg.types = types;
    await pkg.save({ transaction: t });

    const chamber = await ChambersClient.findOne({
      where: { chamber_name: pkg.chamber_name },
      transaction: t
    });

    if (!chamber) throw new Error("Chamber not found");

    const itemName = pouchKey(pkg.product_name, size, unit);

    const [dryItem] = await DryWarehouseClient.findOrCreate({
      where: { item_name: itemName },
      defaults: {
        item_name: itemName,
        warehoused_date: new Date(),
        chamber_id: chamber.id,
        quantity: 0,
        unit: "pcs",
        unit_weight_grams: getTareWeight({ type: "pouch", size, unit })
      },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    dryItem.quantity = Number(dryItem.quantity) + numericQty;
    await dryItem.save({ transaction: t });

    await t.commit();
    return res.json({ success: true, pkg, dryItem });

  } catch (err) {
    await t.rollback();
    return res.status(400).json({ error: err.message });
  }
});

router.delete("/delete/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const pkg = await Packages.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pkg) throw new Error("Package not found");

    // Prevent deletion if pouch stock exists
    for (const tp of pkg.types || []) {
      const itemName = pouchKey(pkg.product_name, tp.size, tp.unit);

      const dry = await DryWarehouseClient.findOne({
        where: { item_name: itemName },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (dry && Number(dry.quantity) > 0) {
        throw new Error(
          `Cannot delete package. Stock still exists for ${tp.size}${tp.unit}`
        );
      }

      // safe to delete empty SKU
      await DryWarehouseClient.destroy({
        where: { item_name: itemName },
        transaction: t
      });
    }

    // delete images
    if (pkg.image) await deleteFromS3(pkg.image.key);
    if (pkg.package_image) await deleteFromS3(pkg.package_image.key);

    await pkg.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Package deleted safely" });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

router.patch("/replace/type/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { size, unit, actual_quantity, reason = "manual adjustment" } = req.body;

    if (actual_quantity == null)
      throw new Error("actual_quantity required");

    const pkg = await Packages.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pkg) throw new Error("Package not found");

    const itemName = pouchKey(pkg.product_name, size, unit);

    const dry = await DryWarehouseClient.findOne({
      where: { item_name: itemName },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!dry) throw new Error("Dry warehouse entry missing");

    const systemQty = Number(dry.quantity);
    const physicalQty = Number(actual_quantity);
    const diff = physicalQty - systemQty;

    let types = Array.isArray(pkg.types) ? [...pkg.types] : [];
const index = types.findIndex(t => normalizeSize(t.size) === normalizeSize(size) &&
normalizeUnit(t.unit) === normalizeUnit(unit)
);

if (index === -1)
  throw new Error("SKU not found in package");

const tare = getTareWeight({ type: "pouch", size, unit });
const kg = (physicalQty * tare) / 1000;

types[index].quantity = kg.toFixed(3);

pkg.types = types;
await pkg.save({ transaction: t });

    dry.quantity = physicalQty;
    await dry.save({ transaction: t });

    console.log("STOCK ADJUSTMENT", {
      product: pkg.product_name,
      size,
      unit,
      before: systemQty,
      after: physicalQty,
      change: diff,
      reason
    });

    await t.commit();
    res.json({
      message: "Stock adjusted",
      before: systemQty,
      after: physicalQty,
      change: diff
    });

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

router.patch("/delete/type/:id", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { size, unit } = req.body;

    const pkg = await Packages.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!pkg) throw new Error("Package not found");

    const itemName = pouchKey(pkg.product_name, size, unit);

    const dry = await DryWarehouseClient.findOne({
      where: { item_name: itemName },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (dry && Number(dry.quantity) > 0)
      throw new Error("Cannot delete SKU while physical stock exists.");

const used = await ChamberStockClient.findAll({
  where: { product_name: pkg.product_name },
  transaction: t,
  lock: t.LOCK.UPDATE
});

const usedAnywhere = used.some(stock =>
  stock.packages?.some(p =>
    normalizeSize(p.size) === normalizeSize(size) &&
    normalizeUnit(p.unit) === normalizeUnit(unit)
  )
);

if (usedAnywhere)
  throw new Error("Cannot delete SKU already used in production history");

    pkg.types = pkg.types.filter(t => !(normalizeSize(t.size) === normalizeSize(size) &&
normalizeUnit(t.unit) === normalizeUnit(unit)
));
    await pkg.save({ transaction: t });

    await DryWarehouseClient.destroy({
  where: { item_name: itemName },
  transaction: t
});


    await t.commit();
    res.json(pkg);

  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


// await Packages.destroy({
//   where: {},
//   individualHooks: true,
// });

// await DryWarehouseClient.destroy({
//   where: {},
//   individualHooks: true,
// });