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
      packaging: {
        type: Sequelize.JSONB,
        allowNull: true,
        validate: {
          isValidPackaging(value) {
            if (this.category === "other") return;

            if (value == null) {
              throw new Error("Packaging is required.");
            }

            const validateOne = (pkg, index = null) => {
              const prefix = index !== null ? `Packaging[${index}]` : "Packaging";

              if (typeof pkg !== "object" || Array.isArray(pkg)) {
                throw new Error(`${prefix} must be an object.`);
              }

              const allowedKeys = ["size", "type", "count", "bags"];
              const keys = Object.keys(pkg);

              const extra = keys.filter(k => !allowedKeys.includes(k));
              if (extra.length) {
                throw new Error(`${prefix} has invalid fields: ${extra.join(", ")}`);
              }

              if (!pkg.size || typeof pkg.size !== "object") {
                throw new Error(`${prefix}.size must be an object.`);
              }

              if (isNaN(Number(pkg.size.value))) {
                throw new Error(`${prefix}.size.value must be numeric.`);
              }

              if (!pkg.size.unit?.trim()) {
                throw new Error(`${prefix}.size.unit must be string.`);
              }

              if (!pkg.type?.trim()) {
                throw new Error(`${prefix}.type required`);
              }

              if (isNaN(Number(pkg.count))) {
                throw new Error(`${prefix}.count must be numeric`);
              }
            };

            if (this.category === "packed") {
              if (!Array.isArray(value)) {
                throw new Error("Packaging must be an array for packed items.");
              }
              value.forEach((pkg, i) => validateOne(pkg, i));
            }

            if (this.category === "material") {
              if (Array.isArray(value)) {
                throw new Error("Packaging must be an object for material items.");
              }
              validateOne(value);
            }
          }

        },
      },
      chamber: {
        type: Sequelize.JSONB,
        allowNull: false,
        validate: {
          isValidChamberArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("Chamber must be an array.");
            }

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
        type: Sequelize.JSONB,
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
      packed_ref: {
        type: Sequelize.JSONB,
        allowNull: true,
        validate: {
          isValidPackedRef(value) {
            if (value == null) return;

            const allowedKeys = ["lastPackedAt", "skus", "eventCount"];
            const keys = Object.keys(value);

            const extra = keys.filter(k => !allowedKeys.includes(k));
            if (extra.length > 0) {
              throw new Error(`packed_ref has invalid fields: ${extra.join(", ")}`);
            }

            if (value.lastPackedAt && isNaN(Date.parse(value.lastPackedAt))) {
              throw new Error("packed_ref.lastPackedAt must be valid ISO date");
            }

            if (value.skus && !Array.isArray(value.skus)) {
              throw new Error("packed_ref.skus must be an array");
            }

            if (
              value.eventCount != null &&
              isNaN(Number(value.eventCount))
            ) {
              throw new Error("packed_ref.eventCount must be numeric");
            }
          },
        },
      },
    },
    {
      timestamps: true,
      indexes: [
        { fields: ["product_name"] },
        { fields: ["category", "createdAt"] },
      ],
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
