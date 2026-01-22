const router = require("express").Router();
const { Op } = require("sequelize");
const { PackingEvent } = require("../../models");

/**
 * GET /packing-events
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
        if (sku) where.sku_id = sku;

        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt[Op.gte] = new Date(from);
            if (to) where.createdAt[Op.lte] = new Date(to);
        }

        const events = await PackingEvent.findAll({
            where,
            order: [["createdAt", "DESC"]],
            limit: 500   // safety
        });

        return res.json(events);
    } catch (e) {
        console.error("packing-events:", e);
        res.status(500).json({ error: "Internal error" });
    }
});

router.get("/packing-summary/today", async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        const dateKey = start.toISOString().slice(0, 10);

        const events = await PackingEvent.findAll({
            where: {
                createdAt: { [Op.between]: [start, end] }
            }
        });

        const map = {};

        for (const e of events) {
            const key = `${e.product_name}__${e.sku_label}`;

            if (!map[key]) {
                map[key] = {
                    summary_id: `${e.product_name}-${e.sku_label}-${dateKey}`,
                    product_name: e.product_name,
                    sku_label: e.sku_label,
                    totalBags: 0,
                    totalPackets: 0,
                    events: 0,
                };
            }

            map[key].totalBags += e.bags_produced;
            map[key].totalPackets += e.total_packets;
            map[key].events += 1;
        }

        res.json(Object.values(map));
    } catch (e) {
        console.error("packing-summary:", e);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;