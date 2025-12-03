const router = require("express").Router();
const { Op } = require("sequelize");

const {
  sequelize,
  Chambers: chamberClient,
  ChamberStock: chamberStockClient,
} = require("../models");

const { sumBy } = require("../sbc/utils/sumBy/sumBy");
const { zipAndFit } = require("../sbc/utils/zipAndFit/zipAndFit");

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || "";
    
    const whereClause = {};

    if (search) {
      whereClause.product_name = {
        [Op.iLike]: `%${search}%`,
      };
    }

    const chamberStock = await chamberStockClient.findAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    res.status(200).json(chamberStock);
  } catch (error) {
    console.error(
      "Error during fetching chamberStock:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

router.get("/stock/:product_name", async (req, res) => {
  const { product_name } = req.params;

  try {
    const chamberStockByPN = await chamberStockClient.findOne({
      where: { product_name },
    });

    if (!chamberStockByPN) {
      return res.status(200).json({
        status: "new",
        message: "Product not found in chamber stock, treat as new",
      });
    }

    const chamberIds = chamberStockByPN.dataValues.chamber
      .map((c) => c.id)
      .filter((id) => /^[0-9a-fA-F-]{36}$/.test(id));

    const chamberQuantities = chamberStockByPN.dataValues.chamber.map(
      (c) => c.quantity
    );

    const chambers = await chamberClient.findAll({
      where: { id: chamberIds },
    });

    // 1)
    const chamberNames = chambers.map((chamber) => chamber.chamber_name);

    // 2)
    // console.log("chamberQuantities", chamberQuantities);

    // 3)
    const totalQty = sumBy({ array: chamberQuantities, transform: "number" });

    const config = ["chamberName", "quantity"];

    const responseChambers = zipAndFit(chamberNames, chamberQuantities, config);

    res.json({ chambers: responseChambers, total: totalQty, status: "old" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const chamberStock = await chamberStockClient.findByPk(id);

    if (!chamberStock) {
      return res.status(404).json({ error: "Chamber stock not found" });
    }

    res.status(200).json(chamberStock);
  } catch (error) {
    console.error(
      "Error during fetching chamberStock by id:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const incoming = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.data)
      ? req.body.data
      : null;

    if (!incoming) {
      return res
        .status(400)
        .json({ error: "Request body must be an array of chamber objects or { data: [...] }" });
    }

    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ error: "data must be a non-empty array" });
    }

    for (let i = 0; i < incoming.length; i++) {
      const it = incoming[i];
      if (!it || typeof it !== "object") {
        return res.status(400).json({ error: `data[${i}] must be an object` });
      }
      if (!("id" in it)) {
        return res.status(400).json({ error: `data[${i}].id is required` });
      }
      if (!("quantity" in it)) {
        return res.status(400).json({ error: `data[${i}].quantity is required` });
      }
      if (!("rating" in it)) {
        return res.status(400).json({ error: `data[${i}].rating is required` });
      }
    }

    const result = await sequelize.transaction(async (t) => {
      const chamberStock = await chamberStockClient.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      
      if (!chamberStock) {
        return { status: 404, body: { error: "ChamberStock not found" } };
      }

      const storedChambers = Array.isArray(chamberStock.chamber)
        ? [...chamberStock.chamber]
        : [];

      if (!Array.isArray(storedChambers)) {
        return { status: 500, body: { error: "Stored chamber field is invalid" } };
      }
      
      const existingIds = new Set(storedChambers.map((c) => String(c.id)));

      const normalized = [];

      for (let i = 0; i < incoming.length; i++) {
        const it = incoming[i];
        const idStr = String(it.id);
        if (!existingIds.has(idStr)) {
          return {
            status: 404,
            body: { error: `Chamber id '${idStr}' not found in this stock item` },
          };
        }

        const qtyNum = Number(it.quantity);
        if (!Number.isFinite(qtyNum) || qtyNum < 0) {
          return {
            status: 400,
            body: { error: `Invalid quantity for chamber '${idStr}'` },
          };
        }

        const ratingStr = it.rating == null ? "" : String(it.rating);
        if (ratingStr !== "" && !["1", "2", "3", "4", "5"].includes(ratingStr)) {
          return {
            status: 400,
            body: { error: `Invalid rating for chamber '${idStr}'` },
          };
        }

        normalized.push({
          id: idStr,
          quantity: String(qtyNum),
          rating: ratingStr,
        });
      }

      chamberStock.chamber = normalized;

      await chamberStock.save({ transaction: t });

      return {
        status: 200,
        body: {
          message: "Chamber stock replaced",
          updatedChambers: normalized,
          chamberStock: chamberStock.toJSON ? chamberStock.toJSON() : chamberStock,
        },
      };
    }); 

    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("PATCH /:id error:", err);
    if (err && err.name === "SequelizeValidationError") {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const chamberStock = await chamberStockClient.findByPk(id);

    if (!chamberStock) {
      return res.status(404).json({ error: "Chamber stock not found" });
    }

    const chamberIds = chamberStock.chamber?.map((c) => c.id) || [];

    if (chamberIds.length > 0) {
      const chambers = await chamberClient.findAll({
        where: { id: chamberIds },
      });

      for (const chamber of chambers) {
        if (chamber.items && chamber.items.includes(id)) {
          chamber.items = chamber.items.filter((itemId) => itemId !== id);
          await chamber.save();
        }
      }
    }

    await chamberStock.destroy();

    res.status(200).json({
      message: "Chamber stock deleted successfully",
      data: chamberStock,
    });
  } catch (error) {
    console.error("Error during delete chamberStock:", error?.message || error);
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

module.exports = router;
