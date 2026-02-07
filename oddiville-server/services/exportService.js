const ExcelJS = require("exceljs");
const { Op } = require("sequelize");
const getDateRange = require("../utils/dateRange");
const db = require("../models");

const parseIds = (ids) =>
    ids ? ids.split(",").map(Number).filter(Boolean) : [];

const buildWhere = (query, includeChamber = true) => {
    const range = getDateRange(query.range, query.from, query.to);
    const chamberIds = parseIds(query.chamberIds);

    return {
        ...(range && { createdAt: { [Op.between]: range } }),
        ...(includeChamber && chamberIds.length && {
            chamber_id: { [Op.in]: chamberIds },
        }),
    };
};

const addSheet = (workbook, name, rows) => {
    const ws = workbook.addWorksheet(name);

    if (!rows.length) return;

    ws.columns = Object.keys(rows[0].toJSON()).map((k) => ({
        header: k,
        key: k,
        width: 20,
    }));

    ws.addRows(rows.map((r) => r.toJSON()));
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
        db.Production.findAll({ where }),
        db.PackingEvent.findAll({ where }),
        db.DispatchOrder.findAll({ where }),
        db.RawMaterialOrder.findAll({ where }),
        db.ChamberStock.findAll({ where }), // now filtered
        db.OthersItem.findAll({ where }),
    ]);

    const sheet = workbook.addWorksheet("Summary");

    sheet.addRows([
        ["Filter", query.range || "all"],
        ["Raw Orders", raws.length],
        ["Productions", productions.length],
        ["Packing Events", packing.length],
        ["Dispatch Orders", dispatch.length],
        ["Stock Items", stocks.length],
        ["Third Party Items", others.length],
    ]);

    addSheet(workbook, "Raw Materials", raws);
    addSheet(workbook, "Production", productions);
    addSheet(workbook, "Packing", packing);
    addSheet(workbook, "Dispatch", dispatch);
    addSheet(workbook, "Stock", stocks);
    addSheet(workbook, "Third Party", others);

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

        ws.addRows([
            ["Chamber", chamber.chamber_name],
            ["Capacity", chamber.capacity],
            ["Items Count", stocks.length],
            [],
        ]);

        if (stocks.length) {
            ws.columns = Object.keys(stocks[0].toJSON()).map((k) => ({
                header: k,
                key: k,
                width: 20,
            }));

            ws.addRows(stocks.map((s) => s.toJSON()));
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
        where: { chamber_id: { [Op.in]: ids } },
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