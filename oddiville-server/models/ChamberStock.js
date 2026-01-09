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
        type: Sequelize.JSON,
        allowNull: false,
        validate: {
          isValidPackaging(value) {
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
              if (extra.length > 0) {
                throw new Error(
                  `${prefix} has invalid fields: ${extra.join(", ")}`
                );
              }

              // size validation (ALWAYS OBJECT)
              if (
                !pkg.size ||
                typeof pkg.size !== "object" ||
                Array.isArray(pkg.size)
              ) {
                throw new Error(`${prefix}.size must be an object.`);
              }

              const sizeKeys = Object.keys(pkg.size);
              const allowedSizeKeys = ["value", "unit"];

              const extraSize = sizeKeys.filter(
                k => !allowedSizeKeys.includes(k)
              );
              if (extraSize.length > 0) {
                throw new Error(
                  `${prefix}.size has invalid fields: ${extraSize.join(", ")}`
                );
              }

              if (isNaN(Number(pkg.size.value))) {
                throw new Error(`${prefix}.size.value must be numeric.`);
              }

              if (
                typeof pkg.size.unit !== "string" ||
                pkg.size.unit.trim() === ""
              ) {
                throw new Error(`${prefix}.size.unit must be a non-empty string.`);
              }

              // type
              if (
                typeof pkg.type !== "string" ||
                pkg.type.trim() === ""
              ) {
                throw new Error(`${prefix}.type must be a non-empty string.`);
              }

              // count
              if (isNaN(Number(pkg.count))) {
                throw new Error(`${prefix}.count must be numeric.`);
              }
            };

            // packed → array
            if (this.category === "packed") {
              if (!Array.isArray(value)) {
                throw new Error("Packaging must be an array for packed items.");
              }
              value.forEach((pkg, i) => validateOne(pkg, i));
            }

            // loose → single object
            if (this.category === "material") {
              if (Array.isArray(value)) {
                throw new Error("Packaging must be an object for loose items.");
              }
              validateOne(value);
            }
          },
        },
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
      }
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
