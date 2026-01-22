const { PackingEvent, ChamberStock, sequelize } = require("../models");

async function rebuildChamberStockFromEvents() {
    const transaction = await sequelize.transaction();

    try {
        // 1️⃣ Clear packed chamber stock
        await ChamberStock.destroy({
            where: { category: "packed" },
            transaction,
        });

        // 2️⃣ Fetch all packing events
        const events = await PackingEvent.findAll({
            order: [["createdAt", "ASC"]],
            transaction,
        });

        const stockMap = new Map();

        // 3️⃣ Rebuild from events
        for (const event of events) {
            const key = event.product_name;

            if (!stockMap.has(key)) {
                stockMap.set(key, {
                    product_name: event.product_name,
                    category: "packed",
                    unit: "kg",
                    chamber: [],
                    packaging: [],
                    packages: [],
                    packed_ref: {
                        lastPackedAt: event.createdAt,
                        skus: new Set(),
                        eventCount: 0,
                    },
                });
            }

            const stock = stockMap.get(key);

            // merge chamber quantities (bags)
            for (const s of event.storage) {
                const existing = stock.chamber.find(c => c.id === s.chamberId);
                if (existing) {
                    existing.quantity = String(
                        Number(existing.quantity) + Number(s.bagsStored)
                    );
                } else {
                    stock.chamber.push({
                        id: s.chamberId,
                        quantity: String(s.bagsStored),
                        rating: "5",
                    });
                }
            }

            // update ref
            stock.packed_ref.lastPackedAt = event.createdAt;
            stock.packed_ref.skus.add(event.sku_id);
            stock.packed_ref.eventCount += 1;
        }

        // 4️⃣ Persist rebuilt stock
        for (const stock of stockMap.values()) {
            stock.packed_ref.skus = Array.from(stock.packed_ref.skus);

            await ChamberStock.create(stock, { transaction });
        }

        await transaction.commit();
        return { success: true, rebuilt: stockMap.size };
    } catch (err) {
        await transaction.rollback();
        console.error("rebuildChamberStockFromEvents error:", err);
        throw err;
    }
}

module.exports = rebuildChamberStockFromEvents;