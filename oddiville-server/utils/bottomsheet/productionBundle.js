const { isValidUUID } = require("../auth");
const {
    Vendors: VendorClient,
    RawMaterialOrder: RawMaterialOrderClient,
    Production: ProductionClient,
    Lanes: LaneClient,
} = require("../../models");

async function loadProductionBundle(ctx) {
    if (!isValidUUID(ctx.id)) return;

    const prod = await ProductionClient.findOne({ where: { id: ctx.id }, raw: true });
    ctx.production = prod || {};

    if (isValidUUID(prod?.raw_material_order_id)) {
        ctx.rawMaterialOrder = await RawMaterialOrderClient.findOne({
            where: { id: prod.raw_material_order_id },
            raw: true,
        }) || {};
    }

    
    if (isValidUUID(prod?.lane)) {
        ctx.lane = await LaneClient.findOne({
            where: { id: prod.lane },
            raw: true,
        }) || {};
    }

    if (prod?.vendor) {
        ctx.vendor = await VendorClient.findOne({
            where: { name: prod.vendor },
            raw: true,
        }) || {};
    }
}

module.exports = { loadProductionBundle }