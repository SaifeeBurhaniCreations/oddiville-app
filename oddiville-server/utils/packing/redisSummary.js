const safeRedis = require("../safeRedis");
const { v4: uuid } = require("uuid");


function todayKey() {
    return `packing:summary:${new Date().toISOString().slice(0, 10)}`;
}

async function pushPackingSummary(events) {
    await safeRedis(global.redis, async r => {
        const key = todayKey();
        const raw = await r.get(key);
        const list = raw ? JSON.parse(raw) : [];

        for (const e of events) {
            list.push({
                eventId: uuid(),
                product: e.product_name,
                sku: e.sku_label,
                bags: e.bags_produced,
                packets: e.total_packets,
                packet: e.packet,
                time: e.createdAt,
            });
        }

        await r.set(key, JSON.stringify(list), "EX", 86400);
    });
}

module.exports = { pushPackingSummary };