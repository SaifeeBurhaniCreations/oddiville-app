module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex("packing_events", ["createdAt"], {
            name: "idx_pack_event_time",
        });
        await queryInterface.addIndex("packing_events", ["product_name"], {
            name: "idx_pack_event_product",
        });
        await queryInterface.addIndex("packing_events", ["sku_id"], {
            name: "idx_pack_event_sku",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("packing_events", "idx_pack_event_time");
        await queryInterface.removeIndex("packing_events", "idx_pack_event_product");
        await queryInterface.removeIndex("packing_events", "idx_pack_event_sku");
    },
};