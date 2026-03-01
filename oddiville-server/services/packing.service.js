const {
  PackingEvent,
  ChamberStock,
  DryWarehouse,
  Packages,
  sequelize,
  Sequelize,
} = require("../models");

const { getTareWeight } = require("../constants/tareWeight");
const { pushPackingSummary } = require("../utils/packing/redisSummary");

function mergePackedPackages(existing, incoming) {
  const copy = [...existing];

  const idx = copy.findIndex(
    (p) =>
      String(p.size) === String(incoming.size) &&
      p.unit === incoming.unit
  );

  if (idx >= 0) {
    copy[idx] = {
      ...copy[idx],
      quantity: String(
        Number(copy[idx].quantity) + Number(incoming.quantity)
      ),
    };
  } else {
    copy.push({
      ...incoming,
      quantity: String(incoming.quantity),
    });
  }

  return copy;
}

class PackingService {
  static async execute(payload) {
    const t = await sequelize.transaction();

    try {
      const { product, rmConsumption, packagingPlan } = payload;
      const events = [];

      // throw new Error("Debug stop here");

      for (const sku of packagingPlan) {

        if (
          sku.totalPacketsProduced !==
          sku.bagsProduced * sku.packet.packetsPerBag
        ) {
          throw new Error(
            `Packet/bag mismatch for SKU ${sku.skuLabel}`
          );
        }

        const event = await PackingEvent.create(
          {
            product_name: product.productName,
            rating: product.finalRating,
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

        await this.applyChamberStockDelta(
          product.productName,
          product.finalRating,
          sku,
          t
        );
      }

      /* ---------- Deduct materials ---------- */
      await this.deductRawMaterialStock(rmConsumption, t);

      /* ---------- Deduct packaging ---------- */
      await this.deductPackaging(packagingPlan, product.productName, t);

      await t.commit();
      await pushPackingSummary(events);
      return events;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  static async applyChamberStockDelta(productName, finalRating, sku, t) {
    let stock = await ChamberStock.findOne({
      where: {
        product_name: productName,
        category: "packed",
        rating: finalRating
      },
      transaction: t,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });


    if (!stock) {
      stock = await ChamberStock.create({
  product_name: productName,
  category: "packed",
  rating: finalRating,
  unit: "kg",

  // STORE BAGS
  chamber: sku.storage.map((s) => ({
    id: String(s.chamberId),
    quantity: String(s.bagsStored),
  })),

  packaging: null,

  // STORE PACKETS
  packages: [
    {
      size: sku.packet.size,
      unit: sku.packet.unit,
      quantity: Number(sku.totalPacketsProduced),
      packets_per_bag: Number(sku.packet.packetsPerBag),
    },
  ],
});

      return;
    }

    stock.packages = mergePackedPackages(stock.packages || [], {
  size: sku.packet.size,
  unit: sku.packet.unit,
  quantity: sku.totalPacketsProduced,
  packets_per_bag: Number(sku.packet.packetsPerBag),

});

for (const s of sku.storage) {
  const chamberId = String(s.chamberId);

  stock.chamber = stock.chamber || [];

  let target = stock.chamber.find(
    (c) => String(c.id) === chamberId
  );

  if (!target) {
    target = {
      id: chamberId,
      quantity: "0",
    };
    stock.chamber.push(target);
  }

  target.quantity = String(
    Number(target.quantity) + Number(s.bagsStored)
  );
}

    stock.packed_ref = {
      lastPackedAt: new Date().toISOString(),
      skus: Array.from(new Set([...(stock.packed_ref?.skus || []), sku.skuId])),
      eventCount: (stock.packed_ref?.eventCount || 0) + 1,
    };

    if (
      stock.category === "packed" &&
      (!stock.packages || stock.packages.length === 0)
    ) {
      throw new Error("Packed stock must always have packages");
    }
    await stock.save({ transaction: t });
  }

static async deductRawMaterialStock(rmConsumption, transaction) {

  for (const rm of rmConsumption) {

    const { rmId, rating, sourceChambers } = rm;

    const stock = await ChamberStock.findOne({
      where: {
        id: rmId,
        category: "material",
        rating
      },
      transaction,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });

    if (!stock)
      throw new Error(`Material stock not found for RM ${rmId} rating ${rating}`);

    const kgPerBag =
      stock.packaging?.size?.unit === "kg"
        ? Number(stock.packaging.size.value)
        : null;

    if (!kgPerBag)
      throw new Error(`Invalid packaging size for raw material ${rmId}`);

    stock.chamber = stock.chamber.map((c) => {

      const used = sourceChambers.find(s => String(s.chamberId) === String(c.id));
      if (!used) return c;

      const usedKg = Number(used.containersUsed) * kgPerBag;

      if (usedKg > Number(c.quantity)) {
        throw new Error(
          `RM over-consumption detected for ${rmId} in chamber ${c.id}`
        );
      }

      return {
        ...c,
        quantity: Math.max(0, Number(c.quantity) - usedKg).toFixed(3),
      };
    });

    await stock.save({ transaction });
  }
}

static async deductPackaging(packagingPlan, productName, t) {

  const pkgRow = await Packages.findOne({
    where: { product_name: productName },
    transaction: t,
    lock: Sequelize.Transaction.LOCK.UPDATE,
  });

  if (!pkgRow || !Array.isArray(pkgRow.types))
    throw new Error("Package master not configured");

  let simulatedTypes = JSON.parse(JSON.stringify(pkgRow.types));

  const pouchRequirements = {};
  const plasticRequirements = {};

  for (const sku of packagingPlan) {

    const itemName = `${productName}:${sku.packet.size}${sku.packet.unit}`;

    pouchRequirements[itemName] =
      (pouchRequirements[itemName] || 0) + sku.totalPacketsProduced;

    const tare = getTareWeight({
      type: "pouch",
      size: sku.packet.size,
      unit: sku.packet.unit,
    });

    const usedKg = (sku.totalPacketsProduced * tare) / 1000;

    const plasticKey = `${sku.packet.size}${sku.packet.unit}`;
    plasticRequirements[plasticKey] =
      (plasticRequirements[plasticKey] || 0) + usedKg;
  }

  for (const [itemName, totalRequired] of Object.entries(pouchRequirements)) {

    const dry = await DryWarehouse.findOne({
      where: { item_name: itemName, unit: "pcs" },
      transaction: t,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });

    if (!dry)
      throw new Error(`Pouch stock not found for ${itemName}`);

    if (Number(dry.quantity) < totalRequired)
      throw new Error(`Insufficient pouches for ${itemName}`);
  }

  simulatedTypes = simulatedTypes.map(tp => {

    const key = `${tp.size}${tp.unit}`;
    const requiredKg = plasticRequirements[key] || 0;

    if (requiredKg === 0) return tp;

    if (Number(tp.quantity) < requiredKg)
      throw new Error(`Insufficient plastic for ${tp.size}${tp.unit}`);

    return {
      ...tp,
      quantity: (Number(tp.quantity) - requiredKg).toFixed(3),
    };
  });

  for (const [itemName, totalRequired] of Object.entries(pouchRequirements)) {

    const dry = await DryWarehouse.findOne({
      where: { item_name: itemName, unit: "pcs" },
      transaction: t,
      lock: Sequelize.Transaction.LOCK.UPDATE,
    });

    dry.quantity = Number(dry.quantity) - totalRequired;
    await dry.save({ transaction: t });
  }

  pkgRow.types = simulatedTypes;
  await pkgRow.save({ transaction: t });
}

}

module.exports = PackingService;