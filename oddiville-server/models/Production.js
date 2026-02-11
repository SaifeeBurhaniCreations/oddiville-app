module.exports = (sequelize, Sequelize) => {
  const Production = sequelize.define("Productions", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    product_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    supervisor: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    // lane: {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // },

    lane_id: {
      type: Sequelize.UUID,
      allowNull: true,
    },

    rating: Sequelize.STRING,
    wastage_quantity: Sequelize.STRING,

    quantity: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },

    recovery: Sequelize.FLOAT,

    unit: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    raw_material_order_id: {
      type: Sequelize.UUID,
      allowNull: false,
    },

    start_time: Sequelize.DATE,
    end_time: Sequelize.DATE,

    status: {
      type: Sequelize.ENUM(
        "pending",
        "in-queue",
        "in-progress",
        "completed",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    packaging: Sequelize.JSONB,

    batch_code: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },

    notes: Sequelize.TEXT,

    sample_images: Sequelize.JSONB,
  }, {
    timestamps: true,

    indexes: [
      { fields: ["raw_material_order_id"] },
      { fields: ["lane_id"] },
      { fields: ["status"] },
      { fields: ["status", "start_time"] },
      { fields: ["batch_code"], unique: true },
    ],
  });

  Production.associate = (models) => {
    Production.belongsTo(models.RawMaterialOrder, {
      foreignKey: "raw_material_order_id",
    });

    Production.belongsTo(models.Lanes, {
      foreignKey: "lane_id",
      as: "lane",
    });
  };

  return Production;
};
