const { buildOrderSchemas, buildRawMaterialSchemas, buildProductionSchemas, buildWorkerSchemas, buildVendorSchemas, buildGeographySchemas, buildCalendarSchemas, buildPackingSummarySchema, buildUISchemas } = require("./buildSchemas");

const getFillerSchema = (ctx) => {
  const {
    // collections
    rawMaterials = [],
    vendors = [],
    chambers = [],
    contractors = [],
    productNames = [],

    dispatchOrder: order = {},
    rawMaterialOrder: rmOrder = {},
    lane = {},
    production = {},
    vendor = {},
    calendarEvent = {},

    // geography
    countries = [],
    states = [],
    cities = [],

    // auth & packing
    currentUser = {},
    packingSummary = {},

    packages = [],
    packingEvents = [],
    chamberStocks = [],
  } = ctx;

  const orderSchemas = buildOrderSchemas({
    order,
    chambers,
    currentUser,
    packages,
  });

  const rawMaterialSchemas = buildRawMaterialSchemas({
    rmOrder,
    vendors,
    currentUser,
  });

  const productionSchemas = buildProductionSchemas({
    production,
    lane,
    rmOrder,
  });

  const workerSchemas = buildWorkerSchemas({
    contractors,
  });

  const vendorSchemas = buildVendorSchemas({ vendors });

  const geographySchemas = buildGeographySchemas({
    countries,
    states,
    cities,
  });

  const calendarSchemas = buildCalendarSchemas({
    calendarEvent,
  });

  const packingSummarySchema = buildPackingSummarySchema({
    packingSummary,
  });

  const uiSchemas = buildUISchemas({
    rawMaterials,
    productNames,
    chambers,
    packingEvents,
    chamberStocks,
  });

  if (process.env.NODE_ENV === "development") {
    const keys = Object.keys({
      ...orderSchemas,
      ...rawMaterialSchemas,
      ...productionSchemas,
      ...workerSchemas,
      ...vendorSchemas,
      ...geographySchemas,
      ...calendarSchemas,
      ...packingSummarySchema,
      ...uiSchemas,
    });

    const duplicates = keys.filter(
      (k, i) => keys.indexOf(k) !== i
    );

    if (duplicates.length) {
      console.warn("Duplicate schema keys:", duplicates);
    }
  }

  return {
    ...orderSchemas,
    ...rawMaterialSchemas,
    ...productionSchemas,
    ...workerSchemas,
    ...vendorSchemas,
    ...geographySchemas,
    ...calendarSchemas,
    ...packingSummarySchema,
    ...uiSchemas, 
  };
};

module.exports = { getFillerSchema };
