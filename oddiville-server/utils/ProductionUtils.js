const {
  Production: productionClient,
  ChamberStock: chamberStockClient,
  Lanes: lanesClient,
  Chambers: chamberClient,
  RawMaterialOrder: rawMaterialOrderClient,
} = require("../models");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3Client");
const {dispatchAndSendNotification} = require("./dispatchAndSendNotification");
const notificationTypes = require("../types/notification-types");
require("dotenv").config();
const { sendProductionCompleteNotification } = require("./notification");

const uploadToS3 = async (file) => {
  const id = uuidv4();
  const fileKey = `production/${id}-${file.originalname}`;
  const bucketName = process.env.AWS_BUCKET_NAME;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return { url, key: fileKey };
};

function parseExistingImages(rawImages) {
  if (!rawImages) return [];
  try {
    return JSON.parse(rawImages);
  } catch {
    throw { status: 400, error: "Invalid existing_sample_images format" };
  }
}

async function uploadNewImages(files) {
  return Promise.all(files.map((file) => uploadToS3(file))); // expected to return { url, key }
}

async function fetchProductionOrFail(id) {
  const prod = await productionClient.findOne({ where: { id } });
  if (!prod) throw { status: 404, error: "Production not found" };
  return prod;
}

async function validateLaneAssignment(laneId, productionId) {
  const laneRecord = await lanesClient.findOne({ where: { id: laneId } });
  if (!laneRecord) throw { status: 404, error: "Lane not found" };

  if (laneRecord.production_id && laneRecord.production_id !== productionId) {
    throw { status: 400, error: "Lane already assigned to another production" };
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
  const production = await productionClient.findByPk(id, { transaction: opts.tx });
  if (!production) throw { status: 404, message: "Production not found" };
  if (production.status === "completed")
    throw { status: 400, message: "Production already completed" };
  return production;
}

async function validateAndFetchChambers(chambers, opts = {}) {
  if (!Array.isArray(chambers) || chambers.length === 0) {
    throw {
      status: 400,
      message: "Chambers array is required and must not be empty",
    };
  }

  const ids = chambers.map((c) => c.id);
  const validChambers = await chamberClient.findAll({
    where: { id: ids },
    transaction: opts.tx,   
    lock: opts.tx ? opts.tx.LOCK.UPDATE : undefined, 
  });

  if (validChambers.length !== chambers.length) {
    throw { status: 404, message: "One or more chambers not found" };
  }

  return validChambers;
}


async function validateAndFetchRawMaterial(id) {
  const rawMaterial = await rawMaterialOrderClient.findByPk(id);
  if (!rawMaterial) throw { status: 404, message: "Raw Material not found" };
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
  const parseSize = Number(packaging_size)
  const rec = Number(recovery) || 0;
  const wastage = Number(wastage_quantity) || 0;

  production.wastage_quantity =
    wastage === 0
      ? String(qty - rec)
      : String(wastage);
  production.end_time = endTime || new Date();
  production.status = "completed";
  production.recovery = recovery;
  production.packaging = {
    type: packaging_type,
    size: packaging_size,
    count: parseInt(qty/parseSize)
  };
  const saved = await production.save({ transaction: opts.tx });
  return saved; 
}

async function updateChamberStocks(production, chambers, chamberInstances, opts = {}) {
  const { product_name, unit, quantity, raw_material_order_id } = production;

  const rawMaterialOrder = await validateAndFetchRawMaterial(raw_material_order_id, opts);

  let stock = await chamberStockClient.findOne({
    where: { product_name, category: "material" },
    transaction: opts.tx,
    lock: opts.tx ? opts.tx.LOCK.UPDATE : undefined,
  });

  const newChamberData = chambers.map((c) => ({
    id: c.id,
    quantity: String(c.quantity),
    rating: String(c.rating),
  }));

  const chamberMap = new Map(chamberInstances.map((c) => [String(c.id), c]));

  let imageVal = null;
  try {
    const rawImg = rawMaterialOrder?.sample_image ?? null;

    if (!rawImg) {
      imageVal = null;
    } else if (typeof rawImg === "string") {
      imageVal = rawImg;
    } else if (Array.isArray(rawImg)) {
      const first = rawImg.find((x) => x && (typeof x === "string" || typeof x.url === "string"));
      if (first) {
        imageVal = typeof first === "string" ? first : first.url;
      } else {
        imageVal = null;
      }
    } else if (typeof rawImg === "object" && rawImg.url) {
      imageVal = rawImg.url;
    } else {
      console.warn("updateChamberStocks: unsupported rawMaterialOrder.sample_image shape:", rawImg);
      imageVal = null;
    }
  } catch (e) {
    console.warn("updateChamberStocks: error normalizing image:", e);
    imageVal = null;
  }

  if (!stock) {
    stock = await chamberStockClient.create(
      {
        product_name,
        category: "material",
        unit,
        chamber: newChamberData,
      },
      { transaction: opts.tx }
    );

    for (const { id } of chambers) {
      const chamber = chamberMap.get(String(id));
      if (chamber) {
        const items = new Set(chamber.items || []);
        items.add(stock.id);
        chamber.items = Array.from(items);
        await chamber.save({ transaction: opts.tx });
      }
    }
  } else {
    let chambersList = stock.chamber || [];

    for (const c of chambers) {
      const index = chambersList.findIndex(
        (item) => String(item.id) === String(c.id) && item.rating === String(c.rating)
      );

      if (index >= 0) {
        chambersList[index].quantity = String(
          Number(chambersList[index].quantity) + Number(c.quantity)
        );
      } else {
        chambersList.push({
          id: c.id,
          quantity: String(c.quantity),
          rating: String(c.rating),
        });
      }

      const chamber = chamberMap.get(String(c.id));
      if (chamber) {
        const items = new Set(chamber.items || []);
        items.add(stock.id);
        chamber.items = Array.from(items);
        await chamber.save({ transaction: opts.tx });
      }
    }

    await chamberStockClient.update(
      { chamber: chambersList, image: imageVal },
      { where: { id: stock.id }, transaction: opts.tx }
    );
  }

  return stock;
}

async function updateRawMaterialStoreDate(production, opts = {}) {
  if (production.raw_material_order_id) {
    const order = await rawMaterialOrderClient.findByPk(production.raw_material_order_id, { transaction: opts.tx });
    if (order) {
      order.store_date = production.end_time || new Date();
      await order.save({ transaction: opts.tx });
    }
  }
}

async function clearLaneAssignment(production, opts = {}) {
  if (production.lane) {
    const lane = await lanesClient.findByPk(production.lane, { transaction: opts.tx });
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
  uploadToS3,
  createAndSendProductionStartNotification,
  createAndSendProductionCompleteNotification,
  // validateAndFetchRawMaterial,
};
