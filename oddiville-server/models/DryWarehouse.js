module.exports = (sequelize, Sequelize) => {
  const DryWarehouse = sequelize.define("DryWarehouses", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    item_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    warehoused_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT
    },
    sample_image: {
      type: Sequelize.JSONB,
      allowNull: true
    },
    chamber_id: {
      type: Sequelize.UUID  
    },
    quantity_unit: {
      type: Sequelize.STRING
    },
    unit: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: true,

    indexes: [
      { fields: ["chamber_id", "warehoused_date"] },
    ],
    hooks: {
      async beforeDestroy(item) {
        const { deleteFromS3 } = require("../services/s3Service");

        if (item.sample_image?.key) await deleteFromS3(item.sample_image.key);
      }
    }
  }
  );

  DryWarehouse.associate = (db) => {
    DryWarehouse.belongsTo(db.Chambers, {
      foreignKey: "chamber_id",
      as: "chamber"
    });
  };

  return DryWarehouse;
};
