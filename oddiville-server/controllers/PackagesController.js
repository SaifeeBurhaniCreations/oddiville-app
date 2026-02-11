const router = require("express").Router();
const { Op } = require("sequelize");
const {
  Packages,
  DryWarehouse: DryWarehouseClient,
  Chambers: ChambersClient,
  ChamberStock: ChamberStockClient,
  sequelize,
} = require("../models");
const { uploadToS3, deleteFromS3 } = require("../services/s3Service");
const upload = require("../middlewares/upload");

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

    if (
  !productName ||
  productName === "Select product"
) {
  return res.status(400).json({
    error: "Invalid product name",
  });
}

const pkg = await Packages.findOne({
  where: { product_name: productName },
  raw: true,
});

if (!pkg) {
  return res.status(404).json({ error: "No packages found for this product." });
}

return res.status(200).json(pkg);

  } catch (error) {
    console.error(
      "Error fetching packages by product_name:",
      error.message
    );
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
    let uploadedImage = null;
    let uploadedPackageImage = null;

    try {
      let { product_name, raw_materials, types, chamber_name } = req.body;

      if (typeof raw_materials === "string") raw_materials = JSON.parse(raw_materials);
      if (typeof types === "string") types = JSON.parse(types);

      if (!product_name || !chamber_name)
        return res.status(400).json({ error: "product_name and chamber_name are required" });

      if (!Array.isArray(raw_materials) || !raw_materials.length)
        return res.status(400).json({ error: "raw_materials must be array" });

      if (!Array.isArray(types) || !types.length)
        return res.status(400).json({ error: "types must be array" });

      product_name = product_name.trim();
      chamber_name = chamber_name.trim();

      if (req.files?.image?.[0]) {
        uploadedImage = await uploadToS3({
          file: req.files.image[0],
          folder: "packages",
        });
      }

      if (req.files?.package_image?.[0]) {
        uploadedPackageImage = await uploadToS3({
          file: req.files.package_image[0],
          folder: "packages",
        });
      }

      const result = await sequelize.transaction(async (t) => {
        let pkg;

        try {
          pkg = await Packages.create(
            {
              product_name,
              raw_materials,
              types,
              chamber_name,
              image: uploadedImage && {
                url: uploadedImage.url,
                key: uploadedImage.key,
              },
              package_image: uploadedPackageImage && {
                url: uploadedPackageImage.url,
                key: uploadedPackageImage.key,
              },
            },
            { transaction: t }
          );
        } catch (err) {
          if (err.name === "SequelizeUniqueConstraintError") {
            const e = new Error("Package already exists for this chamber");
            e.status = 409;
            throw e;
          }
          throw err;
        }

        const chamber = await ChambersClient.findOne({
          where: { chamber_name },
          transaction: t,
        });

        if (!chamber) {
          const e = new Error("Chamber not found");
          e.status = 400;
          throw e;
        }

        const firstType = types[0];
        const item_name = `${product_name}:${firstType.size}`;
        const quantityNum = parseFloat(firstType.quantity) || 0;

        await DryWarehouseClient.findOrCreate({
          where: { item_name },
          defaults: {
            warehoused_date: new Date(),
            description: `${product_name} Packaging`,
            chamber_id: chamber.id,
            quantity_unit: quantityNum,
            unit: "kg",
            sample_image: uploadedImage
              ? { url: uploadedImage.url, key: uploadedImage.key }
              : null,
          },
          transaction: t,
        });

        return pkg;
      });

      return res.status(201).json(result);

    } catch (error) {
      if (uploadedImage?.key) await deleteFromS3(uploadedImage.key);
      if (uploadedPackageImage?.key) await deleteFromS3(uploadedPackageImage.key);

      console.error(error);

      return res.status(error.status || 500).json({
        error: error.message || "Internal server error",
      });
    }
  }
);

router.patch("/:id/add-type", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, size, unit, quantity } = req.body;
    
    const io = req.app.get("io");
    if (!product_name || !size || quantity == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    const numericQty = parseFloat(quantity);
    if (isNaN(numericQty)) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const normalizedUnit = unit === "null" ? null : unit;

    // PACKAGES LOGIC
    const types = Array.isArray(pkg.types) ? [...pkg.types] : [];

    const exists = types.find(
      (t) =>
        String(t.size) === String(size) &&
        (t.unit ?? null) === normalizedUnit
    );

    if (exists) {
      return res.status(409).json({
        error: "Type already exists. Use increase-quantity route."
      });
    }

    types.push({
      size: String(size),
      unit: normalizedUnit,
      quantity: numericQty.toString(),
    });

    pkg.types = [...types];
    pkg.changed("types", true);
    await pkg.save();

    io.emit("package:updated", { id: pkg.id });

    // DRY WAREHOUSE
    const chamber = await ChambersClient.findOne({
      where: { chamber_name: pkg.chamber_name }
    });

    if (!chamber) {
      return res.status(400).json({ error: "Chamber not found" });
    }

    const itemName = `${product_name}:${size}`;

    const [dryItem] = await DryWarehouseClient.findOrCreate({
      where: { item_name: itemName },
      defaults: {
        item_name: itemName,
        warehoused_date: new Date(),
        description: `${product_name} ${size}${normalizedUnit ?? ""}`,
        chamber_id: chamber.id,
        quantity_unit: "0",
        unit: "kg"
      }
    });

    const currentQty = parseFloat(dryItem.quantity_unit || "0");
    dryItem.quantity_unit = (currentQty + numericQty).toString();
    await dryItem.save();

    return res.json({ success: true, pkg, dryItem });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/increase-quantity", async (req, res) => {
  try {
    const { id } = req.params;
    const { size, unit, quantity } = req.body;
      const io = req.app.get("io");
    if (!size || quantity == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found" });

    const numericQty = parseFloat(quantity);
    if (isNaN(numericQty)) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    // PACKAGES LOGIC
    const types = Array.isArray(pkg.types) ? [...pkg.types] : [];

    const typeIndex = types.findIndex(
      (t) => t.size === size && t.unit === unit
    );

    if (typeIndex === -1) {
      return res.status(404).json({
        error: "Type not found. Use add-type route."
      });
    }
    
    const prevQty = parseFloat(types[typeIndex].quantity || "0");
    types[typeIndex].quantity = (prevQty + numericQty).toString();
    console.log("types[typeIndex].quantity", types[typeIndex].quantity);

    pkg.types = [...types];
    pkg.changed("types", true);
    await pkg.save();

    io.emit("package:updated", { id: pkg.id });

    // DRY WAREHOUSE
    const chamber = await ChambersClient.findOne({
      where: { chamber_name: pkg.chamber_name }
    });

    const itemName = `${pkg.product_name}:${size}`;

    const [dryItem] = await DryWarehouseClient.findOrCreate({
      where: { item_name: itemName },
      defaults: {
        item_name: itemName,
        warehoused_date: new Date(),
        chamber_id: chamber.id,
        quantity_unit: "0",
        unit: "kg"
      }
    });

    const currentQty = parseFloat(dryItem.quantity_unit || "0");
    dryItem.quantity_unit = (currentQty + numericQty).toString();
    await dryItem.save();

    // package-id:send

    return res.json({ success: true, pkg, dryItem });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE package
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pkg = await Packages.findByPk(id);
    if (!pkg) return res.status(404).json({ error: "Package not found." });
    if (pkg.image) {
      await deleteFromS3(pkg.image.key);
    }
    if (pkg.package_image) {
      await deleteFromS3(pkg.package_image.key);
    }

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


// await Packages.destroy({
//   where: {},
//   individualHooks: true,
// });

// await DryWarehouseClient.destroy({
//   where: {},
//   individualHooks: true,
// });