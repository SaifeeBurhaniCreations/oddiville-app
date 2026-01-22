const { sequelize, PackingEvent, ChamberStock } = require("../models");

async function rebuildChamberStockFromEvents(transaction) {
    await ChamberStock.destroy({
        where: { category: "packed" },
        transaction,
    });

    const events = await PackingEvent.findAll({ transaction });

    const map = new Map();

    for (const ev of events) {
        const key = ev.product_name;

        if (!map.has(key)) {
            map.set(key, {
                product_name: ev.product_name,
                category: "packed",
                unit: "kg",
                chamber: [],
                packaging: [],
                packages: [],
            });
        }

        const stock = map.get(key);

        // Merge chamber bags
        for (const s of ev.storage) {
            const found = stock.chamber.find(c => c.id === s.chamberId);
            if (found) {
                found.quantity = String(
                    Number(found.quantity) + Number(s.bagsStored)
                );
            } else {
                stock.chamber.push({
                    id: s.chamberId,
                    quantity: String(s.bagsStored),
                    rating: "5",
                });
            }
        }

        // Reference packaging (optional but useful)
        stock.packaging.push({
            size: { value: ev.packet.size, unit: ev.packet.unit },
            type: "pouch",
            count: ev.total_packets,
            bags: ev.bags_produced,
        });
    }

    for (const s of map.values()) {
        await ChamberStock.create(s, { transaction });
    }
}

(async () => {
    const t = await sequelize.transaction();
    try {
        console.log("📸 BEFORE:");
        const before = await ChamberStock.findAll({
            where: { category: "packed" },
            transaction: t,
        });
        console.log(before.map(b => b.chamber));

        await rebuildChamberStockFromEvents(t);

        console.log("🔁 AFTER:");
        const after = await ChamberStock.findAll({
            where: { category: "packed" },
            transaction: t,
        });
        console.log(after.map(a => a.chamber));

        await t.commit();
        console.log("✅ Rebuild test completed");
    } catch (e) {
        await t.rollback();
        console.error("❌ Rebuild failed:", e);
    } finally {
        process.exit();
    }
})();