const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Packages,
  DryWarehouse: DryWarehouseClient,
  Chambers: ChambersClient,
  ChamberStock: ChamberStockClient,
  sequelize,
} = require("../models");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../utils/s3Client");
const upload = multer();

const uploadToS3 = async (file) => {
  const id = uuidv4();
  const fileKey = `packages/${id}-${file.originalname}`;
  const bucketName = process.env.AWS_BUCKET_NAME;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  return { url, key: fileKey };
};

// GET all packages
router.get("/", async (req, res) => {
  const search = req.query.search || "";

  const whereClause = {};

  if (search) {
    whereClause.product_name = {
      [Op.iLike]: `%${search}%`,
    };
  }
  try {
    const packages = await Packages.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      raw: true,
    });
    return res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET packages by product_name
router.get("/product/:productName", async (req, res) => {
  try {
    const { productName } = req.params;

    let packages = await Packages.findOne({
      where: { product_name: productName },
    });
    packages = packages.dataValues;

    if (!packages)
      return res
        .status(404)
        .json({ error: "No packages found for this product." });
    return res.status(200).json(packages);
  } catch (error) {
    console.error("Error fetching packages by product_name:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// GET package by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });
    return res.status(200).json(pkg);
  } catch (error) {
    console.error("Error fetching package:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.post(
  "/create",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "package_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let { product_name, raw_materials, types, chamber_name } = req.body;

      try {
        if (typeof raw_materials === "string") {
          raw_materials = JSON.parse(raw_materials);
        }
        if (typeof types === "string") {
          types = JSON.parse(types);
        }
      } catch (err) {
        return res.status(400).json({
          error: "Invalid JSON format for raw_materials or types",
        });
      }

      if (!product_name || typeof product_name !== "string") {
        return res
          .status(400)
          .json({ error: "product_name is required and must be a string." });
      }
      if (!chamber_name || typeof chamber_name !== "string") {
        return res
          .status(400)
          .json({ error: "chamber_name is required and must be a string." });
      }
      if (!Array.isArray(raw_materials) || raw_materials.length === 0) {
        return res
          .status(400)
          .json({
            error: "raw_materials must be a non-empty array of strings.",
          });
      }
      if (!Array.isArray(types) || types.length === 0) {
        return res
          .status(400)
          .json({ error: "types must be a non-empty array." });
      }

      types = types.map((item) => {
        if (typeof item === "string") {
          return { size: item.trim(), quantity: "0", unit: null };
        }
        return {
          size:
            typeof item.size === "string"
              ? item.size.trim()
              : String(item.size ?? ""),
          quantity:
            typeof item.quantity === "string"
              ? item.quantity.trim()
              : String(item.quantity ?? "0"),
          unit:
            item.unit === null
              ? null
              : typeof item.unit === "string"
              ? item.unit.trim()
              : item.unit,
        };
      });

      for (const item of types) {
        if (typeof item.size !== "string" || item.size.length === 0) {
          return res
            .status(400)
            .json({ error: "Each type must have a non-empty 'size' string." });
        }
        if (typeof item.quantity !== "string") {
          return res
            .status(400)
            .json({ error: "Each type must have 'quantity' as a string." });
        }
        if (
          !(
            item.unit === null ||
            (typeof item.unit === "string" &&
              ["kg", "gm", "null"].includes(item.unit))
          )
        ) {
          return res
            .status(400)
            .json({
              error:
                "Unit must be 'kg', 'gm', 'null' as a string, or actual null.",
            });
        }
      }

      product_name = product_name.trim();
      raw_materials = raw_materials.map((v) =>
        typeof v === "string" ? v.trim() : v
      );
      chamber_name = chamber_name.trim();

      if (!sequelize) {
        return res
          .status(500)
          .json({ error: "Database transaction unavailable." });
      }

      const result = await sequelize.transaction(async (t) => {
        let image = null;
        let package_image = null;
        if (req.files?.image?.[0]) {
          const uploaded = await uploadToS3(req.files.image[0]);
          image = {
            url: uploaded.url,
            key: uploaded.key,
          };
        }

        if (req.files?.package_image?.[0]) {
          const uploadedProduct = await uploadToS3(req.files.package_image[0]);
          package_image = {
            url: uploadedProduct.url,
            key: uploadedProduct.key,
          };
        }
        const pkg = await Packages.create(
          {
            product_name,
            raw_materials,
            types,
            chamber_name,
            image,
            package_image,
          },
          { transaction: t }
        );

        const chamber = await ChambersClient.findOne({
          where: { chamber_name },
          raw: true,
          transaction: t,
        });

        if (!chamber) {
          const err = new Error("Chamber not found.");
          err.status = 400;
          throw err;
        }

        const firstType = types[0];
        const item_name = `${product_name}:${firstType.size}`;
        const unit = firstType.unit;
        const quantityNum = parseFloat(firstType.quantity) || 0;

        const existingItem = await DryWarehouseClient.findOne({
          where: { item_name },
          raw: true,
          transaction: t,
        });

        if (!existingItem) {
          const DryWarehouseCreatePayload = {
            item_name,
            warehoused_date: new Date(),
            description: `${product_name} Packaging with Raw materials ${raw_materials.join(
              ","
            )}`,
            chamber_id: chamber.id,
            quantity_unit: quantityNum,
            unit,
            sample_image: image,
          };

          await DryWarehouseClient.create(DryWarehouseCreatePayload, {
            transaction: t,
          });
        }

        return pkg;
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error creating package:", error);
      if (error?.status === 400) {
        return res.status(400).json({ error: error.message || "Bad request." });
      }
      return res.status(500).json({ error: "Internal server error." });
    }
  }
);

router.patch("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, size, unit, quantity } = req.body;

    const pkg = await Packages.findByPk(id);
    if (!pkg) {
      return res.status(404).json({ error: "Package not found." });
    }

    const updates = {};

    const finalProductName =
      typeof product_name === "string" && product_name.trim().length > 0
        ? product_name.trim()
        : pkg.product_name;

    if (product_name !== undefined) {
      if (typeof product_name !== "string") {
        return res
          .status(400)
          .json({ error: "product_name must be a string." });
      }
      updates.product_name = finalProductName;
    }

    if (size !== undefined && unit !== undefined && quantity !== undefined) {
      if (typeof size !== "string") {
        return res.status(400).json({ error: "'size' must be a string." });
      }
      if (typeof quantity !== "string" && typeof quantity !== "number") {
        return res
          .status(400)
          .json({ error: "'quantity' must be a string or number." });
      }
      if (
        !(
          unit === null ||
          (typeof unit === "string" &&
            ["kg", "gm", "null"].includes(unit.trim()))
        )
      ) {
        return res.status(400).json({
          error: "Unit must be 'kg', 'gm', 'null' (as string), or actual null.",
        });
      }

      const normalizedSize = size.trim();
      const normalizedUnit = unit === null ? null : unit.trim();
      const numericQuantity =
        typeof quantity === "string" ? parseFloat(quantity) : quantity;

      if (isNaN(numericQuantity)) {
        return res
          .status(400)
          .json({ error: "quantity must be a valid number." });
      }

      let existingTypes = Array.isArray(pkg.types) ? [...pkg.types] : [];
      if (!Array.isArray(pkg.types) && pkg.types) {
        existingTypes = [pkg.types];
      }

      const typeIndex = existingTypes.findIndex((t) => {
        const tSize =
          typeof t.size === "string" ? t.size.trim() : String(t.size);
        const tUnit =
          t.unit === null
            ? null
            : typeof t.unit === "string"
            ? t.unit.trim()
            : t.unit;
        return tSize === normalizedSize && tUnit === normalizedUnit;
      });

      if (typeIndex !== -1) {
        const existingQty = parseFloat(
          existingTypes[typeIndex].quantity || "0"
        );
        existingTypes[typeIndex].quantity = (
          existingQty + numericQuantity
        ).toString();
      } else {
        existingTypes.push({
          size: normalizedSize,
          unit: normalizedUnit,
          quantity: numericQuantity.toString(),
        });
      }

      updates.types = existingTypes.map((item) => ({
        size: typeof item.size === "string" ? item.size.trim() : item.size,
        quantity:
          typeof item.quantity === "string"
            ? item.quantity.trim()
            : item.quantity,
        unit:
          item.unit === null
            ? null
            : typeof item.unit === "string"
            ? item.unit.trim()
            : item.unit,
      }));

      const chamberName = pkg.chamber_name;

      const chamber = await ChambersClient.findOne({
        where: { chamber_name: chamberName },
      });

      if (!chamber) {
        return res.status(400).json({
          error: `Chamber not found for chamber_name: ${chamberName}`,
        });
      }

      const itemName = `${finalProductName}:${normalizedSize}`;

      const [dryItem, created] = await DryWarehouseClient.findOrCreate({
        where: { item_name: itemName },
        defaults: {
          item_name: itemName,
          warehoused_date: new Date(),
          description: `${finalProductName} Packaging with size ${normalizedSize}${
            normalizedUnit ?? ""
          }`,
          sample_image: null,
          chamber_id: chamber.id,
          quantity_unit: "0",
          unit: normalizedUnit || "gm",
        },
      });

      if (!dryItem.chamber_id && chamber.id) {
        dryItem.chamber_id = chamber.id;
      }

      const currentQty = parseFloat(dryItem.quantity_unit || "0");
      const newQty = currentQty + numericQuantity;
      dryItem.quantity_unit = newQty.toString();
      await dryItem.save();

      console.log("DryWarehouse after save:", dryItem.toJSON());

      const [stock] = await ChamberStockClient.findOrCreate({
        where: {
          product_name: finalProductName,
          unit: normalizedUnit || "gm",
        },
        defaults: {
          product_name: finalProductName,
          image: null,
          category: "packed",
          unit: normalizedUnit || "gm",
          chamber: [
            {
              id: chamberName,
              quantity: numericQuantity.toString(),
              rating: "0",
            },
          ],
        },
      });

      const chamberArray = Array.isArray(stock.chamber)
        ? [...stock.chamber]
        : [];
      const chIndex = chamberArray.findIndex((c) => c.id === chamberName);

      if (chIndex !== -1) {
        const prevQty = parseFloat(chamberArray[chIndex].quantity || "0");
        chamberArray[chIndex].quantity = (prevQty + numericQuantity).toString();
      } else {
        chamberArray.push({
          id: chamberName,
          quantity: numericQuantity.toString(),
          rating: "0",
        });
      }

      stock.chamber = chamberArray;
      await stock.save();

      console.log("ChamberStock after save:", stock.toJSON());
    }

    const [affectedRows] = await Packages.update(updates, { where: { id } });

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Package not found or no changes made." });
    }

    const updatedPkg = await pkg.reload();
    const plainPkg = updatedPkg.get({ plain: true });

    console.log("plainPkg", plainPkg);
    return res.status(200).json(plainPkg);
  } catch (error) {
    console.error("Error updating package:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// DELETE package
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });

    await pkg.destroy();
    return res.status(200).json({ message: "Package deleted successfully." });
  } catch (error) {
    console.error("Error deleting package:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/replace/type/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { size, unit, quantity } = req.body;

    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });

    const numericQuantity = parseFloat(quantity);
    if (isNaN(numericQuantity)) {
      return res
        .status(400)
        .json({ error: "quantity must be a valid number." });
    }

    let existingTypes = Array.isArray(pkg.types) ? [...pkg.types] : [];
    const index = existingTypes.findIndex(
      (t) => t.size === size && t.unit === unit
    );

    if (index !== -1) {
      existingTypes[index].quantity = numericQuantity.toString();
    } else {
      existingTypes.push({ size, unit, quantity: numericQuantity.toString() });
    }

    pkg.types = existingTypes;
    await pkg.save();

    return res.status(200).json(pkg);
  } catch (error) {
    console.error("Dangerous replace error:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

router.patch("/delete/type/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { size, unit } = req.body;

    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });

    let existingTypes = Array.isArray(pkg.types) ? [...pkg.types] : [];
    const filteredTypes = existingTypes.filter(
      (t) => !(t.size === size && t.unit === unit)
    );

    if (filteredTypes.length === existingTypes.length) {
      return res
        .status(404)
        .json({ error: "Type with matching size and unit not found." });
    }

    pkg.types = filteredTypes;
    await pkg.save();

    return res.status(200).json(pkg);
  } catch (error) {
    console.error("Dangerous delete error:", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;
