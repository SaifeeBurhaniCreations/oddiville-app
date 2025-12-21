const router = require("express").Router();
const {
  Production: productionClient,
  Lanes: lanesClient,
  RawMaterialOrder: rawMaterialOrderClient,
  Chambers: chambersClient,
} = require("../models");

const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");

const {
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
} = require("../utils/ProductionUtils");
require("dotenv").config();
const sequelize = require("../config/database");
const { uploadToS3, deleteFromS3 } = require("../services/s3Service");  
const upload = require("../middlewares/upload");

router.post("/", upload.single("sample_image"), async (req, res) => {
  try {
    const io = req.app.get("io");
    const redis = req.app.get("redis");

    const {
      product_name,
      quantity,
      raw_material_id,
      start_time,
      end_time,
      status,
      batch_code,
      notes,
      supervisor,
    } = req.body;

    if (
      !product_name ||
      typeof product_name !== "string" ||
      product_name.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Product name is required and must be a non-empty string.",
      });
    }
    if (
      quantity === undefined ||
      isNaN(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        error: "Quantity (kg) is required and must be a positive number.",
      });
    }
    if (!raw_material_id) {
      return res.status(400).json({ error: "Raw material ID is required." });
    }
    if (!start_time) {
      return res.status(400).json({ error: "Start time is required." });
    }

    if (
      !batch_code ||
      typeof batch_code !== "string" ||
      batch_code.trim().length === 0
    ) {
      return res.status(400).json({
        error: "Batch code is required and must be a non-empty string.",
      });
    }
    if (
      !supervisor ||
      typeof supervisor !== "string" ||
      supervisor.trim().length === 0
    ) {
      return res.status(400).json({
        error: "supervisor is required and must be a non-empty string.",
      });
    }

    let startTime = null;
    if (start_time) {
      startTime = new Date(start_time);
      if (Number.isNaN(startTime.getTime())) {
        return res
          .status(400)
          .json({ error: "start_time must be a valid date." });
      }
    }

    let endTime = null;
    if (end_time) {
      endTime = new Date(end_time);
      if (Number.isNaN(endTime.getTime())) {
        return res
          .status(400)
          .json({ error: "end_time must be a valid date." });
      }
    }

    let sampleImage = null;
    if (req.file) {
      const uploaded = await uploadToS3(req.file, "production");
      if (!uploaded?.url || !uploaded?.key) {
        return res
          .status(500)
          .json({ error: "Failed to upload sample image." });
      }
      sampleImage = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    const newProduction = await productionClient.create({
      product_name: product_name.trim(),
      quantity: Number(quantity),
      raw_material_order_id: raw_material_id,
      start_time: startTime,
      end_time: endTime,
      status: status || "in-progress",
      batch_code: batch_code.trim(),
      notes: notes || null,
      sample_image: sampleImage,
      supervisor,
    });

    await redis.set(`production:save:${newProduction.id}`, true);
    const isStarted = true;

    const productionDetails = {
      title: "START PRODUCTION",
      timestamp: new Date().toISOString(),
      product_name: newProduction.product_name,
      quantity: newProduction.quantity,
      raw_material_order_id: newProduction.raw_material_order_id,
      start_time: newProduction.start_time,
      end_time: newProduction.end_time,
      status: newProduction.status,
      batch_code: newProduction.batch_code,
      notes: newProduction.notes,
      sample_image: newProduction.sample_image,
      date: new Date().toDateString(),
      isStarted,
    };

    io.emit("production:status-changed", productionDetails);
    return res.status(201).json({ ...newProduction, isStarted });
  } catch (error) {
    console.error(
      "Error during adding Material to production:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal  server error, please try again later." });
  }
});

router.get("/", async (req, res) => {
  try {
    const productions = await productionClient.findAll();

    res.status(200).json(productions);
  } catch (error) {
    console.error(
      "Error during fetching Productions:",
      error?.message || error
    );
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const redis = req.app.get("redis");

  try {
    const production = await productionClient.findOne({ where: { id } });

    if (!production) {
      return res.status(404).json({ error: "Production not found" });
    }
const raw = await redis.get(`production:save:${id}`);
const isStarted = raw === "true"; 


    return res.status(200).json({ ...production, isStarted: isStarted ?? false });
  } catch (error) {
    console.error("Error during fetching Production:", error?.message || error);
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const production = await productionClient.findOne({ where: { id } });

    if (!production) {
      return res.status(404).json({ error: "Production not found" });
    }
    await productionClient.destroy({ where: { id } });

    return res
      .status(200)
      .json({ message: "Deleted successfully", data: production });
  } catch (error) {
    console.error("Error during deleting Production:", error?.message || error);
    return res
      .status(500)
      .json({ error: "Internal server error, please try again later." });
  }
});

router.patch("/:id", upload.array("sample_images"), async (req, res) => {
  const { id } = req.params;
  const { lane, existing_sample_images, ...otherFields } = req.body;
  const files = req.files;
  const redis = req.app.get("redis");

  let newImages = []; 

  try {
    const existingImages = parseExistingImages(existing_sample_images);
    newImages = files?.length ? await uploadNewImages(files) : [];
    const allImages = [...existingImages, ...newImages];

    const currentProduction = await fetchProductionOrFail(id);
    const oldLaneId = currentProduction.lane;
    const laneRecord = lane ? await validateLaneAssignment(lane, id) : null;

    const updatedFields = buildUpdatedFields({
      otherFields,
      allImages,
      lane,
      start_time: currentProduction?.start_time,
      currentProductionStatus: currentProduction.status,
    });

    if (updatedFields?.start_time != null) {
      await createAndSendProductionStartNotification(
        currentProduction,
        laneRecord?.name
      );
    }

    const updatedProduction = await updateProductionRecord(id, updatedFields);
    if (!updatedProduction) {
      return res.status(404).json({ error: "Production not found" });
    }

    await redis.set(`production:save:${id}`, true);
    const raw = await redis.get(`production:save:${id}`);
    const isStarted = raw === "true";

    return res.status(200).json({
      ...updatedProduction.dataValues,
      isStarted: isStarted ?? false,
    });
  } catch (error) {
    // ✅ SAFE CLEANUP
    if (newImages.length) {
      for (const img of newImages) {
        if (img?.key) {
          try {
            await deleteFromS3(img.key);
          } catch (delErr) {
            console.warn("Failed to cleanup S3 image:", img.key, delErr);
          }
        }
      }
    }

    console.error("Error during updating Production:", error);
    return res.status(500).json({
      error: "Internal server error, please try again later.",
    });
  }
});

router.patch("/start/:id", upload.single("sample_image"), async (req, res) => {
  const { id } = req.params;
  const {
    status,
    start_time,
    rating,
    sample_quantity,
    supervisor,
    ...otherFields
  } = req.body;

  console.log("START PATCH PAYLOAD", {
    id,
    body: req.body,
    file: !!req.file,
  });

  try {
    // 1️⃣ Fetch production
    const production = await productionClient.findByPk(id);
    if (!production) {
      return res.status(404).json({ error: "Production not found" });
    }

    // 2️⃣ Validate status transition
    if (!status || !["in-queue", "in-progress"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed: in-queue, in-progress",
      });
    }

    // ⛔ Prevent restarting an already running production
    if (production.status === "in-progress" && status === "in-progress") {
      return res.status(400).json({
        error: "Production already started",
      });
    }

    // 3️⃣ Validate lane ONLY if starting production
    let laneRecord = null;
    if (status === "in-progress" && production.lane) {
      laneRecord = await validateLaneAssignment(production.lane, id);
    }

    // 4️⃣ Build update payload (SAFE)
    const updatedFields = {
      status,
      rating: rating ? Number(rating) : production.rating,
      supervisor: supervisor ?? production.supervisor,
      updatedAt: new Date(),
      ...otherFields,
    };

    // 5️⃣ Handle start logic
    if (status === "in-progress") {
      updatedFields.start_time = start_time
        ? new Date(start_time)
        : new Date();

      await createAndSendProductionStartNotification(
        production,
        laneRecord?.name
      );
    }

    // 6️⃣ Preserve old image key for cleanup
    const oldImageKey = production.sample_image?.key || null;
    let newSampleImage = null;

    // 7️⃣ Upload new sample image if provided
    if (req.file) {
      const uploaded = await uploadToS3(req.file, "production");

      if (!uploaded?.url || !uploaded?.key) {
        return res.status(500).json({
          error: "Failed to upload sample image",
        });
      }

      newSampleImage = {
        url: uploaded.url,
        key: uploaded.key,
      };

      updatedFields.sample_image = newSampleImage;
    }

    // 8️⃣ Adjust quantity if sample is used
    if (sample_quantity && Number(sample_quantity) > 0) {
      const newQty =
        Number(production.quantity) - Number(sample_quantity);

      updatedFields.quantity = Math.max(newQty, 0);
    }

    // 9️⃣ Update RawMaterialOrder safely
    if (production.raw_material_order_id) {
      await rawMaterialOrderClient.update(
        {
          sample_quantity: Number(sample_quantity || 0),
          sample_image: newSampleImage ?? production.sample_image,
          rating: rating !== undefined ? Number(rating) : production.rating,
        },
        {
          where: { id: production.raw_material_order_id },
        }
      );
    }

    // 🔟 Update Production
    const [updatedCount, updatedRows] = await productionClient.update(
      updatedFields,
      {
        where: { id },
        returning: true,
      }
    );

    if (!updatedCount) {
      return res.status(404).json({
        error: "Failed to update production",
      });
    }

    // 1️⃣1️⃣ Cleanup old S3 image AFTER success
    if (newSampleImage && oldImageKey) {
      try {
        await deleteFromS3(oldImageKey);
      } catch (cleanupErr) {
        console.warn(
          "Failed to cleanup old image:",
          cleanupErr.message
        );
      }
    }

    return res.status(200).json(updatedRows[0].dataValues);
  } catch (error) {
  console.error("🔥 START ROUTE CRASH 🔥");
  console.error(error);
  console.error(error?.stack);
  console.error("🔥 END ROUTE CRASH 🔥");

  return res.status(error?.status || 500).json({
    error: error?.error || error?.message || "Server error",
  });
}
});

router.patch("/complete/:id", async (req, res) => {
  const productionId = req.params.id;
  const io = req.app.get("io");
  const redis = req.app.get("redis");

  const { end_time, chambers = [], wastage_quantity = 0, packaging_type = "bag", packaging_size = 0 } = req.body;

  let tx;
  try {
    tx = await sequelize.transaction();

    const production = await validateAndFetchProduction(productionId, { tx });

    const chamberInstances = await validateAndFetchChambers(chambers, { tx });

    const chamberIds = chambers.map((c) => c.id);
    const lockedChambers = chamberIds.length
      ? await chambersClient.findAll({
          where: { id: chamberIds },
          transaction: tx,
          lock: tx.LOCK.UPDATE,
        })
      : [];

    const chamberMap = new Map(lockedChambers.map((c) => [String(c.id), c]));

    const insufficient = [];
    for (const requested of chambers) {
      const inst = chamberMap.get(String(requested.id));
      if (!inst) {
        insufficient.push({
          id: requested.id,
          reason: "chamber_not_found",
          requested: Number(requested.quantity || 0),
        });
        continue;
      }

      const requestedQty = Number(requested.quantity || 0);
      const capacity = Number(inst.capacity ?? 0);
      const currentStock = Number(inst.current_stock ?? inst.stored_quantity ?? 0);
      const available = Math.max(0, capacity - currentStock);

      if (requestedQty > available) {
        insufficient.push({
          id: inst.id,
          name: inst.name,
          requested: requestedQty,
          available,
          capacity,
          current_stock: currentStock,
        });
      }
    }

    if (insufficient.length > 0) {
      await tx.rollback();
      return res.status(400).json({
        message: "Insufficient chamber space for requested quantities.",
        details: insufficient,
      });
    }

    const recovery = chambers.reduce((sum, c) => sum + Number(c.quantity || 0), 0);

    const newProduction = await updateProductionCompletion(
      production,
      packaging_type,
      packaging_size,
      end_time,
      wastage_quantity,
      recovery,
      { tx }
    );

    const updatedStock = await updateChamberStocks(
      newProduction,
      chambers,
      lockedChambers,
      { tx }
    );

    if (typeof updateRawMaterialStoreDate === "function") {
      await updateRawMaterialStoreDate(newProduction, { tx });
    }

    if (production.lane) {
      await clearLaneAssignment(production, { tx });
    }

    await tx.commit();
    tx = null;

    const productionCompleteDetails = {
      productionId: newProduction.id,
      productionDetails: {
        id: newProduction.id,
        product_name: newProduction.product_name,
        batch_code: newProduction.batch_code,
        end_time: newProduction.end_time,
        status: newProduction.status,
        packaging: {
          type: newProduction.packaging.type,
          size: newProduction.packaging.size,
          count: newProduction.packaging.count
        },
        chambers: lockedChambers.map((c) => ({
          id: c.id,
          quantity: String(chambers.find((x) => String(x.id) === String(c.id))?.quantity ?? 0),
          rating: String(chambers.find((x) => String(x.id) === String(c.id))?.rating ?? ""),
        })),
        wastage_quantity: newProduction.wastage_quantity,
        recovery: newProduction.recovery,
      },
    };

    try {
      io.emit("production:completed", productionCompleteDetails);
    } catch (emitErr) {
      console.warn("Socket emit failed:", emitErr);
    }

    try {
      await redis.del(`production:save:${productionId}`);
    } catch (rerr) {
      console.warn("Redis cleanup failed:", rerr);
    }

    if (typeof createAndSendProductionCompleteNotification === "function") {
      try {
        await createAndSendProductionCompleteNotification(newProduction, lockedChambers);
      } catch (noteErr) {
        console.warn("create/send notification failed after commit:", noteErr);
      }
    }

    return res.json({
      message: "Production completed, stock updated, lane cleared.",
      production: newProduction,
      updatedStock,
    });
  } catch (err) {
    if (tx) {
      try {
        await tx.rollback();
      } catch (rbErr) {
        console.error("Rollback failed:", rbErr);
      }
    }
    console.error("Completion error:", err);
    if (err && err.details) {
      return res.status(400).json({ message: err.message || "Validation error", details: err.details });
    }
    return res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
});



module.exports = router;
