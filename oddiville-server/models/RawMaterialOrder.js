module.exports = (sequelize, Sequelize) => {
  const RawMaterialOrder = sequelize.define(
    "raw_material_orders",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      production_id: { type: Sequelize.STRING, allowNull: true },
      rating: Sequelize.INTEGER,
 raw_material_name: {
  type: Sequelize.STRING,
  allowNull: false
},

raw_material_id: {
  type: Sequelize.UUID,
  allowNull: false, 
  references: {
    model: "raw_materials",
    key: "id",
  },
},

vendor: {
  type: Sequelize.STRING,
  allowNull: false
},

      vendor_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "Vendors",
          key: "id",
        },
      },
      status: {
        type: Sequelize.STRING,
        default: "pending",
      },
      truck_details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      sample_image: Sequelize.JSONB,
      sample_quantity: Sequelize.DECIMAL,
      bags: Sequelize.INTEGER,
      quantity_ordered: Sequelize.DECIMAL,
      quantity_received: Sequelize.DECIMAL,
      warehoused_date: { type: Sequelize.DATE, allowNull: true },
      unit: Sequelize.STRING,
      price: Sequelize.DECIMAL,
      order_date: Sequelize.DATE,
      store_date: Sequelize.DATE,
      est_arrival_date: { type: Sequelize.DATE, allowNull: true },
      arrival_date: Sequelize.DATE,
    },
    {
      timestamps: true,

      indexes: [
        { fields: ["raw_material_name"] }, // JOIN RawMaterial
        { fields: ["vendor"] }, // vendor lookup
        { fields: ["status"] },

        { fields: ["status", "order_date"] },
        { fields: ["vendor", "status"] },
      ],
      hooks: {
        beforeValidate(instance) {
          const td = instance.truck_details || {};

          instance.truck_details = {
            truck_weight: td.truck_weight ?? null,
            tare_weight: td.tare_weight ?? null,
            truck_number: td.truck_number ?? null,
            driver_name: td.driver_name ?? null,
            challan:
              td.challan && typeof td.challan === "object"
                ? {
                    url: td.challan.url ?? null,
                    key: td.challan.key ?? null,
                  }
                : null,
          };
        },
      },
    },
  );

  RawMaterialOrder.associate = (models) => {
    RawMaterialOrder.belongsTo(models.RawMaterial, {
  foreignKey: "raw_material_id",
  as: "rawMaterial",
});
    RawMaterialOrder.belongsTo(models.Vendors, {
  foreignKey: "vendor_id",
  as: "vendorData"
});

  };

  return RawMaterialOrder;
};
