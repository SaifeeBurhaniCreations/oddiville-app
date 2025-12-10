module.exports = (sequelize, Sequelize) => {
  const ChamberStock = sequelize.define(
    "ChamberStock",
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chamber: {
        type: Sequelize.JSON,
        allowNull: false,
        validate: {
          isValidChamberArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Chamber must be an array.");
            }
            if (value.length === 0)
              throw new Error("Chamber must have at least one entry.");


            value.forEach((item, index) => {
              const allowedKeys = ["id", "quantity", "rating"];
              const itemKeys = Object.keys(item);

              const extraKeys = itemKeys.filter(
                (k) => !allowedKeys.includes(k)
              );
              if (extraKeys.length > 0) {
                throw new Error(
                  `Chamber[${index}] has invalid fields: ${extraKeys.join(
                    ", "
                  )}`
                );
              }

              const missingKeys = allowedKeys.filter((k) => !(k in item));
              if (missingKeys.length > 0) {
                throw new Error(
                  `Chamber[${index}] is missing required fields: ${missingKeys.join(
                    ", "
                  )}`
                );
              }

              if (
                typeof item.id !== "string" ||
                typeof item.quantity !== "string" ||
                typeof item.rating !== "string"
              ) {
                throw new Error(
                  `Chamber[${index}] fields must all be strings.`
                );
              }
            });
          },
        },
      },
      packages: {
        type: Sequelize.JSON,
        allowNull: true,
        validate: {
          isValidPackages(value) {
            if (value == null) return;

            if (!Array.isArray(value)) {
              throw new Error("Packages must be an array if provided.");
            }

            value.forEach((pkg, index) => {
              const allowedKeys = ["size", "unit", "rawSize", "dry_item_id", "quantity"];
              const keys = Object.keys(pkg);

              const extra = keys.filter((k) => !allowedKeys.includes(k));
              if (extra.length > 0) {
                throw new Error(
                  `Packages[${index}] has invalid fields: ${extra.join(", ")}`
                );
              }

              if (pkg.size != null && isNaN(Number(pkg.size))) {
                throw new Error(`Packages[${index}].size must be numeric.`);
              }
            });
          },
        },
      },
    },
    {
      timestamps: true,
      validate: {
        packagesOnlyForPacked() {
          if (this.category !== "packed" && this.packages != null) {
            throw new Error("Packages are only allowed for category 'packed'.");
          }
        },
      },
    }
  );

  return ChamberStock;
};
