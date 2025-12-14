const router = require("express").Router();
const { Lanes } = require("../models");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3Client");

const upload = multer();

const uploadToS3 = async (file) => {
  const id = uuidv4();
  const fileKey = `lanes/${id}-${file.originalname}`;
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

// CREATE
router.post("/", upload.single("sample_image"), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Missing required field: name." });
    }

    const existingLane = await Lanes.findOne({ where: { name: name.trim() } });
    if (existingLane) {
      return res
        .status(409)
        .json({ error: "Lane with this name already exists." });
    }

    let sample_image = null;
    if (req.file) {
      const uploaded = await uploadToS3(req.file);
      sample_image = {
        url: uploaded.url,
        key: uploaded.key,
      };
    }

    const newLane = await Lanes.create({
      name: name.trim(),
      description,
      sample_image,
    });

    res.status(201).json(newLane);
  } catch (error) {
    console.error("Create Lane Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// READ ALL
router.get("/", async (req, res) => {
  try {
    const lanes = await Lanes.findAll();

    res.status(200).json(lanes);
  } catch (error) {
    console.error("Get All Lanes Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// READ BY ID
router.get("/:id", async (req, res) => {
  try {
    const lane = await Lanes.findByPk(req.params.id);
    if (!lane) return res.status(404).json({ error: "Lane not found." });

    res.status(200).json(lane);
  } catch (error) {
    console.error("Get Lane By ID Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// UPDATE
router.put("/:id", upload.single("sample_image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, deleteBanner } = req.body;

    if (name) {
      const existingLane = await Lanes.findOne({
        where: { name: name.trim() },
      });
      if (existingLane && String(existingLane.id) !== String(id)) {
        return res
          .status(409)
          .json({ error: "Another lane with this name already exists." });
      }
    }

    const lane = await Lanes.findByPk(id);
    if (!lane) return res.status(404).json({ error: "Lane not found." });

    const oldKey = lane.sample_image?.key || null;
    let newUploaded = null; 

    const updatePayload = {
      name: typeof name === "string" ? name.trim() : lane.name,
      description:
        typeof req.body.description === "string"
          ? req.body.description
          : lane.description,
    };

    try {
      if (req.file) {
        console.info(`[PUT /lanes/${id}] req.file present: name=${req.file.originalname}, size=${req.file.size}`);
        newUploaded = await uploadToS3(req.file);

        if (!newUploaded || !newUploaded.url || !newUploaded.key) {
          console.warn(`[PUT /lanes/${id}] uploadToS3 returned unexpected value:`, newUploaded);
          throw new Error("S3 upload returned invalid response");
        }

        console.info(`[PUT /lanes/${id}] uploaded to s3: key=${newUploaded.key}`);
        
        updatePayload.sample_image = {
          url: newUploaded.url,
          key: newUploaded.key,
        };
      } else if (deleteBanner === "true" || deleteBanner === true) {
        updatePayload.sample_image = null;
      } else {
      }

      const [count, [updatedLane]] = await Lanes.update(updatePayload, {
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
          } catch (cleanupErr) {
            console.warn(`[PUT /lanes/${id}] cleanup failed for newly uploaded object:`, cleanupErr);
          }
        }
        return res
          .status(404)
          .json({ error: "Lane not found or not updated (DB update failed)." });
      }

      if (oldKey && ((newUploaded && newUploaded.key) || updatePayload.sample_image === null)) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: oldKey,
            })
          );
        } catch (delErr) {
          console.warn(`[PUT /lanes/${id}] failed to delete old S3 object key=${oldKey}`, delErr);
        }
      }

      return res.status(200).json(updatedLane);
    } catch (innerErr) {
      if (newUploaded) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: newUploaded.key,
            })
          );
        } catch (cleanupErr) {
        }
      }
      throw innerErr;
    }
  } catch (error) {
    console.error("Update Lane Error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const lane = await Lanes.findByPk(req.params.id);
    if (!lane) return res.status(404).json({ error: "Lane not found." });

    await lane.destroy();
    res.status(200).json({ message: "Deleted successfully", data: lane });
  } catch (error) {
    console.error("Delete Lane Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
