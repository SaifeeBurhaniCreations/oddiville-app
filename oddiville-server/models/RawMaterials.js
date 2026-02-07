module.exports = (sequelize, Sequelize) => {
    const RawMaterial = sequelize.define(
        "raw_materials",
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },

            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },

            sample_image: {
                type: Sequelize.JSONB,
                allowNull: true
            },
        },
        {
            timestamps: true,

            indexes: [
                { fields: ["name"], unique: true },
            ]
        }
    );

    return RawMaterial;
};