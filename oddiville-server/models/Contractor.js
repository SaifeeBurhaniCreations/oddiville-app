module.exports = (sequelize, Sequelize) => {
    const Contractor = sequelize.define("Contractor", {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        name: { type: Sequelize.STRING, allowNull: false, unique: true },
        male_count: { type: Sequelize.INTEGER, defaultValue: 0 },
        female_count: { type: Sequelize.INTEGER, defaultValue: 0 },
        work_location: {
            type: Sequelize.JSONB, 
            allowNull: false,
            defaultValue: []
        }
    }, {
        timestamps: true,

        indexes: [
            { fields: ["name"], unique: true },
        ]
    }
    );

    return Contractor;
};

// Example JSON 
// work_location : [
//     {
//         name: String,
//         count: string
//     }
// ]