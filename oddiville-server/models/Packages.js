module.exports = (sequelize, Sequelize) => {
    const Packages = sequelize.define("Packages", {
        id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
        product_name: { type: Sequelize.STRING, allowNull: false },
        image: {
            type: Sequelize.JSONB,
            allowNull: true,
        },
        package_image: {
            type: Sequelize.JSONB,
            allowNull: true,
        },
        types: {
            type: Sequelize.JSONB,
            allowNull: true,
            validate: {
                isValidTypeDetails(value) {
                    if (value == null) return;
                    const items = Array.isArray(value) ? value : [value];
                    for (const item of items) {
                        const requiredFields = ['size', 'quantity', 'unit'];
                        for (const field of requiredFields) {
                            if (!(field in item)) {
                                throw new Error(`Types is missing required field: ${field}`);
                            }
                        }
                        if (typeof item.size !== 'string') throw new Error("size must be a string");
                        if (typeof item.quantity !== 'string') throw new Error("quantity must be a string");
                        if (
                            !(
                                item.unit === null ||
                                (typeof item.unit === 'string' && ['kg', 'gm'].includes(item.unit))
                            )
                        ) {
                            throw new Error("unit must be either 'kg', 'gm', or null");
                        }
                    }
                }
            }

        },
        raw_materials: {
            type: Sequelize.ARRAY(Sequelize.STRING),
            allowNull: false,
        },
        chamber_name: { type: Sequelize.STRING, allowNull: false },
    },
        {
            timestamps: true,

            indexes: [
                { fields: ["product_name"] },
                { fields: ["chamber_name"] },
                {
                    unique: true,
                    fields: ["product_name", "chamber_name"],
                },
            ],
            hooks: {
                async beforeDestroy(pkg) {
                    const { deleteFromS3 } = require("../services/s3Service");

                    if (pkg.image?.key) await deleteFromS3(pkg.image.key);
                    if (pkg.package_image?.key) await deleteFromS3(pkg.package_image.key);
                }
            }
        });

    return Packages;
}