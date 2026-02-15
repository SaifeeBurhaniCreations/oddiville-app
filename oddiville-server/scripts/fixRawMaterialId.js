const { sequelize } = require("../models");

async function run() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const [result] = await sequelize.query(`
      UPDATE raw_material_orders rmo
      SET raw_material_id = rm.id
      FROM raw_materials rm
      WHERE LOWER(TRIM(rmo.raw_material_name)) = LOWER(TRIM(rm.name));
    `);

    console.log("Updated rows:", result.rowCount ?? result);

    const [check] = await sequelize.query(`
      SELECT COUNT(*) FROM raw_material_orders WHERE raw_material_id IS NULL;
    `);

    console.log("Remaining NULL raw_material_id:", check[0].count);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();