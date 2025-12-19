const router = require("express").Router();
const { Contractor } = require("../models");
const {dispatchAndSendNotification} = require("../utils/dispatchAndSendNotification");
const { Op, fn, col, json } = require("sequelize");

router.post("/create", async (req, res) => {
  try {
    const contractors = req.body;

    // ============ BASIC TOP-LEVEL VALIDATION ============
    if (!Array.isArray(contractors) || contractors.length === 0) {
      return res.status(400).json({
        error: "Contractors array is required and cannot be empty."
      });
    }

    const normalizedNames = [];

    for (let idx = 0; idx < contractors.length; idx++) {
      const contractor = contractors[idx];

      if (!contractor || typeof contractor !== "object") {
        return res.status(400).json({
          error: `Contractor at index ${idx} is invalid.`
        });
      }

      if (typeof contractor.name !== "string" || contractor.name.trim().length === 0) {
        return res.status(400).json({
          error: `Contractor at index ${idx} must have a non-empty 'name'.`
        });
      }

      normalizedNames.push(contractor.name.trim().toLowerCase());

      if (!Array.isArray(contractor.work_location)) {
        return res.status(400).json({
          error: `Contractor at index ${idx} must have a 'work_location' array.`
        });
      }

      for (const key of ["male_count", "female_count"]) {
        if (
          contractor[key] !== undefined &&
          (typeof contractor[key] !== "number" || contractor[key] < 0)
        ) {
          return res.status(400).json({
            error: `Contractor at index ${idx}: '${key}' must be a non-negative number.`
          });
        }
      }
    }

    // ============ DUPLICATE CHECK IN REQUEST ============
    const dupInReq = normalizedNames.filter((v, i) => normalizedNames.indexOf(v) !== i);
    if (dupInReq.length > 0) {
      return res.status(400).json({
        error: "Duplicate contractor names in request",
        details: Array.from(new Set(dupInReq))
      });
    }

    // ============ DUPLICATE CHECK IN DATABASE ============
    const uniqueNames = Array.from(new Set(normalizedNames)).filter(Boolean);
    const sequelize = Contractor.sequelize;

    if (uniqueNames.length > 0) {
      const existing = await Contractor.findAll({
        where: sequelize.where(fn("lower", col("name")), { [Op.in]: uniqueNames })
      });

      if (existing.length > 0) {
        return res.status(409).json({
          error: "Some contractor names already exist",
          details: existing.map(e => e.name)
        });
      }
    }

    const sanitizedContractors = contractors.map(c => ({
      name: c.name.trim(),
      male_count: typeof c.male_count === "number" ? c.male_count : 0,
      female_count: typeof c.female_count === "number" ? c.female_count : 0,
      work_location: Array.isArray(c.work_location)
        ? c.work_location.map(loc => ({
            name: loc.name ?? "",
            countMale: Number(loc.male_count || 0),
            countFemale: Number(loc.female_count || 0),
            count: Number(loc.count || 0),
            enterCount: Boolean(loc.enterCount),
            notNeeded: Boolean(loc.notNeeded)
          }))
        : []
    }));

    // ============ TRANSACTION ============
    let created;
    try {
      created = await sequelize.transaction(async (t) => {
        return await Contractor.bulkCreate(sanitizedContractors, {
          returning: true,
          transaction: t
        });
      });
    } catch (txErr) {
      console.error("Bulk create transaction failed:", txErr);

      if (
        txErr.name === "SequelizeUniqueConstraintError" ||
        txErr.original?.code === "23505"
      ) {
        return res.status(409).json({
          error: "Duplicate contractor name (unique constraint)."
        });
      }

      if (txErr.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Database validation failed.",
          details: txErr.errors?.map(e => e.message)
        });
      }

      return res.status(500).json({ error: "Internal server error." });
    }

    if (!created || created.length === 0) {
      return res.status(500).json({ error: "Failed to create contractors." });
    }

    // ============ NOTIFICATION ============
    const totalMale = sanitizedContractors.reduce((s, c) => s + c.male_count, 0);
    const totalFemale = sanitizedContractors.reduce((s, c) => s + c.female_count, 0);

    try {
      await dispatchAndSendNotification({
        type: "worker-multiple",
        title: `Total workers: ${totalMale + totalFemale}`,
        description: [`Male count: ${totalMale}`, `Female count: ${totalFemale}`],
        id: created.map(c => c.id).join(",")
      });
    } catch (err) {
      console.error("Notification failed", err);
    }

    return res.status(201).json({
      success: true,
      message: "Contractors created successfully.",
      data: created
    });

  } catch (err) {
    console.error("Error creating contractors:", err);

    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "23505"
    ) {
      return res.status(409).json({ error: "Duplicate contractor name." });
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        error: "Database validation failed.",
        details: err.errors?.map(e => e.message)
      });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
});


router.get("/", async (req, res) => {
    try {
        const contractors = await Contractor.findAll();
        return res.status(200).json(contractors);
    } catch (error) {
        console.error("Error fetching contractors:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// GET contractor by ID
router.get("/:id", async (req, res) => {
    try {
        const contractor = await Contractor.findByPk(req.params.id);
        if (!contractor) return res.status(404).json({ error: "Contractor not found." });
        return res.status(200).json(contractor);
    } catch (error) {
        console.error("Error fetching contractor:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// UPDATE contractor by ID
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const contractor = await Contractor.findByPk(id);
        if (!contractor) return res.status(404).json({ error: "Contractor not found." });

        // Only update provided fields
        const { name, male_count, female_count, work_location } = req.body;
        if (name !== undefined) contractor.name = name.trim();
        if (male_count !== undefined) contractor.male_count = male_count;
        if (female_count !== undefined) contractor.female_count = female_count;
        if (work_location !== undefined) contractor.work_location = work_location;

        await contractor.save();
        return res.status(200).json({ message: "Contractor updated successfully.", data: contractor });
    } catch (error) {
        console.error("Error updating contractor:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
});

// DELETE contractor by ID
router.delete("/:id", async (req, res) => {
    try {
        const contractor = await Contractor.findByPk(req.params.id);
        if (!contractor) return res.status(404).json({ error: "Contractor not found." });

        await contractor.destroy();
        return res.status(200).json({ message: "Contractor deleted successfully." });
    } catch (error) {
        console.error("Error deleting contractor:", error.message);
        return res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
