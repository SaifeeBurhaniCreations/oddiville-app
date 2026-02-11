const router = require("express").Router();
const { Contractor } = require("../models");
const { dispatchAndSendNotification } = require("../utils/dispatchAndSendNotification");
const { Op, fn, col } = require("sequelize");
const { isValidUUID } = require("../utils/auth");

const normalize = (s) => s.trim().toLowerCase();
const today = () => new Date().toISOString().slice(0, 10);

router.get("/all", async (req, res) => {
  try {
    const contractors = await Contractor.findAll({
      where: { work_date: today() },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(contractors);
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post("/create", async (req, res) => {
  try {
    const contractors = req.body;
console.log("POST /create called at", new Date());

    if (!Array.isArray(contractors) || contractors.length === 0) {
      return res.status(400).json({ error: "Contractors array is required." });
    }

    const normalizedNames = [];
    for (let i = 0; i < contractors.length; i++) {
      const c = contractors[i];

      if (!c || typeof c !== "object") {
        return res.status(400).json({ error: `Invalid contractor at index ${i}` });
      }

      if (!c.name || typeof c.name !== "string") {
        return res.status(400).json({ error: `Contractor at index ${i} must have a name` });
      }

      if (!Array.isArray(c.work_location)) {
        return res.status(400).json({ error: `work_location must be array at index ${i}` });
      }

      normalizedNames.push(normalize(c.name));
    }
    console.log("TODAY:", today());


    console.log("Normalized names:", normalizedNames);

    const dupInReq = normalizedNames.filter(
      (v, i) => normalizedNames.indexOf(v) !== i
    );

    if (dupInReq.length) {
      return res.status(400).json({
        error: "Duplicate contractor names in request",
        details: [...new Set(dupInReq)],
      });
    }

    // ---- duplicate in DB (same day only) ----
    const sequelize = Contractor.sequelize;
    const existing = await Contractor.findAll({
      where: {
        work_date: today(),
        [Op.and]: sequelize.where(
          fn("lower", fn("trim", col("name"))),
          { [Op.in]: normalizedNames }
        ),
      },
    });

    console.log("Existing contractors:", existing);

    if (existing.length) {
      return res.status(409).json({
        error: "Some contractor names already exist today",
        details: existing.map((e) => e.name),
      });
    }

    // ---- sanitize payload ----
    const payload = contractors.map((c) => ({
      name: normalize(c.name),
      male_count: Math.max(0, Number(c.male_count || 0)),
      female_count: Math.max(0, Number(c.female_count || 0)),
      work_date: today(),
     work_location: c.work_location.map((loc) => ({
      name: loc.name ?? "",
      maleCount: Math.max(0, Number(loc.maleCount || 0)),
      femaleCount: Math.max(0, Number(loc.femaleCount || 0)),
    })),
    }));

for (const c of payload) {
  const locationMale = c.work_location.reduce((s, l) => s + l.maleCount, 0);
  const locationFemale = c.work_location.reduce((s, l) => s + l.femaleCount, 0);

  if (locationMale !== c.male_count || locationFemale !== c.female_count) {
    return res.status(400).json({
      error: "Location totals do not match contractor totals",
    });
  }
}

    // ---- transaction ----
    const created = await Contractor.sequelize.transaction(async (t) => {
      return Contractor.bulkCreate(payload, {
        returning: true,
        transaction: t,
      });
    });

    const totalMale = payload.reduce((s, c) => s + c.male_count, 0);
    const totalFemale = payload.reduce((s, c) => s + c.female_count, 0);

    try {
      await dispatchAndSendNotification({
        type: "worker-multiple",
        title: `Total workers: ${totalMale + totalFemale}`,
        description: [`Male: ${totalMale}`, `Female: ${totalFemale}`],
        id: created.map((c) => c.id).join(","),
      });
    } catch (err) {
      console.error("Notification failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Contractors created successfully",
      data: created,
    });
  } catch (err) {
    console.error("Create contractor error:", err);

    if (
      err.name === "SequelizeUniqueConstraintError" ||
      err.original?.code === "23505"
    ) {
      return res.status(409).json({ error: "Duplicate contractor for today" });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/:id", async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    return res.status(404).json({ error: "Invalid contractor id" });
  }

  const contractor = await Contractor.findByPk(req.params.id);
  if (!contractor) {
    return res.status(404).json({ error: "Contractor not found" });
  }

  return res.json(contractor);
});

router.put("/:id", async (req, res) => {
  try {
    const contractor = await Contractor.findByPk(req.params.id);
    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    const { name, male_count, female_count, work_location } = req.body;

    if (name !== undefined) {
      const newName = normalize(name);

      if (work_location !== undefined) {
  contractor.work_location = work_location.map((loc) => ({
    name: loc.name ?? "",
    maleCount: Math.max(0, Number(loc.maleCount || 0)),
    femaleCount: Math.max(0, Number(loc.femaleCount || 0)),
  }));
}


      const exists = await Contractor.findOne({
        where: {
          id: { [Op.ne]: contractor.id },
          work_date: contractor.work_date,
          name: newName,
        },
      });

      if (exists) {
        return res.status(409).json({
          error: "Contractor with this name already exists today",
        });
      }

      contractor.name = newName;
    }

    if (male_count !== undefined) contractor.male_count = Math.max(0, male_count);
    if (female_count !== undefined) 
      contractor.female_count = Math.max(0, female_count);
    if (work_location !== undefined) contractor.work_location = work_location;

    await contractor.save();

    return res.status(200).json({
      message: "Contractor updated successfully",
      data: contractor,
    });
  } catch (error) {
    console.error("Update contractor error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const contractor = await Contractor.findByPk(req.params.id);
    if (!contractor) {
      return res.status(404).json({ error: "Contractor not found" });
    }

    await contractor.destroy();
    return res.status(200).json({ message: "Contractor deleted successfully" });
  } catch (error) {
    console.error("Delete contractor error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;