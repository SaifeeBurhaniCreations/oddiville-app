const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const getDateRange = require("../utils/dateRange");
const db = require("../models");
const { sanitizeRow, applyColumnOrder } = require("../utils/export/sanitizeExportRows")
const parseIds = (ids) =>
  ids ? ids.split(",").map((id) => id.trim()).filter(Boolean) : [];

const buildWhere = (query) => {
  const range = getDateRange(query.range, query.from, query.to);

  return {
    ...(range && { createdAt: { [Op.between]: range } }),
  };
};

const addSheet = (workbook, name, rows, extraRemove = [], chamberMap = {}) => {
  const ws = workbook.addWorksheet(name);

  if (!rows.length) return;

  const cleanRows = rows.map((r) => sanitizeRow(r, extraRemove, { chamberMap, sheetName: name }));

  const orderedRows = applyColumnOrder(cleanRows, name);

let allKeys = [
  ...new Set(
    orderedRows.flatMap(row => Object.keys(row))
  )
];

if (orderedRows.length && orderedRows[0].category) {

  const categories = new Set(orderedRows.map(r => r.category));

  if (categories.size === 1 && categories.has("material")) {
    allKeys = allKeys.filter(k => !["sku_size", "sku_quantity"].includes(k));
  }

  if (categories.size === 1 && categories.has("packed")) {
    allKeys = allKeys.filter(k =>
      !["pack_type", "pack_size", "pack_count", "total_quantity"].includes(k)
    );
  }
}

  ws.columns = allKeys.map((k) => ({
    header: k.replace(/_/g, " ").toUpperCase(),
    key: k,
    width: 20,
  }));


  ws.addRows(orderedRows);
};

async function exportDashboard(query) {
  const workbook = new ExcelJS.Workbook();

  const where = buildWhere(query);

  const [
    productions,
    packing,
    dispatch,
    raws,
    stocks,
    others,
  ] = await Promise.all([
    db.Production.findAll({
      where,
      include: [
        {
          model: db.Lanes,
          as: "lane",
          attributes: ["name"],
        },
      ],
    }),
    db.PackingEvent.findAll({ where }),
    db.DispatchOrder.findAll({ where }),
    db.RawMaterialOrder.findAll({ where }),
    db.ChamberStock.findAll({ where }), // now filtered
    db.OthersItem.findAll({ where }),
  ]);

  const sheet = workbook.addWorksheet("Summary");

const chambers = await db.Chambers.findAll({
  attributes: ["id", "chamber_name"],
});

const chamberMap = Object.fromEntries(
  chambers.map(c => [c.id, c.chamber_name])
);

  const rmRows = [];

const materialStocks = stocks.filter(s => s.category === "material");

const materialStockMap = Object.fromEntries(
  materialStocks.map(s => [s.id, s.product_name])
);

for (const pack of packing) {
  const product_name = pack.product_name;
  const rmList = pack.rm_consumption || [];

  for (const rmItem of rmList) {
    const rawMaterialId = rmItem.rmId;
    const rating = rmItem.rating ?? null;
    const chambers = rmItem.sourceChambers || [];

    for (const chamber of chambers) {
      rmRows.push({
        product_name,
        raw_material: materialStockMap[rawMaterialId] || rawMaterialId,
        chamber_name: chamberMap[chamber.chamberId] || "",
        rating,
        outer_used: chamber.containersUsed ?? null,
      });
    }
  }
}

  const dispatchItemRows = [];

  for (const order of dispatch) {
    const customerName = order.customer_name;
    const dispatched = order.dispatched_items || {};
    const products = order.products || [];

    const productMap = Object.fromEntries(
      products.map(p => [p.id, p])
    );

    for (const productKey in dispatched) {
      const productInfo = productMap[productKey] || {};
      const productName = productInfo.product_name;
      const rating = productInfo.rating;

      const skuData = dispatched[productKey];

      for (const skuKey in skuData) {
        const item = skuData[skuKey];

        const byChamber = item.byChamber || {};

        for (const chamberId in byChamber) {
          dispatchItemRows.push({
            customer_name: customerName,
            product_name: productName,
            sku: skuKey,
            rating,
            chamber_name: chamberMap[chamberId] || "",
            total_bags: item.totalBags,
            total_packets: item.totalPackets,
          });
        }
      }
    }
  }

  const stockChamberRows = [];

  for (const stock of stocks) {
    const productName = stock.product_name;
    const category = stock.category;
    const chambers = stock.chamber || [];

    for (const c of chambers) {
      stockChamberRows.push({
        product_name: productName,
        category,
        chamber_name: chamberMap[c.id] || c.id,
        rating: stock.rating,
        quantity: c.quantity,
      });
    }
  }

  sheet.addRows([
    ["Filter", query.range || "all"],
    ["Raw Orders", raws.length],
    ["Productions", productions.length],
    ["Packing Events", packing.length],
    ["Dispatch Orders", dispatch.length],
    ["Stock Items", stocks.length],
    ["Third Party Items", others.length],
  ]);

  addSheet(workbook, "Raw Materials", raws, [
    "id",
    "sku_id",
    "vendor_id",
    "production_id",
    "sample_image",
    "warehoused_date",
    "unit",
  ]);

  addSheet(workbook, "Production", productions, [
    "id",
    "raw_material_order_id",
    "unit",
    "sample_images",
    "lane_id",

  ]);

  addSheet(
    workbook,
    "Packing",
    packing,
    [
      "id",
      "sku_id",
      "sku_label",
      "unit",
      "packet",
    ],
    chamberMap
  );

  addSheet(workbook, "RM Consumption", rmRows);

  addSheet(workbook, "Dispatch", dispatch, [
    "id",
    "sample_images",
  ]);

  addSheet(workbook, "Dispatch Items", dispatchItemRows);

  addSheet(workbook, "Stock", stocks, [
    "id",
    "packed_ref",
    "image",
  ], chamberMap);

  addSheet(workbook, "Stock Chambers", stockChamberRows);


  addSheet(workbook, "Third Party", others, [
    "id",
  ]);

  return workbook;
}

async function exportChamber(query) {
  const workbook = new ExcelJS.Workbook();

  const ids = parseIds(query.chamberIds);
  if (!ids.length) throw new Error("No chambers selected");

  const where = buildWhere(query);

  const chambers = await db.Chambers.findAll({
    where: { id: { [Op.in]: ids } },
  });

  const allStocks = await db.ChamberStock.findAll({ where });

  const grouped = {};

  for (const stock of allStocks) {
    for (const c of stock.chamber || []) {
      if (ids.includes(c.id)) {
        if (!grouped[c.id]) grouped[c.id] = [];
        grouped[c.id].push(stock);
      }
    }
  }

  const overviewRows = chambers.map(chamber => ({
    chamber_name: chamber.chamber_name,
    capacity: chamber.capacity,
    item_count: (grouped[chamber.id] || []).length,
  }));

  addSheet(workbook, "Overview", overviewRows);

  for (const chamber of chambers) {
    const stocks = grouped[chamber.id] || [];

    addSheet(
      workbook,
      chamber.chamber_name,
      stocks,
      ["packed_ref", "image"],
    );
  }

  return workbook;
}

async function exportProduction(query) {
  const workbook = new ExcelJS.Workbook();
  const rows = await db.Production.findAll({ where: buildWhere(query) });
  addSheet(workbook, "Production", rows);
  return workbook;
}

async function exportDispatch(query) {
  const workbook = new ExcelJS.Workbook();
  const rows = await db.DispatchOrder.findAll({ where: buildWhere(query) });
  addSheet(workbook, "Dispatch", rows);
  return workbook;
}

async function exportRaw(query) {
  const workbook = new ExcelJS.Workbook();
  const rows = await db.RawMaterialOrder.findAll({ where: buildWhere(query) });
  addSheet(workbook, "Raw Materials", rows);
  return workbook;
}

async function countDashboard(query) {
  const where = buildWhere(query);

  const [
    productions,
    packing,
    dispatch,
    raws,
    stocks,
    others,
  ] = await Promise.all([
    db.Production.count({ where }),
    db.PackingEvent.count({ where }),
    db.DispatchOrder.count({ where }),
    db.RawMaterialOrder.count({ where }),
    db.ChamberStock.count({ where }),
    db.OthersItem.count({ where }),
  ]);

  return productions + packing + dispatch + raws + stocks + others;
}

async function countProduction(query) {
  return db.Production.count({ where: buildWhere(query) });
}

async function countDispatch(query) {
  return db.DispatchOrder.count({ where: buildWhere(query) });
}

async function countRaw(query) {
  return db.RawMaterialOrder.count({ where: buildWhere(query) });
}

async function countChamber(query) {
  const ids = parseIds(query.chamberIds);
  if (!ids.length) return 0;

  const where = buildWhere(query);

  const stocks = await db.ChamberStock.findAll({ where });
 
  return stocks.filter(stock =>
    stock.chamber?.some(c => ids.includes(c.id))
  ).length;
}

module.exports = {
  dashboard: exportDashboard,
  chamber: exportChamber,
  production: exportProduction,
  dispatch: exportDispatch,
  raw: exportRaw,

  count: {
    dashboard: countDashboard,
    production: countProduction,
    dispatch: countDispatch,
    raw: countRaw,
    chamber: countChamber,
  },
};