const {
  RawMaterial: RawMaterialClient,
  Vendors: VendorClient,
  Chambers: ChamberClient,
  RawMaterialOrder: RawMaterialOrderClient,
  DispatchOrder: DispatchOrderClient,
  Packages: PackageClient,
  Production: ProductionClient,
  ChamberStock: ChamberStockClient,
  Contractor: ContractorClient,
  Calendar: CalendarClient,
  PackingEvent: PackingEventClient,
} = require("../models");
const { Op } = require("sequelize");

const { isValidUUID } = require("../utils/auth");
const { loadProductionBundle } = require("../utils/bottomsheet/productionBundle");

let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;

async function handlePackingSummary(ctx) {
  let parsed;
  try {
    parsed = JSON.parse(ctx.id);
  } catch {
    throw { status: 400, message: "Invalid packing-summary payload" };
  }

  const { product, sku, date, mode } = parsed;
  ctx.meta = parsed;

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
      throw { status: 400, message: "Invalid date format" };
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  const where = {
    product_name: product,
    createdAt: { [Op.between]: [start, end] },
  };

  if (mode !== "product") {
    where.sku_label = sku;
  }

  const events = await PackingEventClient.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  if (!events.length) {
    ctx.packingSummary = {
      product,
      sku,
      summary: {
        totalBags: 0,
        totalPackets: 0,
        eventsCount: 0,
        activeSkus: 0,
        lastEventAt: null,
      },
      skuSummary: [],
      chambers: [],
      rawMaterials: [],
    };
    return;
  }

  const last = events[0]

  if (mode === "event") {
    ctx.packingSummary = {
      product,
      sku,
      summary: {
        totalBags: Number(last.bags_produced ?? 0),
        totalPackets: Number(last.total_packets ?? 0),
        eventsCount: 1,
        activeSkus: 1,
        lastEventAt: last.createdAt,
      },
      skuSummary: [],
      chambers: [],
      rawMaterials: [],
    };

    return; 
  }

  if (mode === "sku") {
    const chamberMap = new Map();

    const chambersList = await ChamberClient.findAll({
      attributes: ["id", "chamber_name"],
    });

    const chamberNameMap = new Map(
      chambersList.map(c => [c.id, c.chamber_name])
    );
    for (const e of events) {
      e.storage?.forEach(s => {
        const key = s.chamberId;

        if (!chamberMap.has(key)) {
          chamberMap.set(key, {
            id: key,
            chamberName: chamberNameMap.get(key) || "Unknown chamber",
            sku: sku,
            totalBags: 0,
            totalPackets: 0,
          });
        }

        const entry = chamberMap.get(key);

        entry.totalBags += Number(e.bags_produced ?? 0);
        entry.totalPackets += Number(e.total_packets ?? 0);
      });
    }

    ctx.packingSummary = {
      product,
      sku,
      summary: {
        totalBags: 0,
        totalPackets: 0,
        eventsCount: events.length,
        lastEventAt: events.at(-1)?.createdAt ?? null,
      },
      chambers: Array.from(chamberMap.values()),
      skuSummary: [],
      rawMaterials: [],
    };

    return;
  }

  const chamberMap = new Map();
  const rmConsumption = {};
  const skuSet = new Set();
  const skuSummaryMap = {};

  let totalBags = 0;
  let totalPackets = 0;
  let lastEventAt = null;

  for (const e of events) {
    totalBags += Number(e.bags_produced ?? 0);
    totalPackets += Number(e.total_packets ?? 0);

    if (e.sku_label) {
      skuSet.add(e.sku_label);
      skuSummaryMap[e.sku_label] ??= {
        sku: e.sku_label,
        totalBags: 0,
        totalPackets: 0,
      };
      skuSummaryMap[e.sku_label].totalBags += Number(e.bags_produced ?? 0);
      skuSummaryMap[e.sku_label].totalPackets += Number(e.total_packets ?? 0);
    }

    lastEventAt =
      !lastEventAt || new Date(e.createdAt) > new Date(lastEventAt)
        ? e.createdAt
        : lastEventAt;

    e.storage?.forEach(s => {
      const key = s.chamberId;

      if (!chamberMap.has(key)) {
        chamberMap.set(key, {
          id: key,
          name: s.chamberName ?? "Unknown chamber",
          bagsStored: 0,
        });
      }

      chamberMap.get(key).bagsStored += Number(
        s.bagsStored ?? s.bags ?? s.quantity ?? 0
      );
    });

    Object.entries(e.rm_consumption || {}).forEach(([rm, data]) => {
      rmConsumption[rm] ??= {};
      Object.assign(rmConsumption[rm], data);
    });
  }

  ctx.packingSummary = {
    product,
    sku,
    summary: {
      totalBags,
      totalPackets,
      eventsCount: events.length,
      activeSkus: skuSet.size,
      lastEventAt,
    },
    skuSummary: Object.values(skuSummaryMap),
    chambers: Array.from(chamberMap.values()),
    rawMaterials: Object.keys(rmConsumption),
  };
}

const handlers = {
  "packing-summary": handlePackingSummary,

  "add-product": async (ctx) => {
    const data = await PackageClient.findAll();
    ctx.productNames = data.map(v => v.dataValues.product_name);
  },

  "country": async (ctx) => {
    ctx.countries = Country.getAllCountries();
  },

  "state": async (ctx) => {
    ctx.states = State
      .getStatesOfCountry(ctx.id)
      .map(s => ({ name: s.name, isoCode: s.isoCode }));
  },

  "city": async (ctx) => {
    const [state, country] = ctx.id.split(":");
    ctx.cities = City.getCitiesOfState(country, state).map(c => c.name);
  },

  "add-raw-material": async (ctx) => {
    ctx.rawMaterials = await RawMaterialClient.findAll();
  },

  "choose-product": async (ctx) => {
    ctx.rawMaterials = await RawMaterialClient.findAll();
  },

  "add-vendor": async (ctx) => {
    ctx.vendors = await VendorClient.findAll();
  },

  "raw-material-ordered": async (ctx) => {
    if (isValidUUID(ctx.id)) {
      ctx.rawMaterialOrder = await RawMaterialOrderClient.findOne({ where: { id: ctx.id } }) || {};
      ctx.vendors = await VendorClient.findAll();
    }
  },

  "raw-material-reached": async (ctx) => {
    if (isValidUUID(ctx.id)) {
      ctx.rawMaterialOrder = await RawMaterialOrderClient.findOne({ where: { id: ctx.id } }) || {};
      ctx.vendors = await VendorClient.findAll();
    }
  },

  "order-ready": async (ctx) => {
    if (isValidUUID(ctx.id)) {
      ctx.dispatchOrder =
        (await DispatchOrderClient.findOne({ where: { id: ctx.id } }))?.dataValues || {};
    }
  },

  "order-shipped": async (ctx) => {
    if (isValidUUID(ctx.id)) {
      ctx.dispatchOrder =
        (await DispatchOrderClient.findOne({ where: { id: ctx.id } }))?.dataValues || {};
    }
  },

  "order-reached": async (ctx) => {
    if (isValidUUID(ctx.id)) {
      ctx.dispatchOrder =
        (await DispatchOrderClient.findOne({ where: { id: ctx.id } }))?.dataValues || {};
    }
  },
  
  "production-start": loadProductionBundle,

  "production-completed": loadProductionBundle,

  "lane-occupied": loadProductionBundle,

  "worker-multiple": async (ctx) => {
    const dataIds = ctx.id
      ?.split(",")
      .map(i => i.trim())
      .filter(isValidUUID);

    if (!dataIds.length) return;

    const contractors = await ContractorClient.findAll({
      where: { id: dataIds },
    });

    ctx.contractors = contractors.map(c => c.dataValues);
  },

  "calendar-event-scheduled": async (ctx) => {
    if (!isValidUUID(ctx.id)) return;

    ctx.calendarEvent =
      (await CalendarClient.findOne({ where: { id: ctx.id } })) || {};
  },

  "scheduled-date-event": async (ctx) => {
    if (!isValidUUID(ctx.id)) return;

    ctx.calendarEvent =
      (await CalendarClient.findOne({ where: { id: ctx.id } })) || {};
  },

  "chamber-list": async (ctx) => {
    ctx.chambers = await ChamberClient.findAll();
  },

  "multiple-chamber-list": async (ctx) => {
    ctx.chambers = await ChamberClient.findAll();
  },

  "multiple-product-card": async (ctx) => {
    
    const packingEvents = await PackingEventClient.findAll({
      order: [["createdAt", "DESC"]],
    });

    const chamberStocks = await ChamberStockClient.findAll();

    ctx.packingEvents = packingEvents;
    ctx.chamberStocks = chamberStocks;
  },

};

module.exports = { handlers }