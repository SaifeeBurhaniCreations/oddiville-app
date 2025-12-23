const {
  Production: productionClient,
  ChamberStock: chamberStockClient,
  Lanes: lanesClient,
  Chambers: chamberClient,
  RawMaterialOrder: rawMaterialOrderClient,
} = require("../models");
const {
  dispatchAndSendNotification,
} = require("./dispatchAndSendNotification");
require("dotenv").config();
const { uploadToS3 } = require("../services/s3Service");
const { throwHttpError } = require("../utils/normalizeError");

function parseExistingImages(rawImages) {
  if (!rawImages) return [];
  if (Array.isArray(rawImages)) return rawImages;
  try {
    return JSON.parse(rawImages);
  } catch {
    throwHttpError("Invalid existing_sample_images format", 400);
  }
}
const normalizeRating = (r) => {
  if (r === null || r === undefined) return null;
  const s = String(r).trim();
  return s === "" ? null : s;
};


function buildChamberStockPackagingFromProduction(production) {
  return {
    size: {
      value: Number(production.packaging.size),
      unit: production.unit || "kg",
    },
    type: production.packaging.type,
    count: Number(production.packaging.count),
  };
}

function mergeChamberStockPackaging(existing, incoming) {
  if (!existing) return incoming;

  if (
    existing.size.value === incoming.size.value &&
    existing.size.unit === incoming.size.unit &&
    existing.type === incoming.type
  ) {
    return {
      ...existing,
      count: Number(existing.count) + Number(incoming.count),
    };
  }

  // if size/type differ, overwrite is NOT allowed from production
  // production always represents same loose batch size
  return existing;
}

async function uploadNewImages(files) {
  return Promise.all(
    files.map((file) => uploadToS3({file, folder: "production"}))
  );
}

async function fetchProductionOrFail(id) {
  const prod = await productionClient.findOne({ where: { id } });
  if (!prod) throwHttpError("Production not found", 404);
  return prod;
}

async function validateLaneAssignment(laneId, productionId) {
  const laneRecord = await lanesClient.findOne({ where: { id: laneId } });
  if (!laneRecord) throwHttpError("Lane not found", 404);

  if (laneRecord.production_id && laneRecord.production_id !== productionId) {
    throwHttpError("Lane already assigned to another production", 400);
  }

  return laneRecord;
}

function buildUpdatedFields({
  otherFields,
  allImages,
  lane,
  start_time,
  currentProductionStatus,
}) {
  const fields = {
    ...otherFields,
    sample_images: allImages,
    updatedAt: new Date(),
  };
  if (!start_time || start_time === null) fields.start_time = new Date();
  if (lane) fields.lane = lane;
  if (currentProductionStatus !== "in-progress") {
    fields.status = "in-progress";
  }
  return fields;
}

async function updateProductionRecord(id, updatedFields) {
  const [updatedCount, updatedRows] = await productionClient.update(
    updatedFields,
    {
      where: { id },
      returning: true,
    }
  );
  return updatedCount > 0 ? updatedRows[0] : null;
}

async function createAndSendProductionStartNotification(productionData, lane) {
  const { id, product_name, quantity, unit } = productionData;
  const description = [`${quantity}${unit ?? ""}`.trim(), lane].filter(Boolean);
  dispatchAndSendNotification({
    type: "production-start",
    description,
    title: product_name,
    id,
  });
}

async function createAndSendProductionCompleteNotification(
  productionData,
  chambers
) {
  const { id, product_name, recovery, unit } = productionData;
  const description = [
    `${recovery}${unit}`,
    chambers?.map((ch) => ch?.chamber_name).join(", "),
  ]?.filter(Boolean);

  // Send notification
  dispatchAndSendNotification({
    type: "production-completed",
    description,
    title: product_name,
    id,
  });
}

async function validateAndFetchProduction(id, opts = {}) {
  const production = await productionClient.findByPk(id, {
    transaction: opts.tx,
  });
  if (!production) throwHttpError("Production not found", 404);
  if (production.status === "completed")
    throwHttpError("Production already completed", 400);
  return production;
}

async function validateAndFetchChambers(chambers, opts = {}) {
  if (!Array.isArray(chambers) || chambers.length === 0) {
    throwHttpError("Chambers array is required and must not be empty", 400);
  }

  const ids = chambers.map((c) => c.id);
  const validChambers = await chamberClient.findAll({
    where: { id: ids },
    transaction: opts.tx,
    lock: opts.tx ? opts.tx.LOCK.UPDATE : undefined,
  });

  if (validChambers.length !== chambers.length) {
    throwHttpError("One or more chambers not found", 404);
  }

  return validChambers;
}

async function validateAndFetchRawMaterial(id) {
  const rawMaterial = await rawMaterialOrderClient.findByPk(id);
  if (!rawMaterial) throwHttpError("Raw Material not found", 404);
  return rawMaterial;
}

async function updateProductionCompletion(
  production,
  packaging_type,
  packaging_size,
  endTime,
  wastage_quantity,
  recovery,
  opts = {}
) {
  const qty = Number(production.quantity) || 0;
  const parseSize = Number(packaging_size);
  const rec = Number(recovery) || 0;
  const wastage = Number(wastage_quantity) || 0;

  production.wastage_quantity =
    wastage === 0 ? String(qty - rec) : String(wastage);
  production.end_time = endTime || new Date();
  production.status = "completed";
  production.recovery = recovery;
  production.packaging = {
    type: packaging_type,
    size: packaging_size,
    count: parseSize > 0 ? Math.floor(rec / parseSize) : 0,
  };
  const saved = await production.save({ transaction: opts.tx });
  return saved;
}

async function updateChamberStocks(
  production,
  chambers,
  chamberInstances,
  opts = {}
) {
  const { product_name, unit, raw_material_order_id } = production;

  const rawMaterialOrder = await validateAndFetchRawMaterial(
    raw_material_order_id,
    opts
  );

  const newChamberData = chambers.map((c) => ({
    id: c.id,
    quantity: String(c.quantity),
    rating: String(c.rating),
  }));

  const chamberMap = new Map(chamberInstances.map((c) => [String(c.id), c]));

  let imageVal = null;
  try {
    const rawImg = rawMaterialOrder?.sample_image ?? null;
    if (typeof rawImg === "string") imageVal = rawImg;
    else if (Array.isArray(rawImg)) {
      const first = rawImg.find(
        (x) => x && (typeof x === "string" || typeof x.url === "string")
      );
      imageVal = first ? (typeof first === "string" ? first : first.url) : null;
    } else if (rawImg?.url) {
      imageVal = rawImg.url;
    }
  } catch {
    imageVal = null;
  }

  const incomingPackaging =
    buildChamberStockPackagingFromProduction(production);

  let stock = await chamberStockClient.findOne({
    where: { product_name, category: "material" },
    transaction: opts.tx,
    lock: opts.tx ? opts.tx.LOCK.UPDATE : undefined,
  });

  if (!stock) {
    stock = await chamberStockClient.create(
      {
        product_name,
        category: "material",
        unit,
        packaging: incomingPackaging,
        chamber: newChamberData,
        image: imageVal,
      },
      { transaction: opts.tx }
    );
  }
  else {
    let chambersList = stock.chamber || [];

    for (const c of chambers) {
      const index = chambersList.findIndex(
  (item) => String(item.id) === String(c.id)
);

const incomingRating = normalizeRating(c.rating);

if (index >= 0) {
  chambersList[index].quantity = String(
    Number(chambersList[index].quantity) + Number(c.quantity)
  );

  if (incomingRating !== null) {
    chambersList[index].rating = incomingRating;
  }
} else {
  chambersList.push({
    id: c.id,
    quantity: String(c.quantity),
    rating: incomingRating ?? "5",
  });
}
    }

    const updatedPackaging = mergeChamberStockPackaging(
      stock.packaging,
      incomingPackaging
    );

    await chamberStockClient.update(
      {
        chamber: chambersList,
        packaging: updatedPackaging,
        image: imageVal,
      },
      { where: { id: stock.id }, transaction: opts.tx }
    );
  }

  // 🔗 link stock to chambers
  for (const { id } of chambers) {
    const chamber = chamberMap.get(String(id));
    if (chamber) {
      const items = new Set(chamber.items || []);
      items.add(stock.id);
      chamber.items = Array.from(items);
      await chamber.save({ transaction: opts.tx });
    }
  }

  return stock;
}

async function updateRawMaterialStoreDate(production, opts = {}) {
  if (production.raw_material_order_id) {
    const order = await rawMaterialOrderClient.findByPk(
      production.raw_material_order_id,
      { transaction: opts.tx }
    );
    if (order) {
      order.store_date = production.end_time || new Date();
      await order.save({ transaction: opts.tx });
    }
  }
}

async function clearLaneAssignment(production, opts = {}) {
  if (production.lane) {
    const lane = await lanesClient.findByPk(production.lane, {
      transaction: opts.tx,
    });
    if (lane) {
      lane.production_id = null;
      await lane.save({ transaction: opts.tx });
    }
  }
}

module.exports = {
  parseExistingImages,
  uploadNewImages,
  fetchProductionOrFail,
  validateLaneAssignment,
  buildUpdatedFields,
  updateProductionRecord,
  validateAndFetchProduction,
  validateAndFetchChambers,
  updateProductionCompletion,
  updateChamberStocks,
  updateRawMaterialStoreDate,
  clearLaneAssignment,
  createAndSendProductionStartNotification,
  createAndSendProductionCompleteNotification,
  // validateAndFetchRawMaterial,
};
