const db = require("../models");

async function backfillLaneId() {
  try {
    await db.sequelize.authenticate();
    console.log("DB connected");

    const lanes = await db.Lanes.findAll({
      attributes: ["id", "name"],
    });

    const laneMap = {};
    lanes.forEach(lane => {
      laneMap[lane.name.trim()] = lane.id;
    });

    const productions = await db.Production.findAll({
      where: {
        lane_id: null,
      },
    });

    console.log(`Found ${productions.length} productions to update`);

    for (const prod of productions) {
      if (!prod.lane) continue; 

      const laneId = laneMap[prod.lane.trim()];
      if (!laneId) {
        console.warn(`No lane found for: ${prod.lane}`);
        continue;
      }

      prod.lane_id = laneId;
      await prod.save({ silent: true });
    }

    console.log("Backfill completed 🎉");
    process.exit(0);

  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  }
}

backfillLaneId();
