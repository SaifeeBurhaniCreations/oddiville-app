module.exports = (sequelize, Sequelize) => {
    const Contractor = sequelize.define("Contractor", {
  id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
  name: { type: Sequelize.STRING, allowNull: false },
  male_count: { type: Sequelize.INTEGER, defaultValue: 0 },
  female_count: { type: Sequelize.INTEGER, defaultValue: 0 },
  work_location: { type: Sequelize.JSONB, defaultValue: [] },
  work_date: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_DATE")
  }
    }, {
        timestamps: true,

      indexes: [
        {
          unique: true,
          fields: ["name", "work_date"]
        }
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