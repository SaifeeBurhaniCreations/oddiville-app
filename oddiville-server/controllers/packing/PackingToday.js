const router = require("express").Router();
const { Op } = require("sequelize");
const { PackingEvent } = require("../../models");

/**
 * GET /packing-summary
 *
 * Day → Product → (Event | SKU | Product)
 *
 * Query:
 * - date (string)      "today" | ISO date
 * - mode (string)      "event" | "sku" | "product"
 * - sku (string)       OPTIONAL / "ALL"
 */
router.get("/", async (req, res) => {
    try {
        const {
            date = "today",
            mode = "event",
            sku = "ALL",
        } = req.query;

        const allowedModes = ["event", "sku", "product"];
        if (!allowedModes.includes(mode)) {
            return res.status(400).json({ error: "Invalid mode" });
        }

        /* -------- DATE RANGE -------- */
        let start, end;

        if (date === "today") {
            start = new Date();
            start.setHours(0, 0, 0, 0);
            end = new Date();
            end.setHours(23, 59, 59, 999);
        } else {
            start = new Date(date);
            end = new Date(date);
            if (isNaN(start.getTime())) {
                return res.status(400).json({ error: "Invalid date" });
            }
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }

        /* -------- FETCH EVENTS -------- */
        const where = {
            createdAt: { [Op.between]: [start, end] },
        };

        if (sku !== "ALL") {
            where.sku_label = sku;
        }

        const events = await PackingEvent.findAll({
            where,
            order: [["createdAt", "DESC"]],
        });

        /* -------- GROUP BY PRODUCT (ORDER PRESERVED) -------- */
        const productMap = new Map(
            [...events].reverse().reduce((acc, e) => {
                if (!acc.has(e.product_name)) acc.set(e.product_name, []);
                acc.get(e.product_name).push(e);
                return acc;
            }, new Map())
        );

        /* -------- BUILD RESPONSE -------- */
        const response = [];

        for (const [product, productEvents] of productMap.entries()) {

            // 🔹 EVENT MODE → every event = 1 row
            if (mode === "event") {
                response.push({
                    product,
                    rows: productEvents.map(e => ({
                        id: e.id,
                        sku: e.sku_label,
                        bags: e.bags_produced,
                        packets: e.total_packets,
                        createdAt: e.createdAt,
                        storage: e.storage ?? [],
                    })),
                });
            }

            // 🔹 SKU MODE → group by SKU per product
            if (mode === "sku") {
                const skuMap = new Map();

                for (const e of productEvents) {
                    if (!skuMap.has(e.sku_label)) {
                        skuMap.set(e.sku_label, {
                            sku: e.sku_label,
                            totalBags: 0,
                            totalPackets: 0,
                            eventsCount: 0,
                        });
                    }

                    const acc = skuMap.get(e.sku_label);
                    acc.totalBags += e.bags_produced;
                    acc.totalPackets += e.total_packets;
                    acc.eventsCount += 1;
                }

                response.push({
                    product,
                    rows: Array.from(skuMap.values()),
                });
            }

            // 🔹 PRODUCT MODE → 1 card per product
            if (mode === "product") {
                let totalBags = 0;
                let totalPackets = 0;
                const skuSet = new Set();

                for (const e of productEvents) {
                    totalBags += e.bags_produced;
                    totalPackets += e.total_packets;
                    if (e.sku_label) skuSet.add(e.sku_label);
                }

                response.push({
                    product,
                    rows: [{
                        totalBags,
                        totalPackets,
                        eventsCount: productEvents.length,
                        skus: Array.from(skuSet),
                    }],
                });
            }
        }

        return res.json(response);
    } catch (err) {
        console.error("packing-summary:", err);
        res.status(500).json({ error: "Internal error" });
    }
});

module.exports = router;