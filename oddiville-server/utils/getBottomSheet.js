  const { getFillerSchema } =  require("../schemas/fillerSchema");
  const {
    fillRawMaterialSchema,
    fillRawMaterialAddSchema,
    fillWorkerMultipleSchema,
    fillWorkerSingleSchema,
    fillPackageComesToEndSchema,
    fillOrderReadySchema,
    fillVendorSchema,
    fillChamberListSchema,
    fillCountrySchema,
    fillStateSchema,
    fillCitySchema,
    fillProductAddSchema,
    fillMultipleChamberListSchema,
    fillLaneOccupiedSchema,
    fillProductionStartedSchema,
    fillProductionCompletedSchema,
    fillOrderShippedSchema,
    fillOrderReachedSchema,
    fillCalendarEventSchema,
    fillScheduledDateEventSchema,
    fillPackingSummarySchema,
    fillMultipleProductCardSchema,
  } = require("../utils/fillers");
  const { schemaMap } = require('../constants/constants');

const bottomSheetFillers = {
  "order-ready": fillOrderReadySchema,
  "order-shipped": fillOrderShippedSchema,
  "order-reached": fillOrderReachedSchema,
  "raw-material-reached": fillRawMaterialSchema,
  "raw-material-ordered": fillRawMaterialSchema,
  "package-comes-to-end": fillPackageComesToEndSchema,
  "worker-multiple": fillWorkerMultipleSchema,
  "worker-single": fillWorkerSingleSchema,
  "add-raw-material": fillRawMaterialAddSchema,
  "add-product": fillProductAddSchema,
  "choose-product": fillRawMaterialAddSchema,
  "add-vendor": fillVendorSchema,
  "chamber-list": fillChamberListSchema,
  "multiple-chamber-list": fillMultipleChamberListSchema,
  "country": fillCountrySchema,
  "state": fillStateSchema,
  "city": fillCitySchema,
  "lane-occupied": fillLaneOccupiedSchema,
  "production-start": fillProductionStartedSchema,
  "production-completed": fillProductionCompletedSchema,
  "calendar-event-scheduled": fillCalendarEventSchema,
  "calendar-event-reminder": fillScheduledDateEventSchema,
  "packing-summary": fillPackingSummarySchema,
  "multiple-product-card": fillMultipleProductCardSchema,
};

function getBottomSheet(ctx) {
  const fillerSchema = getFillerSchema(ctx);

  const fillFn = bottomSheetFillers[ctx.type];

  if (!fillFn) {
    return [{ error: "Invalid type" }];
  }

  if (ctx.type === "packing-summary") {
    return fillFn(schemaMap[ctx.type], fillerSchema[ctx.type] || {}, ctx.meta);
  }

  return fillFn(schemaMap[ctx.type], fillerSchema[ctx.type] || {});
}

module.exports = { getBottomSheet };
