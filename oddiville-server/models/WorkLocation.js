module.exports = (sequelize, Sequelize) => {
    const WorkLocation = sequelize.define(
        "WorkLocations",
        {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },

            location_name: {
                type: Sequelize.STRING,
                allowNull: false
            },

            description: {
                type: Sequelize.TEXT
            },

            sample_image: {
                type: Sequelize.JSONB,
                allowNull: true
            },
        },
        {
            timestamps: true,

            indexes: [
                { fields: ["location_name"] },   // search by name
            ]
        }
    );

    return WorkLocation;
};