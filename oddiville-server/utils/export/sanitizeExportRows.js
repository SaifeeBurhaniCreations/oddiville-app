  const DEFAULT_SYSTEM_FIELDS = new Set([
    "id",
    "deletedAt",
    "createdAt",
    "updatedAt",
  ]);

  const COLUMN_ORDER = {
    Production: [
      "product_name",
      "quantity",
      "unit",
      "status",
      "lane_name",
      "start_time",
      "end_time",
    ],

    Packing: [
      "product_name",
      "rating",
      "bags_produced",
      "total_packets",
      "total_bags_stored",
      "chamber_name",
      "rm_consumption_details",
    ],

    Dispatch: [
      "customer_name",
      "city",
      "state",
      "status",
      "dispatch_date",
      "delivered_date",
      "amount",
      "dispatch_items_details",
    ],

    "Raw Materials": [
      "raw_material_name",
      "vendor",
      "quantity_ordered",
      "quantity_received",
      "unit",
      "status",
    ],
    Stock: [
      "product_name",
      "category",
      "unit",
      "pack_type",
      "pack_size",
      "pack_count",
      "total_quantity",
      "sku_size",
      "sku_quantity",
      "stock_items_details",
    ],
  };

  const NUMERIC_DEFAULTS = {
    sample_quantity: 0,
  };

  const STRING_DEFAULTS = {
    batch_code: "N/A",
  };

  const HARD_SKIP_FIELDS = new Set([
    "sku_id",
    "sku_label",
    "unit",
    "packet",
    "rm_consumption",
    "products",
    "dispatched_items",
    "chamber",
  ]);

  const sanitizeRow = (row, removeKeys = [], { chamberMap, sheetName } = {}) => {
    const plain = row.toJSON ? row.toJSON() : row;
    let clean = {};

    if (sheetName === "Packing") {
      clean.rm_consumption_details = "See RM Consumption sheet";
    }

    if (sheetName === "Dispatch") {
      clean.dispatch_items_details = "See Dispatch Items sheet";
    }

    if (sheetName === "Stock") {
      clean.stock_items_details = "See Stock Chambers sheet";
    }

    if (sheetName === "Dispatch") {
    const delivered = plain.delivered_date;
    const dispatched = plain.dispatch_date;

    if (delivered) {
      clean.status = "✔ Reached";
    } else if (dispatched) {
      clean.status = "🚚 Shipped";
    } else {
      clean.status = "⏳ Pending";
    }
  }

    for (const key in plain) {
      if (DEFAULT_SYSTEM_FIELDS.has(key)) continue;
      if (removeKeys.includes(key)) continue;
      if (HARD_SKIP_FIELDS.has(key)) continue;
      if (key === "truck_details") continue;

      const value = plain[key];

      // numeric defaults
      if (key in NUMERIC_DEFAULTS) {
        clean[key] = value ?? NUMERIC_DEFAULTS[key];
      }

      // string defaults
      else if (key in STRING_DEFAULTS) {
        clean[key] = value ?? STRING_DEFAULTS[key];
      }
          
      else if (key === "packages" && plain.category === "bulk") {
      continue;
      }
          
      else if (key === "packaging" && plain.category === "packed") {
      continue;
      }

      // truck_details (explicit)
  else if (key === "truck_details" && value) {
    let details = value;

    if (typeof value === "string") {
      try {
        details = JSON.parse(value);
      } catch {
        details = null;
      }
    }

    if (!details || typeof details !== "object") return;

    // RAW MATERIAL SHEET
    if (sheetName === "Raw Materials") {
      clean.truck_driver_name = details.driver_name ?? null;
      clean.truck_number = details.truck_number ?? null;
      clean.truck_weight = details.truck_weight ?? null;
      clean.tare_weight = details.tare_weight ?? null;
      // clean.challan_url = details?.challan?.url ?? null;
    }

    // DISPATCH SHEET
  if (sheetName === "Dispatch" && plain.dispatch_date && plain.truck_details) {
    let details = plain.truck_details;

    if (typeof details === "string") {
      try {
        details = JSON.parse(details);
      } catch {
        details = null;
      }
    }

    if (details && typeof details === "object") {
      clean.truck_driver_name = details.driver_name ?? null;
      clean.truck_number = details.number ?? null;
      clean.truck_type = details.type ?? null;
      clean.truck_phone = details.phone ?? null;
      clean.truck_agency_name = details.agency_name ?? null;
    }
  }

  }

      else if (key === "packet" && value) {
        clean.pack_size = `${value.size} ${value.unit}`;
      }

      // storage (array of chambers)
      else if (key === "storage" && Array.isArray(value)) {
        clean.chamber_name = value
          .map((c) => chamberMap[c.chamberId] || "")
          .filter(Boolean)
          .join(", ");
      }

      // Stock packaging (material)
      else if (key === "packaging" && value && plain.category === "bulk") {
        if (value.size) {
          clean.pack_type = value.type ?? null;
          clean.pack_size = `${value.size.value} ${value.size.unit}`;
          clean.pack_count = value.count ?? null;

          if (value.size.value && value.count) {
            clean.total_quantity = value.size.value * value.count;
          }
        }
      }

      // Stock packages (packed items)
      else if (
    key === "packages" &&
    Array.isArray(value) &&
    value.length &&
    plain.category === "packed"
  ) {
    const pkg = value[0];
    clean.sku_size = `${pkg.size} ${pkg.unit}`;
    clean.sku_quantity = pkg.quantity;
  }

      //lane
      else if (key === "lane") {
        if (value && value.name) {
          clean.lane_name = value.name;
        }
      }

  else if (key === "sku" && typeof value === "string") {
    let cleaned = value.replace(/-\d+$/, "");

    cleaned = cleaned.replace("-", "");

    clean.sku = cleaned;
  }

      // dates
      else if (value instanceof Date) {
        clean[key] = formatDate(value);
      }

  // generic JSON (ONLY plain JSON)
  else if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.assign(clean, flattenObject(value, key));
  }

  // RM Consumption rename
  else if (sheetName === "RM Consumption" && key === "outer_used") {
    clean.bags = value ?? null;
  }

  // default fallback
  else {
    clean[key] = value;
  }

  if (plain.category === "bulk") {
    if (!("sku_size" in clean)) clean.sku_size = "Not Applicable";
    if (!("sku_quantity" in clean)) clean.sku_quantity = "Not Applicable";
  }

  if (plain.category === "packed") {
    if (!("pack_type" in clean)) clean.pack_type = "Not Applicable";
    if (!("pack_size" in clean)) clean.pack_size = "Not Applicable";
    if (!("pack_count" in clean)) clean.pack_count = "Not Applicable";
    if (!("total_quantity" in clean)) clean.total_quantity = "Not Applicable";
  }

    };
  return clean;
  };

const applyColumnOrder = (rows, sheetName) => {
  if (!rows.length) return rows;

  const preferredOrder = COLUMN_ORDER[sheetName];
  if (!preferredOrder) return rows;

  const existingKeys = [...new Set(rows.flatMap((row) => Object.keys(row)))];

  const LAST_COLUMNS = [
    "dispatch_items_details",
    "rm_consumption_details",
    "stock_items_details",
  ];

  const orderedKeys = [
    ...preferredOrder.filter((k) => existingKeys.includes(k)),

    ...existingKeys.filter(
      (k) =>
        !preferredOrder.includes(k) &&
        !LAST_COLUMNS.includes(k)
    ),

    ...LAST_COLUMNS.filter((k) => existingKeys.includes(k)),
  ];

  return rows.map((row) =>
    Object.fromEntries(orderedKeys.map((k) => [k, row[k]]))
  );
};

  const formatDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toISOString().split("T")[0]; 
  };

  const flattenObject = (obj, prefix = "") => {
    let out = {};
    for (const key in obj) {
      const val = obj[key];
      const newKey = prefix ? `${prefix}_${key}` : key;

      if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(out, flattenObject(val, newKey));
      } else {
        out[newKey] = val;
      }
    }
    return out;
  };

  module.exports = {
    sanitizeRow,
    applyColumnOrder,
  };
