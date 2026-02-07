async function linkStockToChambers(stockId, chamberIds, t, chamberClient) {
    const chambers = await chamberClient.findAll({
        where: { id: chamberIds },
        transaction: t,
        lock: t.LOCK.UPDATE,
    });

    for (const chamber of chambers) {
        const items = Array.isArray(chamber.items) ? chamber.items : [];

        if (!items.includes(stockId)) {
            chamber.items = [...items, stockId];
            await chamber.save({ transaction: t });
        }
    }
}

module.exports = {
    linkStockToChambers
}