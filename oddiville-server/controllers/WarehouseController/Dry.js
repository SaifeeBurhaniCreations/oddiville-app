const router = require("express").Router();
const { DryWarehouse: DryWarehousesClient, Chambers: chamberClient } = require("../../models");
const { uploadToS3, deleteFromS3 } = require("../../services/s3Service");  
const upload = require("../../middlewares/upload");

const { Op } = require("sequelize");


// CREATE
router.post("/", upload.single("sample_image"), async (req, res) => {
  try {
    const {
      item_name,
      warehoused_date,
      description,
      quantity_unit,
      chamber_id
    } = req.body;

    if (!item_name || !warehoused_date || !chamber_id) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const chamber = await chamberClient.findOne({
      where: { chamber_name: chamber_id }
    });

    if (!chamber) {
      return res.status(404).json({
        error: `Chamber '${chamber_id}' not found`
      });
    }

    let sample_image = null;
    if (req.file) {
      const uploaded = await uploadToS3(req.file, "warehouses/dry");
      sample_image = {
        url: uploaded.url,
        key: uploaded.key
      };
    }

    const newItem = await DryWarehousesClient.create({
      item_name: item_name.trim(),
      warehoused_date: new Date(warehoused_date),
      description,
      quantity_unit,
      sample_image,
      chamber_id: chamber.id 
    });

    const currentItems = chamber.items || [];
    currentItems.push(newItem.id);
    chamber.items = currentItems;
    await chamber.save();

    res.status(201).json({...newItem, chamber_name: chamber.chamber_name});
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
        { model: chamberClient,
          as: "chamber",
          attributes: ["chamber_name"]
        }
      ]
    });

    const result = items.map(item => ({
      ...item.toJSON(),
      chamber_name: item.chamber?.chamber_name,
      chamber_id: undefined
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
    const uniqueChambers = await DryWarehousesClient.findAll({
      attributes: ["chamber_id"],
      where: {
        chamber_id: { [Op.ne]: null },
      },
      group: ["chamber_id"],
      raw: true,
    });

    const rawIds = uniqueChambers
      .map((r) => r.chamber_id)
      .filter(Boolean)
      .map(String);

    if (rawIds.length === 0) {
      return res.status(200).json({ summaries: [], totalChambers: 0 });
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const uuids = rawIds.filter((s) => uuidRegex.test(s));
    const names = rawIds.filter((s) => !uuidRegex.test(s));

    const chamberWhere = {};
    const orClauses = [];
    if (uuids.length > 0) orClauses.push({ id: uuids });
    if (names.length > 0) orClauses.push({ chamber_name: names });

    if (orClauses.length === 0) {
      return res.status(200).json({ summaries: [], totalChambers: 0 });
    }

    const chambers = await chamberClient.findAll({
      where: { [Op.or]: orClauses },
      attributes: ["id", "chamber_name", "capacity"],
      raw: true,
    });

    // map by both id and chamber_name so lookups work for either kind of chamber_id
    const chamberMap = new Map();
    for (const c of chambers) {
      if (c.id != null) chamberMap.set(String(c.id), c);
      if (c.chamber_name != null) chamberMap.set(String(c.chamber_name), c);
    }

    // get dry rows that reference any of the rawIds (these are strings as stored)
    const dryRows = await DryWarehousesClient.findAll({
      where: { chamber_id: rawIds },
      attributes: ["id", "chamber_id", "quantity_unit", "unit", "item_name"],
      raw: true,
    });

    const parseQuantity = (raw) => {
      if (raw == null) return 0;
      const s = String(raw).trim();
      const cleaned = s.replace(/[^0-9.-]+/g, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    };

    const summariesMap = new Map();
    for (const row of dryRows) {
      const cid = String(row.chamber_id);
      const q = parseQuantity(row.quantity_unit);

      const cur = summariesMap.get(cid) ?? { totalQuantity: 0, itemsCount: 0 };
      cur.totalQuantity += q;
      cur.itemsCount += 1;
      summariesMap.set(cid, cur);
    }

    const summaries = rawIds.map((cid) => {
      const meta = chamberMap.get(cid);
      const agg = summariesMap.get(cid) ?? { totalQuantity: 0, itemsCount: 0 };

      return {
        chamberId: cid,
        // prefer chamber_name from meta when available, otherwise null
        chamberName: meta ? meta.chamber_name : null,
        capacity: meta ? meta.capacity : null,
        totalQuantity: agg.totalQuantity,
        itemsCount: agg.itemsCount,
      };
    });

    const grandTotal = summaries.reduce((acc, s) => acc + (s.totalQuantity || 0), 0);

    return res.status(200).json({
      summaries,
      totalChambers: summaries.length,
      grandTotal,
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

    const oldChamberId = existingItem.chamber_id;

    const [count, [updatedItem]] = await DryWarehousesClient.update(req.body, {
      where: { id },
      returning: true,
    });

    if (count === 0) return res.status(404).json({ error: "Item not found." });

    // If chamber_id is being changed or added
    if (newChamberId !== undefined && newChamberId !== oldChamberId) {
      // Remove item from the old chamber if it existed
      if (oldChamberId) {
        const oldChamber = await chamberClient.findOne({ where: { chamber_name: oldChamberId } });
        if (oldChamber) {
          oldChamber.items = (oldChamber.items || []).filter(itemId => itemId !== existingItem.id);
          await oldChamber.save();
        } else {
          console.warn(`Old Chamber with ID ${oldChamberId} not found.`);
        }
      }

      // Add item to the new chamber if newChamberId is provided
      if (newChamberId) {
        const newChamber = await chamberClient.findOne({ where: { chamber_name: newChamberId } });
        if (newChamber) {
          const currentItems = newChamber.items || [];
          if (!currentItems.includes(updatedItem.id)) {
            currentItems.push(updatedItem.id);
          }
          newChamber.items = currentItems;
          await newChamber.save();
        } else {
          console.warn(`New Chamber with ID ${newChamberId} not found.`);
        }
      }
    }


    res.status(200).json({ message: "Updated successfully", data: updatedItem });
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

    if (item.sample_image?.key) {
      await deleteFromS3(item.sample_image.key);
    }

    if (item.chamber_id) {
      const chamber = await chamberClient.findOne({
        where: { chamber_name: item.chamber_id },
      });
      if (chamber) {
        chamber.items = (chamber.items || []).filter(
          (id) => id !== item.id
        );
        await chamber.save();
      }
    }

    await item.destroy();
    res.status(200).json({ message: "Deleted successfully", data: item });
  } catch (error) {
    console.error("Delete Dry Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
