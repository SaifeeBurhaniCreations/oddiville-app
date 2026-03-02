// module.exports = (sequelize, Sequelize) => {
//   const DryWarehouse = sequelize.define("DryWarehouses", {
//     id: {
//       type: Sequelize.UUID,
//       defaultValue: Sequelize.UUIDV4,
//       primaryKey: true
//     },
//     item_name: {
//     type: Sequelize.STRING,
//     allowNull: false,
//     set(value) {
//       this.setDataValue("item_name", value.trim().toLowerCase());
//     }
//   },
//     warehoused_date: {
//       type: Sequelize.DATE,
//       allowNull: false
//     },
//     description: {
//       type: Sequelize.TEXT
//     },
//     sample_image: {
//       type: Sequelize.JSONB,
//       allowNull: true
//     },
//     chamber_id: {
//       type: Sequelize.UUID,
//       allowNull: false
//     },
//     quantity: {
//       type: Sequelize.DECIMAL(12, 3),
//       allowNull: false,
//       defaultValue: 0
//     },

// unit: {
//   type: Sequelize.ENUM("kg", "gm", "pcs", "roll", "box", "set"),
//   allowNull: false,
//   set(value) {
//     this.setDataValue("unit", value.trim().toLowerCase());
//   }
// },

//     unit_weight_grams: {
//       type: Sequelize.DECIMAL(10, 3),
//       allowNull: true,
//       validate: {
//         validWeightForUnit() {
//           if (["pcs", "box", "set", "roll"].includes(this.unit)) {
//             if (this.unit_weight_grams == null) {
//               throw new Error("unit_weight_grams required for count-based units");
//             }
//           } else {
//             if (this.unit_weight_grams != null) {
//               throw new Error("unit_weight_grams only allowed for count-based units");
//             }
//           }
//         }
//       }
//     }
//   }, {
//     timestamps: true,

//     indexes: [
//       { fields: ["item_name"] },
//       { fields: ["chamber_id", "warehoused_date"] },
//       {unique: true, fields: ["item_name", "chamber_id", "unit"]}
//     ],
//     hooks: {
//       async beforeDestroy(item) {
//         const { deleteFromS3 } = require("../services/s3Service");

//         if (item.sample_image?.key) await deleteFromS3(item.sample_image.key);
//       }
//     }
//   }
//   );

//   DryWarehouse.associate = (db) => {
//  DryWarehouse.belongsTo(db.Chambers, {
//   foreignKey: "chamber_id",
//   as: "chamber",
//   onDelete: "RESTRICT",
//   onUpdate: "CASCADE"
// });
//   };

//   return DryWarehouse;
// };


module.exports = (sequelize, Sequelize) => {
  const DryWarehouse = sequelize.define(
    "DryWarehouses",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      // 🔥 NEW: TYPE
      item_type: {
        type: Sequelize.ENUM("dry", "packaging"),
        allowNull: false,
        defaultValue: "dry",
      },

      // 🔹 DRY ITEM FIELD
      item_name: {
        type: Sequelize.STRING,
        allowNull: true,
        set(value) {
          if (value) {
            this.setDataValue("item_name", value.trim().toLowerCase());
          }
        },
      },

      // 🔹 PACKAGING FIELDS
      product_name: {
        type: Sequelize.STRING,
        allowNull: true,
        set(value) {
          if (value) {
            this.setDataValue("product_name", value.trim().toLowerCase());
          }
        },
      },

      sku_size: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },

      sku_unit: {
        type: Sequelize.ENUM("kg", "gm"),
        allowNull: true,
      },

      // 🔹 COMMON FIELDS
      warehoused_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
      },

      sample_image: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      chamber_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },

      quantity: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0,
      },

      unit: {
        type: Sequelize.ENUM("kg", "gm", "pcs", "roll", "box", "set"),
        allowNull: false,
        set(value) {
          if (value) {
            this.setDataValue("unit", value.trim().toLowerCase());
          }
        },
      },

      unit_weight_grams: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
      },
    },
    {
      timestamps: true,

      indexes: [
        { fields: ["item_type"] },
        { fields: ["item_name"] },
        { fields: ["product_name"] },
        { fields: ["chamber_id", "warehoused_date"] },

        {
    unique: true,
    fields: [
      "item_type",
      "product_name",
      "sku_size",
      "sku_unit",
      "chamber_id",
      "unit"
    ]
  }
      ],

      validate: {
        validItemStructure() {
          // 🔥 Packaging validation
          if (this.item_type === "packaging") {
            if (!this.product_name || !this.sku_size || !this.sku_unit) {
              throw new Error(
                "Packaging requires product_name, sku_size and sku_unit"
              );
            }

            if (this.item_name) {
              throw new Error(
                "Packaging should not use item_name field"
              );
            }
          }

          // 🔥 Dry validation
          if (this.item_type === "dry") {
            if (!this.item_name) {
              throw new Error("Dry item requires item_name");
            }

            if (this.product_name || this.sku_size || this.sku_unit) {
              throw new Error(
                "Dry item should not use packaging fields"
              );
            }
          }

          // 🔥 Unit weight validation (same as your old logic)
          if (["pcs", "box", "set", "roll"].includes(this.unit)) {
            if (this.unit_weight_grams == null) {
              throw new Error(
                "unit_weight_grams required for count-based units"
              );
            }
          } else {
            if (this.unit_weight_grams != null) {
              throw new Error(
                "unit_weight_grams only allowed for count-based units"
              );
            }
          }
        },
      },

      hooks: {
        async beforeDestroy(item) {
          const { deleteFromS3 } = require("../services/s3Service");

          if (item.sample_image?.key) {
            await deleteFromS3(item.sample_image.key);
          }
        },
      },
    }
  );

  DryWarehouse.associate = (db) => {
    DryWarehouse.belongsTo(db.Chambers, {
      foreignKey: "chamber_id",
      as: "chamber",
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });
  };

  return DryWarehouse;
};