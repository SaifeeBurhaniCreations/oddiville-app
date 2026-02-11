const {
  PackingEvent,
  ChamberStock,
  DryWarehouse,
  Packages,
  sequelize,
} = require("../models");

const { getTareWeight } = require("../constants/tareWeight");
const { pushPackingSummary } = require("../utils/packing/redisSummary");

function mergePackedPackages(existing, incoming) {
  const copy = [...existing];

  const idx = copy.findIndex(
    (p) => String(p.size) === String(incoming.size) && p.unit === incoming.unit,
  );

  if (idx >= 0) {
    copy[idx] = {
      ...copy[idx],
      quantity: Number(copy[idx].quantity) + Number(incoming.quantity),
    };
  } else {
    copy.push({ ...incoming });
  }

  return copy;
}

class PackingService {
  static packetKg(packet) {
    return packet.unit === "gm" ? packet.size / 1000 : packet.size;
  }

  static kgPerOutputBag(packet) {
    return this.packetKg(packet) * packet.packetsPerBag;
  }

  static async execute(payload) {
    const t = await sequelize.transaction();

    try {
      const { product, rmConsumption, packagingPlan } = payload;
      const events = [];

      // throw new Error("Debug stop here");

      for (const sku of packagingPlan) {
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
          { transaction: t },
        );

        events.push(event);

        await this.applyChamberStockDelta(
          product.productName,
          product.finalRating,
          sku,
          t,
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
      where: { product_name: productName, category: "packed" },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    const kgPerOutputBag = this.kgPerOutputBag(sku.packet);

    if (!stock) {
      stock = await ChamberStock.create(
        {
          product_name: productName,
          category: "packed",
          unit: "kg",

         chamber: sku.storage.map((s) => ({
        id: String(s.chamberId),
        quantity: String(kgPerOutputBag * s.bagsStored),
        rating: String(finalRating),
      })),

          packaging: null,
          packages: [
            {
              size: sku.packet.size,
              unit: sku.packet.unit,
              quantity: String(kgPerOutputBag * sku.bagsProduced),
            },
          ],
        },
        { transaction: t },
      );

      return;
    }

    stock.packages = mergePackedPackages(stock.packages || [], {
      size: sku.packet.size,
      unit: sku.packet.unit,
      quantity: String(kgPerOutputBag * sku.bagsProduced),
    });

    for (const s of sku.storage) {
      const addedKg = kgPerOutputBag * s.bagsStored;

      const chamberId = String(s.chamberId);

      let target = stock.chamber.find((c) => String(c.id) === chamberId);

      if (!target) {
        target = {
          id: chamberId,
          quantity: "0",
          rating: String(finalRating),
        };
        stock.chamber.push(target);
      }

      target.quantity = String(Number(target.quantity) + addedKg);
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
    for (const [rmName, chambers] of Object.entries(rmConsumption)) {
      const stock = await ChamberStock.findOne({
        where: { product_name: rmName, category: "material" },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!stock) continue;

      const kgPerBag =
      stock.packaging?.size?.unit === "kg"
        ? Number(stock.packaging.size.value)
        : null;

    if (!kgPerBag) {
      throw new Error(
        `Invalid packaging size for raw material ${rmName}`
      );
    }

    stock.chamber = stock.chamber.map((c) => {
      const used = chambers[c.id];
      if (!used || used.outer_used <= 0) return c;

      const usedKg = Number(used.outer_used) * kgPerBag;
      if (usedKg > Number(c.quantity)) {
        throw new Error(
          `RM over-consumption detected for ${rmName} in chamber ${c.id}`
        );
      }

      return {
        ...c,
        quantity: String(
          Math.max(0, Number(c.quantity) - usedKg)
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
            `Insufficient package stock for ${tp.size}${tp.unit}`,
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
