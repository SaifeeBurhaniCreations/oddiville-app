module.exports = (sequelize, Sequelize) => {
  const DispatchOrder = sequelize.define(
    "DispatchOrders",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dispatch_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      est_delivered_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      delivered_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      products: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      sample_images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      truck_details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      dispatched_items: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },

    },
    {
      timestamps: true,

      indexes: [
        { fields: ["createdAt"] },
        { fields: ["status", "dispatch_date"] },
        { fields: ["city", "status"] },
      ],
      hooks: {
  beforeValidate(instance) {
    const td = instance.truck_details || {};

    instance.truck_details = {
      driver_name: td.driver_name ?? null,

      // accept both formats safely
      truck_number: td.truck_number ?? td.number ?? null,
      truck_type: td.truck_type ?? td.type ?? null,
      truck_phone: td.truck_phone ?? td.phone ?? null,
      truck_agency_name: td.truck_agency_name ?? td.agency_name ?? null,

      truck_weight: td.truck_weight ?? null,
      tare_weight: td.tare_weight ?? null,

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

    }

  );

  return DispatchOrder;
};
