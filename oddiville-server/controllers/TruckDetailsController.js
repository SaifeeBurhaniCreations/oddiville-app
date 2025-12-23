const router = require("express").Router();
const { TruckDetails: truckDetailClient } = require("../models");
const { uploadToS3, deleteFromS3 } = require("../services/s3Service");
const upload = require("../middlewares/upload");

require("dotenv").config();

// GET all truck details
router.get("/", async (req, res) => {
  try {
    const trucks = await truckDetailClient.findAll();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET truck detail by ID
router.get("/:id", async (req, res) => {
  try {
    const truck = await truckDetailClient.findByPk(req.params.id);
    if (!truck) return res.status(404).json({ error: "Truck not found" });
    res.json(truck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new truck detail
router.post("/", upload.single("challan"), async (req, res) => {
  try {
    const {
      agency_name,
      number,
      driver_name,
      phone,
      type,
      size,
      arrival_date,
      isMyTruck,
    } = req.body;

    if (
      !agency_name ||
      !number ||
      !driver_name ||
      !phone ||
      !type ||
      !size ||
      !arrival_date ||
      !isMyTruck
    ) {
      return res.status(400).json({ error: `Required field missing!` });
    }

    let sampleImage = null;
    if (req.file) {
      const uploaded = await uploadToS3({file: req.file, folder: "dispatchOrder/truck-images"});
      if (!uploaded?.url || !uploaded?.key) {
        return res
          .status(500)
          .json({ error: "Failed to upload sample image." });
      }
      sampleImage = uploaded.url;
    }

    const truck = await truckDetailClient.create({
      agency_name,
      driver_name,
      phone,
      number,
      type,
      size,
      challan: sampleImage,
      arrival_date: JSON.parse(arrival_date) ?? new Date(),
      isMyTruck: JSON.parse(isMyTruck),
    });
    res.status(201).json(truck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH update truck detail by ID
router.patch("/:id", upload.none(), async (req, res) => {
  try {
    const truck = await truckDetailClient.findByPk(req.params.id);
    if (!truck) return res.status(404).json({ error: "Truck not found" });
    await truck.update(req.body);
    res.json(truck);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE truck detail by ID
router.delete("/:id", async (req, res) => {
  try {
    const truck = await truckDetailClient.findByPk(req.params.id);
    if (!truck) return res.status(404).json({ error: "Truck not found" });
    await truck.destroy();
    res.json({ message: "Truck deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
