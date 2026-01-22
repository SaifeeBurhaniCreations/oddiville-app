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

            sku_id: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            sku_label: {
                type: Sequelize.STRING,
                allowNull: false,
            },

            packet: {
                type: Sequelize.JSON,
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
                type: Sequelize.JSON,
                allowNull: false,
                // [{ chamberId, bagsStored }]
            },

            rm_consumption: {
                type: Sequelize.JSON,
                allowNull: false,
            },
        },
        {
            timestamps: true,
            tableName: "packing_events",
        }
    );

    return PackingEvent;
};
