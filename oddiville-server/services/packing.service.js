const {
    PackingEvent,
    ChamberStock,
    DryWarehouse,
    Packages,
    sequelize,
} = require("../models");

const { getTareWeight } = require("../constants/tareWeight");
const { pushPackingSummary } = require("../utils/packing/redisSummary");

class PackingService {
    static packetKg(packet) {
        return packet.unit === "gm" ? packet.size / 1000 : packet.size;
    }

    static kgPerBag(packet) {
        return this.packetKg(packet) * packet.packetsPerBag;
    }

    static bagsToKg(packet, bags) {
        return this.kgPerBag(packet) * bags;
    }

    static async execute(payload) {
        const t = await sequelize.transaction();

        try {
            const { product, rmConsumption, packagingPlan } = payload;
            const events = [];

            for (const sku of packagingPlan) {
                const event = await PackingEvent.create(
                    {
                        product_name: product.productName,
                        sku_id: sku.skuId,
                        sku_label: sku.skuLabel,
                        packet: sku.packet,
                        bags_produced: sku.bagsProduced,
                        total_packets: sku.totalPacketsProduced,
                        storage: sku.storage,
                        rm_consumption: rmConsumption,
                    },
                    { transaction: t }
                );

                events.push(event);

                await this.applyChamberStockDelta(product.productName, sku, t);
            }

            /* ---------- Deduct materials ---------- */
            await this.deductRawMaterials(rmConsumption, t);

            /* ---------- Deduct packaging ---------- */
            await this.deductPackaging(packagingPlan, product.productName, t);

            await pushPackingSummary(events);

            await t.commit();
            return events;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async applyChamberStockDelta(productName, sku, t) {
        let stock = await ChamberStock.findOne({
            where: { product_name: productName, category: "packed" },
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        const kgPerBag = this.kgPerBag(sku.packet);

        if (!stock) {
            stock = await ChamberStock.create(
                {
                    product_name: productName,
                    category: "packed",
                    unit: "kg", 
                    chamber: sku.storage.map((s) => ({
                        id: s.chamberId,
                        quantity: String(kgPerBag * s.bagsStored),
                        rating: "5",
                    })),
                    packaging: [],
                    packages: [],
                },
                { transaction: t }
            );

            return; // first insert done
        }

        /* ---------- update existing ---------- */
        for (const s of sku.storage) {
            const addedKg = kgPerBag * s.bagsStored;

            const found = stock.chamber.find((c) => c.id === s.chamberId);

            if (found) {
                found.quantity = String(Number(found.quantity) + addedKg);
            } else {
                stock.chamber.push({
                    id: s.chamberId,
                    quantity: String(addedKg),
                    rating: "5",
                });
            }
        }

        stock.packed_ref = {
            lastPackedAt: new Date().toISOString(),
            skus: Array.from(new Set([...(stock.packed_ref?.skus || []), sku.skuId])),
            eventCount: (stock.packed_ref?.eventCount || 0) + 1,
        };

        await stock.save({ transaction: t });
    }

    static async deductRawMaterials(rmConsumption, transaction) {
        for (const [rmName, chambers] of Object.entries(rmConsumption)) {
            const stock = await ChamberStock.findOne({
                where: { product_name: rmName, category: "material" },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!stock) continue;

            stock.chamber = stock.chamber.map((c) => {
                const used = chambers[c.id];
                if (!used) return c;

                return {
                    ...c,
                    quantity: String(
                        Math.max(0, Number(c.quantity) - Number(used.outer_used))
                    ),
                };
            });

            await stock.save({ transaction });
        }
    }

    static async deductPackaging(packagingPlan, productName, t) {
        for (const sku of packagingPlan) {
            const tare = getTareWeight({
                type: "pouch",
                size: sku.packet.size,
                unit: sku.packet.unit,
            });

            const usedKg = (sku.totalPacketsProduced * tare) / 1000;

            /* ---------- Dry Warehouse ---------- */
            const dry = await DryWarehouse.findOne({
                where: {
                    item_name: `${productName}:${sku.packet.size}`,
                    unit: "kg",
                },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!dry || Number(dry.quantity_unit) < usedKg) {
                throw new Error("Insufficient packaging stock");
            }

            dry.quantity_unit = String(Number(dry.quantity_unit) - usedKg);
            await dry.save({ transaction: t });

            /* ---------- Packages table ---------- */
            const pkgRow = await Packages.findOne({
                where: { product_name: productName },
                transaction: t,
                lock: t.LOCK.UPDATE,
            });

            if (!pkgRow || !Array.isArray(pkgRow.types)) {
                throw new Error("Package master not configured");
            }

            pkgRow.types = pkgRow.types.map((tp) => {
                if (String(tp.size) !== String(sku.packet.size)) return tp;

                const tare = getTareWeight({
                    type: "pouch",
                    size: tp.size,
                    unit: tp.unit,
                });

                const usedKg = (sku.totalPacketsProduced * tare) / 1000;
                const available = Number(tp.quantity);

                if (available < usedKg) {
                    throw new Error(
                        `Insufficient package stock for ${tp.size}${tp.unit}`
                    );
                }

                return {
                    ...tp,
                    quantity: (available - usedKg).toFixed(3),
                };
            });

            await pkgRow.save({ transaction: t });
        }
    }
}

module.exports = PackingService;