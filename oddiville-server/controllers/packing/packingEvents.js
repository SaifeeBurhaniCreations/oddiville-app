const router = require("express").Router();
const { Op } = require("sequelize");
const { PackingEvent } = require("../../models");

/**
 * GET /packing-events
 *
 * Raw events (debug / admin / audit use)
 *
 * Query params:
 * - product (string)
 * - sku (string)
 * - from (ISO date)
 * - to (ISO date)
 */
router.get("/", async (req, res) => {
    try {
        const { product, sku, from, to } = req.query;
        const where = {};

        if (product) where.product_name = product;
        if (sku) where.sku_label = sku;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from);
            if (to) where.createdAt[Op.lte] = new Date(to);
        }

        const events = await PackingEvent.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: 500
        });

        return res.json(events);
    } catch (err) {
        console.error("packing-events:", err);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;