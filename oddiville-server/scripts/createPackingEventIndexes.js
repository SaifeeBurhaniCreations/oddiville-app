const { sequelize } = require("../models");

(async () => {
    try {
        console.log("Creating PackingEvent indexes...");

        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_pack_event_time 
      ON packing_events("createdAt");
    `);

        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_pack_event_product 
      ON packing_events(product_name);
    `);

        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_pack_event_sku 
      ON packing_events(sku_id);
    `);

        console.log("✅ Indexes ensured.");
        process.exit(0);
    } catch (e) {
        console.error("❌ Index creation failed:", e.message);
        process.exit(1);
    }
})();