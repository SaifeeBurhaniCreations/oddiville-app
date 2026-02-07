module.exports = (sequelize, Sequelize) => {
  const Lanes = sequelize.define(
    "Lanes",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      production_id: { type: Sequelize.STRING },
      sample_image: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
    },
    {
      timestamps: true,

      indexes: [
        { fields: ["name"], unique: true },
      ]
    }

  );

  return Lanes;
};
