const router = require("express").Router();
const { WorkLocation } = require("../models");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3Client");

const upload = multer();

const uploadToS3 = async (file) => {
    const id = uuidv4();
    const fileKey = `work-location/${id}-${file.originalname}`;
    const bucketName = process.env.AWS_BUCKET_NAME;

    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    }));

    const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return { url, key: fileKey };
};

// CREATE
router.post("/", upload.single("sample_image"), async (req, res) => {
    try {
        const { location_name, description } = req.body;

        if (!location_name) {
            return res.status(400).json({ error: "Missing required field: location_name." });
        }

        // Validate: Check if a work location with the same name already exists
        const existingLocation = await WorkLocation.findOne({ where: { location_name: location_name.trim() } });
        if (existingLocation) {
            return res.status(409).json({ error: "Work location with this name already exists." });
        }

        let sample_image = null;
        if (req.file) {
            const uploaded = await uploadToS3(req.file);
            sample_image = {
                url: uploaded.url,
                key: uploaded.key,
            };
        }

        const newWorkLocation = await WorkLocation.create({
            location_name: location_name.trim(),
            description,
            sample_image,
        });

        res.status(201).json(newWorkLocation);
    } catch (error) {
        console.error("Create Work Location Error:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// READ ALL
router.get("/", async (req, res) => {
    try {
        const workLocations = await WorkLocation.findAll();

        res.status(200).json(workLocations);
    } catch (error) {
        console.error("Get All Work Locations Error:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// READ BY ID
router.get("/:id", async (req, res) => {
    try {
        const workLocation = await WorkLocation.findByPk(req.params.id);
        if (!workLocation) return res.status(404).json({ error: "Work location not found." });

        res.status(200).json(workLocation);
    } catch (error) {
        console.error("Get Work Location By ID Error:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// UPDATE
router.put("/:id", upload.single("sample_image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, deleteBanner } = req.body;

    if (location_name) {
      const existingLocation = await WorkLocation.findOne({
        where: { location_name: location_name.trim() },
      });
      if (existingLocation && String(existingLocation.id) !== String(id)) {
        return res
          .status(409)
          .json({ error: "Another work location with this name already exists." });
      }
    }

    const existing = await WorkLocation.findByPk(id);
    if (!existing) return res.status(404).json({ error: "Work location not found." });

    const oldKey = existing.sample_image?.key || null;
    let newUploaded = null;

    const updatePayload = {
      location_name: typeof location_name === "string" ? location_name.trim() : existing.location_name,
      description:
        typeof req.body.description === "string" ? req.body.description : existing.description,
    };

    try {
      if (req.file) {
        console.info(`[PUT /work-location/${id}] req.file present: name=${req.file.originalname}, size=${req.file.size}`);
        newUploaded = await uploadToS3(req.file);

        if (!newUploaded || !newUploaded.url || !newUploaded.key) {
          console.warn(`[PUT /work-location/${id}] uploadToS3 returned unexpected value:`, newUploaded);
          throw new Error("S3 upload returned invalid response");
        }

        console.info(`[PUT /work-location/${id}] uploaded to s3: key=${newUploaded.key}`);
        updatePayload.sample_image = {
          url: newUploaded.url,
          key: newUploaded.key,
        };
      } else if (deleteBanner === "true" || deleteBanner === true) {
        updatePayload.sample_image = null;
      } else {
      }

      const [count, [updatedWorkLocation]] = await WorkLocation.update(updatePayload, {
        where: { id },
        returning: true,
      });

      if (count === 0) {
        if (newUploaded) {
          try {
            await s3.send(
              new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: newUploaded.key,
              })
            );
            console.info(`[PUT /work-location/${id}] cleaned up newly uploaded key=${newUploaded.key} after DB failure`);
          } catch (cleanupErr) {
            console.warn(`[PUT /work-location/${id}] cleanup failed for newly uploaded object:`, cleanupErr);
          }
        }
        return res
          .status(404)
          .json({ error: "Work location not found or not updated (DB update failed)." });
      }

      if (oldKey && ((newUploaded && newUploaded.key) || updatePayload.sample_image === null)) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );
          console.info(`[PUT /work-location/${id}] deleted old S3 object key=${oldKey}`);
        } catch (delErr) {
          console.warn(`[PUT /work-location/${id}] failed to delete old S3 object key=${oldKey}`, delErr);
        }
      }

      return res.status(200).json(updatedWorkLocation);
    } catch (innerErr) {
      if (newUploaded) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: newUploaded.key,
            })
          );
          console.info(`[PUT /work-location/${id}] cleaned up new upload due to inner error (key=${newUploaded.key})`);
        } catch (cleanupErr) {
          console.warn(`[PUT /work-location/${id}] cleanup of new upload failed after inner error:`, cleanupErr);
        }
      }
      throw innerErr;
    }
  } catch (error) {
    console.error("Update Work Location Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const workLocation = await WorkLocation.findByPk(req.params.id);
        if (!workLocation) return res.status(404).json({ error: "Work location not found." });

        await workLocation.destroy();
        res.status(200).json({ message: "Deleted successfully", data: workLocation });
    } catch (error) {
        console.error("Delete Work Location Error:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
