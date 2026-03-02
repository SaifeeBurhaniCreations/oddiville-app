const router = require("express").Router();
const {
  DryWarehouse: DryWarehousesClient,
  Chambers: chamberClient,
} = require("../../models");
const { uploadToS3 } = require("../../services/s3Service");
const upload = require("../../middlewares/upload");

const normalize = (s) => String(s || "").trim().toLowerCase();

async function rebuildChamberItems(chamberId, transaction=null) {
  const items = await DryWarehousesClient.findAll({
    where: { chamber_id: chamberId },
    attributes: ["id"],
    raw: true,
    transaction
  });

  await chamberClient.update(
    { items: items.map(i => i.id) },
    { where: { id: chamberId }, transaction }
  );
}
    const COUNTABLE_UNITS = ["pcs","box","set","roll","bundle","pack"];

// CREATE
router.post("/", upload.single("sample_image"), async (req, res) => {
  try {
const {
  item_type = "dry",
  item_name,
  product_name,
  sku_size,
  sku_unit,
  warehoused_date,
  description,
  quantity,
  chamber_id,
  unit,
  unit_weight_grams
} = req.body;

    if (!item_type || !warehoused_date || !chamber_id || !unit?.trim()) {
  return res.status(400).json({ error: "Missing required fields." });
}

if (item_type === "dry" && !item_name) {
  return res.status(400).json({ error: "Dry item requires item_name." });
}

if (item_type === "packaging") {
  if (!product_name || !sku_size || !sku_unit) {
    return res.status(400).json({
      error: "Packaging requires product_name, sku_size and sku_unit."
    });
  }
}

    const normalizedUnit = normalize(unit);
const normalizedItemType = normalize(item_type);
const normalizedName = item_name ? normalize(item_name) : null;
const normalizedProduct = product_name ? normalize(product_name) : null;
const normalizedSkuUnit = sku_unit ? normalize(sku_unit) : null;

const numericQty = Number(quantity);
if (!Number.isFinite(numericQty) || numericQty <= 0)
  return res.status(400).json({ error: "Quantity must be a valid positive number" });


if (COUNTABLE_UNITS.includes(normalizedUnit)) {
  if (!unit_weight_grams || Number(unit_weight_grams) <= 0) {
    return res.status(400).json({
      error: "unit_weight_grams required for count-based units"
    });
  }
}

    const chamber = await chamberClient.findOne({
      where: { id: chamber_id }
    });

    if (!chamber) {
      return res.status(404).json({
        error: `Chamber '${chamber_id}' not found`,
      });
    }

    let sample_image = null;
    if (req.file) {
      const uploaded = await uploadToS3({ file: req.file, folder: "warehouses/dry" });
      sample_image = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    const parsedDate = new Date(warehoused_date);
    if (isNaN(parsedDate.getTime()))
      return res.status(400).json({ error: "Invalid warehoused_date" });

    const existing = await DryWarehousesClient.findOne({
      where: {
        item_type: normalizedItemType,
        item_name: normalizedName,
        product_name: normalizedProduct,
        sku_size: sku_size || null,
        sku_unit: normalizedSkuUnit,
        chamber_id: chamber.id,
        unit: normalizedUnit
      }
    });

    if (existing) {

      const incomingWeight = COUNTABLE_UNITS.includes(normalizedUnit)
  ? Number(unit_weight_grams)
  : null;

const existingWeight = existing.unit_weight_grams == null
  ? null
  : Number(existing.unit_weight_grams);

if (existingWeight !== incomingWeight) {
  return res.status(400).json({
    error: "Same item exists with different unit weight"
  });
}

  await existing.increment("quantity", {
    by: numericQty,
  });

  await existing.reload();

  return res.status(200).json({
    message: "Stock increased",
    data: existing
  });
}

    let newItem;

    try {
newItem = await DryWarehousesClient.create({
  item_type: normalizedItemType,
  item_name: normalizedName,
  product_name: normalizedProduct,
  sku_size: sku_size || null,
  sku_unit: normalizedSkuUnit,
  warehoused_date: parsedDate,
  description,
  quantity: numericQty,
  unit: normalizedUnit,
  unit_weight_grams: COUNTABLE_UNITS.includes(normalizedUnit)
    ? Number(unit_weight_grams)
    : null,
  sample_image,
  chamber_id: chamber.id,
});

    } catch (err) {

      if (err.name === "SequelizeUniqueConstraintError") {

  const retry = await DryWarehousesClient.findOne({
    where: {
  item_type: normalizedItemType,
  item_name: normalizedName,
  product_name: normalizedProduct,
  sku_size: sku_size || null,
  sku_unit: normalizedSkuUnit,
  chamber_id: chamber.id,
  unit: normalizedUnit
}
  });

const retryIncomingWeight = COUNTABLE_UNITS.includes(normalizedUnit)
  ? Number(unit_weight_grams)
  : null;

const retryExistingWeight = retry.unit_weight_grams == null
  ? null
  : Number(retry.unit_weight_grams);

if (retryExistingWeight !== retryIncomingWeight) {
  return res.status(400).json({
    error: "Same item exists with different unit weight"
  });
}

  await retry.increment("quantity", { by: numericQty });
  await retry.reload();

  return res.status(200).json({
    message: "Stock increased (race condition handled)",
    data: retry
  });
}

      throw err;
    }

    await rebuildChamberItems(chamber.id);

    res.status(201).json({
      ...newItem.toJSON(),
      chamber_name: chamber.chamber_name
    });
  } catch (error) {
    console.error("Create Dry Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const items = await DryWarehousesClient.findAll({
      include: [
        { model: chamberClient, as: "chamber", attributes: ["chamber_name"] },
      ],
    });

    const result = items.map((item) => ({
      ...item.toJSON(),
      chamber_name: item.chamber?.chamber_name,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Get All Dry Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// GET /summary
router.get("/summary", async (req, res) => {
  try {

    const chambers = await chamberClient.findAll({
      attributes: ["id", "chamber_name", "capacity"],
      raw: true,
    });

    const chamberIds = chambers.map(c => c.id);

    const dryRows = await DryWarehousesClient.findAll({
      where: { chamber_id: chamberIds },
      attributes: ["id", "chamber_id", "quantity", "unit", "item_name"],
      raw: true,
    });


    const summariesMap = new Map();

    for (const row of dryRows) {
      const cid = String(row.chamber_id);

      const cur = summariesMap.get(cid) ?? {
        itemsCount: 0,
        units: {}
      };

      const unit = row.unit || "unknown";

      const slotUnits = ["pcs", "box", "set", "roll", "bundle", "pack"];

      if (slotUnits.includes(unit) && Number(row.quantity) > 0)
          cur.itemsCount += 1;

      cur.units[unit] = (cur.units[unit] || 0) + Number(row.quantity || 0);

      summariesMap.set(cid, cur);
    }

    const summaries = chambers.map((ch) => {
      const cid = String(ch.id);
      const agg = summariesMap.get(cid) ?? { units: {}, itemsCount: 0 };

      const used = agg.itemsCount;
      const capacity = ch.capacity || 0;

      return {
        chamberId: cid,
        chamberName: ch.chamber_name,
        capacity,
        usedSlots: used,
        occupancyPercent: capacity ? Math.round((used / capacity) * 100) : 0,
        quantitiesByUnit: agg.units,
        freeSlots: Math.max(capacity - used, 0)
      };

    });

    return res.status(200).json({
      summaries,
      totalChambers: summaries.length,
    });
  } catch (error) {
    console.error("Get DryWarehousesClient summary error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// READ BY ID
router.get("/:id", async (req, res) => {
  try {
    const item = await DryWarehousesClient.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found." });

    res.status(200).json(item);
  } catch (error) {
    console.error("Get Dry By ID Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { chamber_id: newChamberId } = req.body;

    const existingItem = await DryWarehousesClient.findByPk(id);
    if (!existingItem) {
      return res.status(404).json({ error: "Item not found." });
    }
    if (req.body.quantity !== undefined && Number(req.body.quantity) < 0)
      return res.status(400).json({ error: "Quantity cannot be negative" });

    if (req.body.item_name !== undefined && !req.body.item_name.trim())
      return res.status(400).json({ error: "Item name cannot be empty" });

    const oldChamberId = existingItem.chamber_id;

    let newDate = existingItem.warehoused_date;
    if (req.body.warehoused_date !== undefined) {
      const d = new Date(req.body.warehoused_date);
      if (isNaN(d.getTime()))
        return res.status(400).json({ error: "Invalid warehoused_date" });
      newDate = d;
    }

    if (newChamberId !== undefined) {
      const newChamberCheck = await chamberClient.findByPk(newChamberId);
      if (!newChamberCheck)
        return res.status(400).json({ error: "Target chamber does not exist" });
    }

    const isStructureChanged =
  req.body.item_type !== undefined ||
  req.body.item_name !== undefined ||
  req.body.product_name !== undefined ||
  req.body.sku_size !== undefined ||
  req.body.sku_unit !== undefined;

if (isStructureChanged) {
      if (
      req.body.unit &&
      req.body.unit !== existingItem.unit &&
      Number(existingItem.quantity) > 0
    ) {
      return res.status(400).json({
        error: "Cannot change unit while stock exists"
      });
    }

      const duplicate = await DryWarehousesClient.findOne({
       where: {
  item_type: req.body.item_type ?? existingItem.item_type,
  item_name: req.body.item_name
    ? normalize(req.body.item_name)
    : existingItem.item_name,
  product_name: req.body.product_name
    ? normalize(req.body.product_name)
    : existingItem.product_name,
  sku_size: req.body.sku_size ?? existingItem.sku_size,
  sku_unit: req.body.sku_unit
    ? normalize(req.body.sku_unit)
    : existingItem.sku_unit,
  unit: req.body.unit
    ? normalize(req.body.unit)
    : existingItem.unit,
  chamber_id: newChamberId ?? existingItem.chamber_id,
}
      });


if (duplicate && duplicate.id !== existingItem.id) {

await duplicate.increment("quantity", { by: existingItem.quantity });

await existingItem.destroy();

await rebuildChamberItems(duplicate.chamber_id);
await rebuildChamberItems(existingItem.chamber_id);


  return res.json({
    message: "Items merged due to rename",
    mergedInto: duplicate.id
  });
}

    }

    const allowed = {};

    if (req.body.item_name !== undefined)
      allowed.item_name = normalize(req.body.item_name);

    if (req.body.description !== undefined)
      allowed.description = req.body.description;

    if (req.body.item_type !== undefined)
      allowed.item_type = normalize(req.body.item_type);

    if (req.body.product_name !== undefined)
      allowed.product_name = normalize(req.body.product_name);

    if (req.body.sku_size !== undefined)
      allowed.sku_size = req.body.sku_size;

    if (req.body.sku_unit !== undefined)
      allowed.sku_unit = normalize(req.body.sku_unit);

    if (req.body.quantity !== undefined)
      return res.status(400).json({
        error: "Direct quantity editing not allowed. Use stock adjustment."
      });

    if (req.body.unit !== undefined)
      allowed.unit = normalize(req.body.unit);

    allowed.warehoused_date = newDate;
    allowed.chamber_id = newChamberId ?? existingItem.chamber_id;

let count, updatedItem;

if (
  req.body.item_type &&
  normalize(req.body.item_type) !== existingItem.item_type &&
  Number(existingItem.quantity) > 0
) {
  return res.status(400).json({
    error: "Cannot change item type while stock exists"
  });
}

try {
  const result = await DryWarehousesClient.update(allowed, {
    where: { id },
    returning: true,
  });

  count = result[0];
  updatedItem = result[1][0];

} catch (err) {
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      error: "Item with same name, unit and chamber already exists"
    });
  }
  throw err;
}

if (count === 0)
  return res.status(404).json({ error: "Item not found." });

if (newChamberId !== undefined && newChamberId !== oldChamberId) {
  await rebuildChamberItems(oldChamberId);
  await rebuildChamberItems(newChamberId);
}

    res
      .status(200)
      .json({ message: "Updated successfully", data: updatedItem });
  } catch (error) {
    console.error("Update Dry Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const item = await DryWarehousesClient.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found." });

    if (Number(item.quantity) > 0)
      return res.status(400).json({
        error: "Cannot delete item with remaining stock. Set quantity to 0 first."
      });

await item.destroy();

if (item.chamber_id) {
  await rebuildChamberItems(item.chamber_id);
}

    res.status(200).json({ message: "Deleted successfully", data: item });
  } catch (error) {
    console.error("Delete Dry Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;