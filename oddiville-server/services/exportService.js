const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const getDateRange = require("../utils/dateRange");
const db = require("../models");
const { sanitizeRow, applyColumnOrder } = require("../utils/export/sanitizeExportRows")
const parseIds = (ids) =>
    ids ? ids.split(",").map((id) => id.trim()).filter(Boolean) : [];

const buildWhere = (query, options = {}) => {
    const range = getDateRange(query.range, query.from, query.to);
    const chamberIds = parseIds(query.chamberIds);

    return {
        ...(range && { createdAt: { [Op.between]: range } }),
        ...(options.withChamber && chamberIds.length && {
            chamber_id: { [Op.in]: chamberIds },
        }),
    };
};

const addSheet = (workbook, name, rows, extraRemove = [], chamberMap = {}) => {
    const ws = workbook.addWorksheet(name);

    if (!rows.length) return;

    const cleanRows = rows.map((r) => sanitizeRow(r, extraRemove, { chamberMap, sheetName: name }));

    const orderedRows = applyColumnOrder(cleanRows, name);

    const allKeys = [
        ...new Set(
            orderedRows.flatMap(row => Object.keys(row))
        )
        ];

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
        db.Production.findAll({ where,
  include: [
    {
      model: db.Lanes,
      as: "lane",
      attributes: ["name"],
    },
  ], }),
        db.PackingEvent.findAll({ where }),
        db.DispatchOrder.findAll({ where }),
        db.RawMaterialOrder.findAll({ where }),
        db.ChamberStock.findAll({ where }), // now filtered
        db.OthersItem.findAll({ where }),
    ]);

    const sheet = workbook.addWorksheet("Summary");

    const chamberIds = [
  ...new Set(
    packing.flatMap(p =>
      (p.storage || []).map(s => s.chamberId)
    )
  )
];

const chambers = await db.Chambers.findAll({
  where: { id: { [Op.in]: chamberIds } },
  attributes: ["id", "chamber_name"],
});

const chamberMap = Object.fromEntries(
  chambers.map(c => [c.id, c.chamber_name])
);

const rmRows = [];

for (const pack of packing) {
  const productName = pack.product_name;

  const rm = pack.rm_consumption || {};

  for (const rmName in rm) {
    const chamberData = rm[rmName];

    for (const chamberId in chamberData) {
      const data = chamberData[chamberId];

      rmRows.push({
        product_name: productName,
        raw_material: rmName,
        chamber_name: chamberMap[chamberId] || "",
        rating: data.rating,
        outer_used: data.outer_used,
      });
    }
  }
}

const dispatchItemRows = [];

for (const order of dispatch) {
  const customerName = order.customer_name;
  const dispatched = order.dispatched_items || {};
  const products = order.products || [];

  // Build product lookup
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
      rating: c.rating,
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

    const chambers = await db.Chambers.findAll({
        where: { id: { [Op.in]: ids } },
    });

    for (const chamber of chambers) {
        const stocks = await db.ChamberStock.findAll({
            where: { chamber_id: chamber.id },
        });

        const ws = workbook.addWorksheet(chamber.chamber_name);
        ws.views = [{ state: "frozen", ySplit: 1 }];

        ws.addRows([
            ["Chamber", chamber.chamber_name],
            ["Capacity", chamber.capacity],
            ["Items Count", stocks.length],
            [],
        ]);

        if (stocks.length) {
            const cleanStocks = stocks.map((s) => sanitizeRow(s));

            ws.columns = Object.keys(cleanStocks[0]).map((k) => ({
                header: k.replace(/_/g, " ").toUpperCase(),
                key: k,
                width: 20,
            }));

            ws.addRows(cleanStocks);
        }
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

    return db.ChamberStock.count({
        where: buildWhere(query, { withChamber: true }),
    });
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