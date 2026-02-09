module.exports = (sequelize, Sequelize) => {
    const PackingEvent = sequelize.define(
        "PackingEvent",
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },

            product_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            rating: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            sku_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            sku_label: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            packet: {
                type: Sequelize.JSONB,
                allowNull: false,
                // { size, unit, packetsPerBag }
            },

            bags_produced: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            total_packets: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },

            storage: {
                type: Sequelize.JSONB,
                allowNull: false,
                // [{ chamberId, bagsStored }]
            },

            rm_consumption: {
                type: Sequelize.JSONB,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            tableName: "packing_events",

            indexes: [
                { fields: ["product_name"] },
            ]
        }
    );

    return PackingEvent;
};
