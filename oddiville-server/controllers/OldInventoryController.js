const router = require("express").Router();
const { Op } = require("sequelize");
const uuid = require("../sbc/utils/uuid/uuid");
const { format } = require("date-fns");
const {
  dispatchAndSendNotification,
} = require("../utils/dispatchAndSendNotification");

const {
  sequelize,
  RawMaterial: RawMaterialClient,
  Vendors: VendorsClient,
  RawMaterialOrder: RawMaterialOrderClient,
  Production: ProductionClient,
  ChamberStock: ChamberStockClient,
  DispatchOrder: DispatchOrdersClient,
  Chambers: ChambersClient,
  Packages: PackagesClient,
  PackingEvent: PackingEventClient,
} = require("../models");

const {
  validateLaneAssignment,
  createAndSendProductionStartNotification,
  createAndSendProductionCompleteNotification,
} = require("../utils/ProductionUtils");

function fmt(dateStr) {
  if (!dateStr) return "--";
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return "--";
  }
}

/**
 * ---------------------
 * Validation Requirements
 * ---------------------
 * Keep these in sync with your DB model expectations.
 */
const REQUIRED = {
  vendor: ["name", "phone", "state", "city"],
  rmo: [
    "raw_material_name",
    "vendor",
    "quantity_ordered",
    "unit",
    "order_date",
    "truck_details",
    "rating",
    "arrival_date",
    "quantity_received",
    "price",
  ],
  production: ["product_name", "quantity", "unit", "status"],
  chamberStock: ["product_name", "category", "unit", "chamber"],
  dispatch: [
    "customer_name",
    "status",
    "est_delivered_date",
    "products",
    "packages",
    "product_name",
    "amount",
  ],
};

function trimStr(s) {
  return typeof s === "string" ? s.trim() : s;
}
function isIsoDate(v) {
  if (typeof v !== "string") return false;
  const d = new Date(v);
  return !Number.isNaN(d.valueOf());
}
function isIsoDateOrNull(v) {
  if (v == null) return true;
  return isIsoDate(v);
}

async function loadAllowedChambers(transaction) {
  const chambers = await ChambersClient.findAll({
    attributes: ["chamber_name"],
    transaction,
  });

  return new Set(chambers.map((c) => c.chamber_name.trim()));
}

async function ensureUniqueBatchCode(base, t) {
  let candidate = base;
  let i = 1;

  while (
    await ProductionClient.findOne({
      where: { batch_code: candidate },
      transaction: t,
    })
  ) {
    i += 1;
    candidate = `${base}-${String(i).padStart(2, "0")}`;
  }
  return candidate;
}

function normalizeRmoTruckFields(r) {
  if (!r || typeof r !== "object") return;
  r.truck_details =
    r.truck_details && typeof r.truck_details === "object"
      ? { ...r.truck_details }
      : {};

  const map = [
    ["truck_weight", "truck_weight"],
    ["tare_weight", "tare_weight"],
    ["truck_loaded_weight", "truck_loaded_weight"],
    ["truck_number", "truck_number"],
    ["truck_driver", "driver_name"],
    ["driver_name", "driver_name"],
    ["challan", "challan"],
  ];

  for (const [src, dst] of map) {
    if (
      r[src] != null &&
      (r.truck_details[dst] === undefined || r.truck_details[dst] === null)
    ) {
      try {
        r.truck_details[dst] = String(r[src]);
      } catch {
        r.truck_details[dst] = r[src];
      }
    }
  }

  if (!r.truck_details.challan) {
    if (typeof r.challan === "string") {
      r.truck_details.challan = { url: r.challan, key: null };
    } else if (Array.isArray(r.challan) && r.challan[0]) {
      const first = r.challan[0];
      if (typeof first === "string")
        r.truck_details.challan = { url: first, key: null };
      else if (first && typeof first === "object")
        r.truck_details.challan = {
          url: first.preview || first.url || null,
          key: first.key || null,
        };
    } else if (
      r.truck_details.challan &&
      typeof r.truck_details.challan === "object"
    ) {
    }
  }
}

function normalizeDispatchTruckFields(d) {
  if (!d || typeof d !== "object") return;
  d.truck_details =
    d.truck_details && typeof d.truck_details === "object"
      ? { ...d.truck_details }
      : {};

  const map = [
    ["truck_weight", "truck_weight"],
    ["tare_weight", "tare_weight"],
    ["truck_loaded_weight", "truck_loaded_weight"],
    ["truck_number", "number"],
    ["number", "number"],
    ["truck_agency", "agency_name"],
    ["truck_driver", "driver_name"],
    ["truck_phone", "phone"],
    ["truck_type", "type"],
    ["type", "type"],
    ["challan", "challan"],
  ];

  for (const [src, dst] of map) {
    if (
      d[src] != null &&
      (d.truck_details[dst] === undefined || d.truck_details[dst] === null)
    ) {
      try {
        d.truck_details[dst] = String(d[src]);
      } catch {
        d.truck_details[dst] = d[src];
      }
    }
  }

  if (!d.truck_details.challan) {
    if (typeof d.challan === "string") {
      d.truck_details.challan = { url: d.challan, key: null };
    } else if (Array.isArray(d.challan) && d.challan[0]) {
      const first = d.challan[0];
      if (typeof first === "string")
        d.truck_details.challan = { url: first, key: null };
      else if (first && typeof first === "object")
        d.truck_details.challan = {
          url: first.preview || first.url || null,
          key: first.key || null,
        };
    } else if (
      Array.isArray(d.truck_details.challan) &&
      d.truck_details.challan[0]
    ) {
      const first = d.truck_details.challan[0];
      if (typeof first === "string")
        d.truck_details.challan = { url: first, key: null };
      else if (first && typeof first === "object")
        d.truck_details.challan = {
          url: first.preview || first.url || null,
          key: first.key || null,
        };
    }
  }

  if (!d.truck_details.type) d.truck_details.type = "Eicher";
}

// -------- VALIDATORS ----------
function validateVendors(vendors = []) {
  const issues = [];
  for (const [i, v] of vendors.entries()) {
    if (!v || typeof v !== "object") {
      issues.push({ path: `vendors[${i}]`, error: "must be object" });
      continue;
    }
    for (const k of REQUIRED.vendor) {
      if (v[k] === undefined || v[k] === null || v[k] === "") {
        issues.push({ path: `vendors[${i}].${k}`, error: "is required" });
      }
    }
  }
  return issues;
}

function validateRMOs(rmos = []) {
  const issues = [];
  for (const [i, r] of rmos.entries()) {
    normalizeRmoTruckFields(r);
    for (const k of REQUIRED.rmo) {
      if (r[k] === undefined || r[k] === null || r[k] === "") {
        issues.push({
          path: `raw_material_orders[${i}].${k}`,
          error: "is required",
        });
      }
    }

    if (!isIsoDate(r.arrival_date)) {
      issues.push({
        path: `raw_material_orders[${i}].arrival_date`,
        error: "must be an ISO datetime string",
      });
    }

    if (!isIsoDateOrNull(r.est_arrival_date)) {
      issues.push({
        path: `raw_material_orders[${i}].est_arrival_date`,
        error: "must be ISO date or null",
      });
    }

    if (r.truck_details != null) {
      const td = r.truck_details;
      const req = [
        "truck_weight",
        "tare_weight",
        // "challan",
        "truck_number",
        "driver_name",
      ];
      for (const k of req)
        if (!(k in td))
          issues.push({
            path: `raw_material_orders[${i}].truck_details.${k}`,
            error: "is required",
          });
          
      if (td.challan != null) {
        if (typeof td.challan !== "object") {
          issues.push({
            path: `raw_material_orders[${i}].truck_details.challan`,
            error: "must be object with url/key",
          });
        } else {
          const hasUrl = typeof td.challan.url === "string" && td.challan.url.trim();
          const hasKey = typeof td.challan.key === "string" && td.challan.key.trim();

          if (!hasUrl && !hasKey) {
            issues.push({
              path: `raw_material_orders[${i}].truck_details.challan`,
              error: "must contain at least url or key",
            });
          }
        }
      }

    }

    ["order_date", "warehoused_date", "store_date", "arrival_date"].forEach(
      (dk) => {
        if (r[dk] != null && !isIsoDateOrNull(r[dk])) {
          issues.push({
            path: `raw_material_orders[${i}].${dk}`,
            error: "must be ISO date or null",
          });
        }
      }
    );

    [
      "sample_quantity",
      "quantity_ordered",
      "quantity_received",
      "price",
    ].forEach((nk) => {
      if (r[nk] != null && typeof r[nk] !== "string") {
        issues.push({
          path: `raw_material_orders[${i}].${nk}`,
          error: "must be a string",
        });
      }
    });
  }
  return issues;
}

function validateProductions(prods = []) {
  const issues = [];
  for (const [i, p] of prods.entries()) {
    for (const k of REQUIRED.production) {
      if (p[k] === undefined || p[k] === null || p[k] === "") {
        issues.push({ path: `productions[${i}].${k}`, error: "is required" });
      }
    }
    if (!p.raw_material_order_id && !p.raw_material_orderRef) {
      issues.push({
        path: `productions[${i}]`,
        error: "raw_material_order_id or raw_material_orderRef is required",
      });
    }
  }
  return issues;
}

function validateChamberStock(items = [], allowedChambers) {
  const issues = [];
  for (const [i, c] of items.entries()) {
    for (const k of REQUIRED.chamberStock) {
      if (
        c[k] === undefined ||
        c[k] === null ||
        c[k] === "" ||
        (Array.isArray(c[k]) && c[k].length === 0)
      ) {
        issues.push({ path: `chamber_stock[${i}].${k}`, error: "is required" });
      }
    }

    if (!Array.isArray(c.chamber)) {
      issues.push({
        path: `chamber_stock[${i}].chamber`,
        error: "must be an array",
      });
      continue;
    }

    for (const [j, it] of c.chamber.entries()) {
      if (!it || typeof it !== "object") {
        issues.push({
          path: `chamber_stock[${i}].chamber[${j}]`,
          error: "must be an object",
        });
        continue;
      }

      if (
        !it.packets_per_bag ||
        !Number.isInteger(Number(it.packets_per_bag)) ||
        Number(it.packets_per_bag) <= 0
      ) {
        issues.push({
          path: `chamber_stock[${i}].chamber[${j}].packets_per_bag`,
          error: "packets_per_bag must be a positive integer",
        });
      }

      const allowedKeys = new Set([
  "id",
  "bags",       
  "rating",
  "packets_per_bag" 
]);

      const extra = Object.keys(it).filter((k) => !allowedKeys.has(k));
      if (extra.length) {
        issues.push({
          path: `chamber_stock[${i}].chamber[${j}]`,
          error: `invalid extra fields: ${extra.join(", ")}`,
        });
      }

      ["id", "bags", "rating", "packets_per_bag"].forEach((k) => {
        if (typeof it[k] !== "string" || !it[k].trim()) {
          issues.push({
            path: `chamber_stock[${i}].chamber[${j}].${k}`,
            error: "must be non-empty string",
          });
        }
      });

      if (!allowedChambers.has(it.id)) {
        issues.push({
          path: `chamber_stock[${i}].chamber[${j}].id`,
          error: `chamber '${it.id}' not found in registered chambers`,
        });
      }
    }
  }
  return issues;
}

function validateDispatch(orders = []) {
  const issues = [];
  for (const [i, d] of orders.entries()) {
    normalizeDispatchTruckFields(d);
    d.truck_details = d.truck_details || {};
    if (!d.truck_details.type && !d.truck_details.truck_type) {
      d.truck_details.truck_type = "Eicher";
    }
    for (const k of REQUIRED.dispatch) {
      if (
        d[k] === undefined ||
        d[k] === null ||
        d[k] === "" ||
        (Array.isArray(d[k]) && d[k].length === 0)
      ) {
        issues.push({
          path: `dispatch_orders[${i}].${k}`,
          error: "is required",
        });
      }
    }

    if (d.est_delivered_date && !isIsoDate(d.est_delivered_date)) {
      issues.push({
        path: `dispatch_orders[${i}].est_delivered_date`,
        error: "must be ISO datetime",
      });
    }
    ["dispatch_date", "delivered_date"].forEach((dk) => {
      if (d[dk] != null && !isIsoDate(d[dk])) {
        issues.push({
          path: `dispatch_orders[${i}].${dk}`,
          error: "must be ISO datetime",
        });
      }
    });

    if (d.amount != null && typeof d.amount !== "number") {
      issues.push({
        path: `dispatch_orders[${i}].amount`,
        error: "must be a number",
      });
    }

    if (!Array.isArray(d.products)) {
      issues.push({
        path: `dispatch_orders[${i}].products`,
        error: "must be an array",
      });
    } else {
      d.products.forEach((p, j) => {
        if (!p || typeof p !== "object") {
          issues.push({
            path: `dispatch_orders[${i}].products[${j}]`,
            error: "must be an object",
          });
          return;
        }
        if (typeof p.name !== "string" || !p.name.trim()) {
          issues.push({
            path: `dispatch_orders[${i}].products[${j}].name`,
            error: "must be non-empty string",
          });
        }
        if (typeof p.quantity !== "number") {
          issues.push({
            path: `dispatch_orders[${i}].products[${j}].quantity`,
            error: "must be a number",
          });
        }
      });
    }

    if (!Array.isArray(d.packages)) {
      issues.push({
        path: `dispatch_orders[${i}].packages`,
        error: "must be an array",
      });
    } else {
      d.packages.forEach((p, j) => {
        if (!p || typeof p !== "object") {
          issues.push({
            path: `dispatch_orders[${i}].packages[${j}]`,
            error: "must be an object",
          });
          return;
        }
        if (typeof p.quantity !== "number") {
          issues.push({
            path: `dispatch_orders[${i}].packages[${j}].quantity`,
            error: "must be a number",
          });
        }
      });
    }

    if (d.truck_details != null) {
      const td = d.truck_details;
      const req = ["agency_name", "driver_name", "phone", "type", "number"];
      if (!td || typeof td !== "object") {
        issues.push({
          path: `dispatch_orders[${i}].truck_details`,
          error: "must be an object",
        });
      } else {
        for (const k of req) {
          if (!(k in td)) {
            issues.push({
              path: `dispatch_orders[${i}].truck_details.${k}`,
              error: "is required",
            });
          } else if (typeof td[k] !== "string") {
            issues.push({
              path: `dispatch_orders[${i}].truck_details.${k}`,
              error: "must be a string",
            });
          }
        }

        if (td.challan != null) {
          if (typeof td.challan !== "object") {
            issues.push({
              path: `dispatch_orders[${i}].truck_details.challan`,
              error: "must be object with url/key",
            });
          } else {
            const hasUrl = typeof td.challan.url === "string" && td.challan.url.trim();
            const hasKey = typeof td.challan.key === "string" && td.challan.key.trim();

            if (!hasUrl && !hasKey) {
              issues.push({
                path: `dispatch_orders[${i}].truck_details.challan`,
                error: "must contain at least url or key",
              });
            }
          }
        }
      }

    }
  }

  return issues;
}

// -------------------------------------
// new: normalization helpers to accept frontend shape
// -------------------------------------

/**
 * Helper utilities used in normalization
 */
const toIsoIfDateLike = (val) => {
  if (!val && val !== 0) return null;
  const d = new Date(val);
  if (Number.isNaN(d.valueOf())) return null;
  return d.toISOString();
};
const ensureString = (v) => (v === null || v === undefined ? "" : String(v));
const ensureStringOrNull = (v) =>
  v === null || v === undefined ? null : String(v);
const ensureNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function normalizeRmoRow(row, topLevelRawMaterialChallan) {
  row = row && typeof row === "object" ? row : {};

  const truck_details_obj =
    row.truck_details && typeof row.truck_details === "object"
      ? { ...row.truck_details }
      : {};

  if (row.truck_weight != null && truck_details_obj.truck_weight == null)
    truck_details_obj.truck_weight = ensureString(row.truck_weight);
  if (row.tare_weight != null && truck_details_obj.tare_weight == null)
    truck_details_obj.tare_weight = ensureString(row.tare_weight);
  if (
    row.truck_loaded_weight != null &&
    truck_details_obj.truck_loaded_weight == null
  )
    truck_details_obj.truck_loaded_weight = ensureString(
      row.truck_loaded_weight
    );

  if (row.truck_number != null && truck_details_obj.truck_number == null)
    truck_details_obj.truck_number = ensureString(row.truck_number);
  if (row.number != null && truck_details_obj.truck_number == null)
    truck_details_obj.truck_number = ensureString(row.number);

  if (row.driver_name != null && truck_details_obj.driver_name == null)
    truck_details_obj.driver_name = ensureString(row.driver_name);
  if (row.truck_driver != null && truck_details_obj.driver_name == null)
    truck_details_obj.driver_name = ensureString(row.truck_driver);

  if (!truck_details_obj.challan) {
    if (row.challan) {
      if (typeof row.challan === "string")
        truck_details_obj.challan = { url: row.challan, key: null };
      else if (Array.isArray(row.challan) && row.challan[0]) {
        const first = row.challan[0];
        if (typeof first === "string")
          truck_details_obj.challan = { url: first, key: null };
        else if (first && typeof first === "object")
          truck_details_obj.challan = {
            url: first.preview || first.url || null,
            key: first.key || null,
          };
      } else if (typeof row.challan === "object") {
        truck_details_obj.challan = {
          url: row.challan.url || row.challan.preview || null,
          key: row.challan.key || null,
        };
      }
    } else if (topLevelRawMaterialChallan) {
      const inPreview =
        Array.isArray(topLevelRawMaterialChallan.in) &&
        topLevelRawMaterialChallan.in[0]
          ? topLevelRawMaterialChallan.in[0].preview ||
            topLevelRawMaterialChallan.in[0].url
          : null;
      const outPreview =
        Array.isArray(topLevelRawMaterialChallan.out) &&
        topLevelRawMaterialChallan.out[0]
          ? topLevelRawMaterialChallan.out[0].preview ||
            topLevelRawMaterialChallan.out[0].url
          : null;
      if (inPreview || outPreview) {
        truck_details_obj.challan = {};
        if (inPreview) truck_details_obj.challan.in = inPreview;
        if (outPreview) truck_details_obj.challan.out = outPreview;
      }
    }
  } else {
    const c = truck_details_obj.challan;
    if (typeof c === "string")
      truck_details_obj.challan = { url: c, key: null };
    else if (Array.isArray(c) && c[0]) {
      const first = c[0];
      if (typeof first === "string")
        truck_details_obj.challan = { url: first, key: null };
      else if (first && typeof first === "object")
        truck_details_obj.challan = {
          url: first.preview || first.url || null,
          key: first.key || null,
        };
    } else if (typeof c === "object") {
      truck_details_obj.challan = {
        url: c.url || c.preview || null,
        key: c.key || null,
      };
    }
  }

  if (!truck_details_obj.type) truck_details_obj.type = "Eicher";
  if (!truck_details_obj.challan)
    truck_details_obj.challan = { url: null, key: null };

  return {
    id: row._id || row.id || uuid(),
    raw_material_name: ensureString(
      row.raw_material_name ||
        row.rawMaterialName ||
        row.name ||
        row["raw material name"]
    ),
    vendor: ensureString(row.vendor || row.supplier || ""),
    quantity_ordered: ensureStringOrNull(
      row.quantity_ordered ?? row.quantity ?? ""
    ),
    unit: ensureStringOrNull(row.unit ?? ""),
    order_date:
      toIsoIfDateLike(row.order_date) ||
      (row.order_date ? toIsoIfDateLike(row.order_date) : null),
    est_arrival_date: toIsoIfDateLike(row.est_arrival_date) || null,
    arrival_date: toIsoIfDateLike(row.arrival_date) || null,
    truck_details: Object.keys(truck_details_obj).length
      ? truck_details_obj
      : null,
    rating: ensureStringOrNull(row.rating ?? ""),
    quantity_received: ensureStringOrNull(row.quantity_received ?? ""),
    price: ensureStringOrNull(row.price ?? ""),
    sample_quantity:
      row.sample_quantity != null ? String(row.sample_quantity) : null,
    sample_image: row.sample_image || null,
    warehoused_date: toIsoIfDateLike(row.warehoused_date) || null,
    store_date: toIsoIfDateLike(row.store_date) || null,
    clientId: row.clientId || null,
  };
}

function normalizeProductionRow(row) {
  return {
    id: row._id || row.id || uuid(),
    product_name: ensureString(row.product_name || row.productName || row.name),
    raw_material_order_id: row.raw_material_order_id || null,
    raw_material_orderRef:
      row.raw_material_orderRef || row.rawMaterialRef || row.rmoRef || null,
    quantity:
      typeof row.quantity === "number"
        ? String(row.quantity)
        : ensureStringOrNull(row.quantity ?? ""),
    unit: ensureStringOrNull(row.unit ?? ""),
    status: ensureStringOrNull(row.status ?? ""),
    start_time: toIsoIfDateLike(row.start_time) || null,
    end_time: toIsoIfDateLike(row.end_time) || null,
    wastage_quantity:
      row.wastage_quantity != null ? String(row.wastage_quantity) : null,
    supervisor: ensureStringOrNull(row.supervisor ?? ""),
    lane: ensureStringOrNull(row.lane ?? ""),
    recovery: row.recovery != null ? String(row.recovery) : null,
    rating: ensureStringOrNull(row.rating ?? ""),
    sample_images: row.sample_images || null,
    clientId: row.clientId || null,
  };
}

function normalizeChamberStockRow(row) {
  const chamberArr =
    Array.isArray(row.chamber) && row.chamber.length
      ? row.chamber.map((it) => ({
          id: ensureString(it.id || it.chamber_name || it._id || it.name),
          quantity: ensureString(it.bags ?? ""),
          packets_per_bag: Number(it.packets_per_bag ?? 1),
          rating: ensureString(it.rating ?? ""),
        }))
      : row.chamber_name
      ? [
          {
            id: ensureString(row.chamber_name),
            quantity: ensureString(row.bags ?? row.quantity ?? ""),
            packets_per_bag: Number(row.packets_per_bag ?? 1),
            rating: ensureString(row.rating ?? ""),
          },
        ]
      : [];

  return {
    id: row._id || row.id || uuid(),
    product_name: ensureString(row.product_name || ""),
    category: ensureString(row.category || ""),
    unit: ensureString(row.unit || ""),
    chamber: chamberArr,
    clientId: row.clientId || null,
  };
}

function normalizeDispatchRow(row) {
  row = row && typeof row === "object" ? row : {};

  const products = Array.isArray(row.products)
    ? row.products.map((p) => ({
        name: ensureString(p.name),
        quantity: ensureNumber(p.quantity) || 0,
        chambers: Array.isArray(p.chambers) ? p.chambers : [],
      }))
    : row.product_name
    ? [
        {
          name: ensureString(row.product_name),
          quantity:
            ensureNumber(
              row.product_bags ??
                row.product_quantity ??
                  row.productQuantity ??
                    row.quantity
            ) || 0,
        },
      ]
    : [];

  const packages = Array.isArray(row.packages)
    ? row.packages.map((p) => ({
        id: ensureString(p.id) || "",
        quantity: ensureNumber(p.quantity) || 0,
        size: p.size ?? null,
        unit: p.unit ?? null,
      }))
    : [];

  const truck_details_obj = {};
  if (row.truck_weight != null)
    truck_details_obj.truck_weight = ensureString(row.truck_weight);
  if (row.tare_weight != null)
    truck_details_obj.tare_weight = ensureString(row.tare_weight);
  if (row.truck_loaded_weight != null)
    truck_details_obj.truck_loaded_weight = ensureString(
      row.truck_loaded_weight
    );
  if (row.truck_number != null)
    truck_details_obj.number = ensureString(row.truck_number);
  if (row.truck_agency != null)
    truck_details_obj.agency_name = ensureString(row.truck_agency);
  if (row.truck_driver != null)
    truck_details_obj.driver_name = ensureString(row.truck_driver);
  if (row.truck_phone != null)
    truck_details_obj.phone = ensureString(row.truck_phone);

  // prefer incoming row.truck_type, fallback to "Eicher"
  truck_details_obj.type =
    (row.truck_type != null ? ensureString(row.truck_type) : null) || "Eicher";

  if (row.truck_details && typeof row.truck_details === "object") {
    Object.assign(truck_details_obj, row.truck_details);
    truck_details_obj.type =
      (truck_details_obj.type != null
        ? ensureString(truck_details_obj.type)
        : null) || "Eicher";
  }

  if (row.challan) {
    const mapped =
      typeof row.challan === "object"
        ? row.challan.url || row.challan.preview
          ? { url: row.challan.url || row.challan.preview }
          : null
        : null;
    if (mapped) truck_details_obj.challan = mapped;
  }

  let product_name_top = ensureString(row.product_name || "");
  if (
    !product_name_top &&
    Array.isArray(products) &&
    products[0] &&
    products[0].name
  ) {
    product_name_top = products[0].name;
  }

  return {
    id: row._id || row.id || uuid(),
    customer_name: ensureString(row.customer_name || row.customer || ""),
    status: ensureString(row.status ?? "pending"),
    est_delivered_date: toIsoIfDateLike(row.est_delivered_date) || null,
    dispatch_date: toIsoIfDateLike(row.dispatch_date) || null,
    delivered_date: toIsoIfDateLike(row.delivered_date) || null,
    amount: row.amount != null ? Number(row.amount) : null,
    products,
    packages,
    truck_details:
      Object.keys(truck_details_obj).length > 0 ? truck_details_obj : null,
    product_name: product_name_top || null,
    clientId: row.clientId || null,
  };
}

async function attachChamberStockToChambers({
  chamberStockId,
  chamberIds,
  transaction,
}) {
  if (!chamberStockId || !Array.isArray(chamberIds)) return;

  for (const chamberId of chamberIds) {
    await sequelize.query(
      `
      UPDATE "Chambers"
      SET items = COALESCE(items, '{}'::uuid[]) || :csId::uuid
      WHERE chamber_name = :chamberName
        AND NOT (items @> ARRAY[:csId]::uuid[])
      `,
      {
        replacements: {
          csId: chamberStockId,
          chamberName: chamberId,
        },
        transaction,
      }
    );
  }
}


// -------------------------------------
// Main route: accepts both old & new payload shape and normalizes then runs existing logic
// -------------------------------------
router.post("/bulk-ingest", async (req, res) => {
  const t = await sequelize.transaction();
  const notificationJobs = [];

  try {
    const body = req.body || {};

    const hasDispatchOrder =
      body.dispatchOrder &&
      Array.isArray(body.dispatchOrder.rows) &&
      body.dispatchOrder.rows.length > 0;

    const vendorsInput = body.vendors || body.vendorsList || [];
    const rawMaterialBlock = body.rawMaterial || {};
    const productionBlock = body.production || {};
    const chamberStockBlock = body.chamberStock || {};
    const dispatchBlock = body.dispatchOrder || {};
      if (dispatchBlock && Array.isArray(dispatchBlock.rows)) {
      dispatchBlock.rows = dispatchBlock.rows.map((row) => {
        const chooseDelimiter = (s) => {
          if (!s || typeof s !== "string") return null;
          if (s.includes(", ")) return /,\s+/;
          if (s.includes(";")) return /;/;
          if (s.includes("|")) return /\|/;
          return /,/;
        };

        const parseListOfNumbers = (s) => {
          if (s == null) return [];
          const delim = chooseDelimiter(s) || /,/;
          return String(s)
            .split(delim)
            .map((tk) => tk.trim())
            .filter(Boolean)
            .map((tk) => {
              const cleaned = tk.replace(/,/g, "");
              const n = Number(cleaned);
              return Number.isFinite(n) ? n : null;
            });
        };

        const parseListOfStrings = (s) => {
          if (s == null) return [];
          const delim = chooseDelimiter(s) || /,/;
          return String(s)
            .split(delim)
            .map((tk) => tk.trim())
            .filter(Boolean);
        };

        const chamberNames = parseListOfStrings(row.product_chamber || "");
        const quantityTokens = parseListOfNumbers(row.product_quantity || "");
        const chambers = chamberNames.map((name, i) => ({
          name,
          id: name,
          quantity: quantityTokens[i] != null ? quantityTokens[i] : 0,
        }));

        let productQuantity = null;
        if (Array.isArray(quantityTokens) && quantityTokens.length > 1) {
          productQuantity = quantityTokens.reduce(
            (s, n) => s + (Number.isFinite(n) ? n : 0),
            0
          );
        } else if (
          Array.isArray(quantityTokens) &&
          quantityTokens.length === 1
        ) {
          productQuantity = Number.isFinite(quantityTokens[0])
            ? quantityTokens[0]
            : null;
        } else {
          productQuantity = chambers.reduce(
            (s, ch) => s + (Number(ch.quantity) || 0),
            0
          );
        }
        const products = [
          {
            name: ensureString(row.product_name || row.product || ""),
            quantity: productQuantity != null ? productQuantity : 0,
            chambers: chambers.map((ch) => ({
              name: ch.name,
              id: ch.id,
              quantity: ch.quantity,
            })),
          },
        ];

        const parsePackages = () => {
          const sizes = parseListOfStrings(row.package_size || "");
          const qtysRaw = parseListOfNumbers(row.package_quantity || "");
          const units = parseListOfStrings(row.package_unit || "");
          const maxLen = Math.max(sizes.length, qtysRaw.length, units.length);
          if (maxLen === 0) return [];
          return Array.from({ length: maxLen }, (_, i) => ({
            size: sizes[i] ?? null,
            quantity: qtysRaw[i] != null ? qtysRaw[i] : 0,
            unit: units[i] ?? null,
          }));
        };

        const packages = parsePackages();

        const updatedRow = {
          ...row,
          products,
          packages,
        };

        delete updatedRow.product_chamber;
        delete updatedRow.product_quantity;
        delete updatedRow.package_size;
        delete updatedRow.package_quantity;
        delete updatedRow.package_unit;

        return updatedRow;
      });
    }

    const rmRowsInput = Array.isArray(rawMaterialBlock.rows)
      ? rawMaterialBlock.rows
      : Array.isArray(body.raw_material_orders)
      ? body.raw_material_orders
      : Array.isArray(body.rawMaterialRows)
      ? body.rawMaterialRows
      : [];
    const prodRowsInput = Array.isArray(productionBlock.rows)
      ? productionBlock.rows
      : Array.isArray(body.productions)
      ? body.productions
      : Array.isArray(body.productionRows)
      ? body.productionRows
      : [];
    const chamberRowsInput = Array.isArray(chamberStockBlock.rows)
      ? chamberStockBlock.rows
      : Array.isArray(body.chamber_stock)
      ? body.chamber_stock
      : Array.isArray(body.chamberStockRows)
      ? body.chamberStockRows
      : [];
    const dispatchRowsInput = hasDispatchOrder
      ? Array.isArray(dispatchBlock.rows)
        ? dispatchBlock.rows
        : []
      : [];

    const rawMaterialChallanTop = rawMaterialBlock.challan || null;
    const dispatchChallanTop = dispatchBlock.challan || null;

    const raw_material_orders = (rmRowsInput || []).map((r) => {
      const nr = normalizeRmoRow(r, rawMaterialChallanTop);
      if (
        nr.quantity_ordered != null &&
        typeof nr.quantity_ordered !== "string"
      )
        nr.quantity_ordered = String(nr.quantity_ordered);
      if (
        nr.quantity_received != null &&
        typeof nr.quantity_received !== "string"
      )
        nr.quantity_received = String(nr.quantity_received);
      if (nr.price != null && typeof nr.price !== "string")
        nr.price = String(nr.price);
      return nr;
    });

    const productions = (prodRowsInput || []).map((p) => {
      const np = normalizeProductionRow(p);
      if (np.quantity != null && typeof np.quantity !== "string")
        np.quantity = String(np.quantity);
      return np;
    });

    const chamber_stock = (chamberRowsInput || []).map((c) =>
      normalizeChamberStockRow(c)
    );

    const dispatch_orders = (dispatchRowsInput || []).map((d) => {
      const nd = normalizeDispatchRow(d);
      if (
        (!nd.truck_details || !nd.truck_details.challan) &&
        dispatchChallanTop &&
        Array.isArray(dispatchChallanTop) &&
        dispatchChallanTop[0]
      ) {
        nd.truck_details = nd.truck_details || {};
        nd.truck_details.challan = {
          url:
            dispatchChallanTop[0].preview || dispatchChallanTop[0].url || null,
          key: dispatchChallanTop[0].key || null,
        };
      }
      return nd;
    });

    const vendors = Array.isArray(vendorsInput) ? vendorsInput : [];

    const allowedChambers = await loadAllowedChambers(t);

    const allowedChambersSnapshot = Array.from(allowedChambers).map((name) => ({
      chamber_name: name.trim(),
    }));

    // 0) Payload validation (strict required fields)
const errors = [];

// vendors only if RMOs exist
if (raw_material_orders.length > 0) {
  errors.push(...validateVendors(vendors));
  errors.push(...validateRMOs(raw_material_orders));
}

// productions only if provided
if (productions.length > 0 && raw_material_orders.length > 0) {
  errors.push(...validateProductions(productions));
}

// chamber stock can be standalone
if (chamber_stock.length > 0) {
  errors.push(...validateChamberStock(chamber_stock, allowedChambers));
}

// dispatch optional
if (hasDispatchOrder) {
  errors.push(...validateDispatch(dispatch_orders));
}


    if (errors.length) {
      await t.rollback();
      console.log("errors----", errors);
      return res
        .status(400)
        .json({ error: "Validation failed", details: errors });
    }

    // 1) Ensure Raw Materials exist
 if (raw_material_orders.length > 0) {
  const neededRawNames = [
    ...new Set(
      raw_material_orders
        .map((r) => trimStr(r.raw_material_name))
        .filter(Boolean)
    ),
  ];

  for (const name of neededRawNames) {
    await RawMaterialClient.findOrCreate({
      where: { name },
      defaults: { name },
      transaction: t,
    });
  }
}

if (raw_material_orders.length > 0) {
  const vendorByName = new Map(
    vendors.map((v) => [trimStr(v.name), { ...v, name: trimStr(v.name) }])
  );

  const neededVendors = [
    ...new Set(
      raw_material_orders.map((r) => trimStr(r.vendor)).filter(Boolean)
    ),
  ];

    let existingVendorNames = new Set();
    if (neededVendors.length) {
      const existingRows = await VendorsClient.findAll({
        where: { name: { [Op.in]: neededVendors } },
        transaction: t,
      });
      existingVendorNames = new Set(existingRows.map((v) => v.name));
    }

    for (const name of neededVendors) {
      if (existingVendorNames.has(name)) continue;
      const v = vendorByName.get(name);
      await VendorsClient.findOrCreate({
        where: { name },
        defaults: {
          name,
          alias: v?.alias ?? null,
          phone: String(v?.phone ?? "0000000000"),
          state: v?.state ?? "UNKNOWN",
          city: v?.city ?? "UNKNOWN",
          address: v?.address ?? null,
          materials: Array.isArray(v?.materials) ? v.materials : [],
          orders: [],
        },
        transaction: t,
      });
    }
  }

    // 3) Create Raw Material Orders
    const mapRmo = new Map();
    const createdRmos = [];
    for (const r of raw_material_orders) {
      const id = uuid();
      const payload = {
        ...r,
        id,
        raw_material_name: trimStr(r.raw_material_name),
        vendor: trimStr(r.vendor),
        status: r.arrival_date ? "completed" : "pending",
      };

      delete payload.clientId;

      const row = await RawMaterialOrderClient.create(payload, {
        transaction: t,
      });
      const asJson = row.toJSON();
      createdRmos.push(asJson);

      // update vendor orders array (atomic append)
      const vendorName = trimStr(asJson.vendor);
      await sequelize.query(
        `UPDATE "Vendors"
         SET orders = COALESCE(orders, '{}'::uuid[]) || :rmoId::uuid
         WHERE name = :vendorName
           AND NOT (orders @> ARRAY[:rmoId]::uuid[])`,
        { replacements: { rmoId: asJson.id, vendorName }, transaction: t }
      );

      const [[{ count }]] = await sequelize.query(
        `SELECT COUNT(1) AS count FROM "Vendors" WHERE name = :vendorName`,
        { replacements: { vendorName }, transaction: t }
      );

      if (Number(count) === 0) {
        const fallback = vendorByName.get(vendorName) ?? {};

        const phone =
          fallback.phone != null ? String(fallback.phone) : "0000000000";
        const state = fallback.state ?? "UNKNOWN";
        const city = fallback.city ?? "UNKNOWN";

        await VendorsClient.create(
          {
            name: vendorName,
            alias: fallback.alias ?? null,
            phone,
            state,
            city,
            address: fallback.address ?? null,
            materials: Array.isArray(fallback.materials)
              ? fallback.materials
              : [],
            orders: [asJson.id],
          },
          { transaction: t }
        );
      }

      if (r.clientId) mapRmo.set(r.clientId, id);
    }

    const getDateKey = (iso) => (iso ? String(iso).slice(0, 10) : null);
    const rmoByName = new Map();
    const rmoByNameAndArrivalDate = new Map();

    for (const r of createdRmos) {
      const name = trimStr(r.raw_material_name);
      const arrivalIso = r.arrival_date || null;
      const arrivalDateKey = getDateKey(arrivalIso);
      if (name) {
        rmoByName.set(name, r.id); // overwrite — last one wins (changeable)
        if (arrivalDateKey) {
          const key = `${name}::${arrivalDateKey}`;
          rmoByNameAndArrivalDate.set(key, r.id);
        }
      }
    }
    // ---------------------------------------------------------------------------

    // 4) Create Productions (wire to RMO via clientId mapping) and backfill production_id
    const normalizeProduction = (p) => {
      const out = { ...p };

      if (out.sample_images && Array.isArray(out.sample_images.urls)) {
        out.sample_images = out.sample_images.urls;
      }
      if (out.sample_images == null) out.sample_images = [];

      if (out.status === "pending") out.status = "in-queue";

      if (typeof out.quantity === "number") out.quantity = String(out.quantity);
      if (typeof out.wastage_quantity === "number") {
        out.wastage_quantity = String(out.wastage_quantity);
      }

      return out;
    };

const mapProd = new Map();
const createdProds = [];

if (productions.length > 0 && raw_material_orders.length > 0) {
  for (const p of productions) {
    const id = uuid();

    let rawId = p.raw_material_order_id;

    // AUTO-ATTACH LOT IF NOT PROVIDED
    if (!rawId) {
      const materialName = trimStr(
        p.raw_material_name || p.rawMaterialName || ""
      );

      if (!materialName) {
        throw new Error(`Production ${p.clientId ?? ""} missing raw material name`);
      }

      const lot = await RawMaterialOrderClient.findOne({
        where: {
          raw_material_name: materialName,
          quantity_received: { [Op.gt]: 0 },
          status: "completed"
        },
        order: [["arrival_date", "ASC"]],
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!lot) {
        throw new Error(`No available stock for ${materialName}`);
      }

      rawId = lot.id;

      await lot.update(
        {
          quantity_received: "0",
          status: "consumed"
        },
        { transaction: t }
      );
    }

    if (!rawId) {
      const prodStartIso = toIsoIfDateLike(p.start_time) || null;
      const prodDateKey = prodStartIso
        ? String(prodStartIso).slice(0, 10)
        : null;
      const prodRawName = trimStr(
        p.raw_material_name || p.rawMaterialName || ""
      );

      if (prodRawName && prodDateKey) {
        rawId = rmoByNameAndArrivalDate.get(
          `${prodRawName}::${prodDateKey}`
        );
      }
    }

    if (!rawId) {
      const prodRawName = trimStr(
        p.raw_material_name || p.rawMaterialName || ""
      );
      if (prodRawName) {
        rawId = rmoByName.get(prodRawName);
      }
    }

    if (!rawId) {
      throw new Error(
        `Production ${p.clientId ?? ""} missing raw material link`
      );
    }

    const payload = normalizeProduction({
      ...p,
      id,
      raw_material_order_id: rawId,
    });

    if (!payload.batch_code) {
      const datePart = payload.start_time
        ? format(new Date(payload.start_time), "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd");
      payload.batch_code = `BATCH-${payload.product_name.toUpperCase()}-${datePart}`;
    }

    payload.batch_code = await ensureUniqueBatchCode(payload.batch_code, t);

    delete payload.clientId;
    delete payload.raw_material_orderRef;

    const row = await ProductionClient.create(payload, { transaction: t });
    createdProds.push(row.toJSON());
    if (p.clientId) mapProd.set(p.clientId, id);

    await RawMaterialOrderClient.update(
      { production_id: id },
      { where: { id: rawId }, transaction: t }
    );
  }
}

    // 5) Create-or-update Chamber Stock (only allow products that exist in DB; merge chambers)
    const createdChamber = [];
    const mapCs = new Map();
    const chamberErrors = [];

    for (const [idx, c] of chamber_stock.entries()) {
      const productName = trimStr(c.product_name || "");
      if (!productName) {
        chamberErrors.push({
          path: `chamber_stock[${idx}].product_name`,
          error: "is required",
        });
        continue;
      }
      const rating = trimStr(c.rating || "");
      if (!rating) {
        chamberErrors.push({
          path: `chamber_stock[${idx}].rating`,
          error: "is required",
        });
        continue;
      }

      let existing = await ChamberStockClient.findOne({
        where: { product_name: productName },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

const incomingChambers = Array.isArray(c.chamber)
  ? c.chamber.map((it) => ({
      id: ensureString(it.id || it.chamber_name || it._id || it.name).trim(),
      quantity: ensureString(it.quantity ?? "").trim(), // bags
      packets_per_bag: Number(it.packets_per_bag ?? 1),
      rating: ensureString(it.rating ?? "").trim(),
    }))
  : [];

      if (!existing) {
        const newId = uuid();
        const payload = {
          ...c,
          id: newId,
          product_name: productName,
          chamber: incomingChambers.map(ch => ({
          id: ch.id,
          quantity: ch.quantity,        // bags
          packets_per_bag: ch.packets_per_bag,
          rating: ch.rating
        })),
          category: ensureString(c.category ?? ""),
          unit: ensureString(c.unit ?? ""),
        };
        delete payload.clientId;

        const row = await ChamberStockClient.create(payload, {
          transaction: t,
        });
        const asJson = row.toJSON();
        createdChamber.push(asJson);

        await attachChamberStockToChambers({
          chamberStockId: asJson.id,
          chamberIds: incomingChambers.map((c) => c.id),
          transaction: t,
        });

        if (c.clientId) mapCs.set(c.clientId, asJson.id);
        continue;
      }

      const existingJson = existing.toJSON();
      const existingChambers = Array.isArray(existingJson.chamber)
        ? existingJson.chamber
        : [];

      const existingById = new Map(
        existingChambers.map((it) => [String(it.id).trim(), { ...it }])
      );

      const MERGE_STRATEGY = "SUM_QUANTITY";

      for (const inc of incomingChambers) {
        const incId = String(inc.id || "").trim();
        if (!incId) {
          // skip invalid incoming chamber entry; we could also choose to create a new chamber with generated id
          continue;
        }

        if (existingById.has(incId)) {
          const cur = existingById.get(incId);

          if (MERGE_STRATEGY === "SUM_QUANTITY") {
            const curNum = Number(cur.quantity);
            const incNum = Number(inc.quantity);
            if (Number.isFinite(curNum) && Number.isFinite(incNum)) {
              cur.quantity = String(curNum + incNum);

            } else {
              cur.quantity = inc.quantity || cur.quantity || "";
            }
          } else {
            cur.quantity = inc.quantity != null ? inc.quantity : cur.quantity;
          }

          cur.rating = inc.rating || cur.rating || "";
          cur.packets_per_bag =
  inc.packets_per_bag ?? cur.packets_per_bag ?? 1;

          existingById.set(incId, cur);
        } else {
          existingById.set(incId, {
            id: incId,
            quantity: inc.quantity || "",
            packets_per_bag: inc.packets_per_bag ?? 1,
            rating: inc.rating || "",
          });
        }
      }

      const mergedChambers = existingChambers.map((it) => {
        const id = String(it.id || "").trim();
        return existingById.get(id) || it;
      });

      for (const [id, obj] of existingById.entries()) {
        if (
          !mergedChambers.find((m) => String(m.id).trim() === String(id).trim())
        ) {
          mergedChambers.push(obj);
        }
      }
      const updatedPayload = {
        ...existingJson,
        chamber: mergedChambers,
        category: c.category ? ensureString(c.category) : existingJson.category,
        unit: c.unit ? ensureString(c.unit) : existingJson.unit,
      };

      delete updatedPayload.id;

      await ChamberStockClient.update(updatedPayload, {
        where: { id: existingJson.id },
        transaction: t,
      });

      await attachChamberStockToChambers({
        chamberStockId: existingJson.id,
        chamberIds: incomingChambers.map((c) => c.id),
        transaction: t,
      });

      const refreshed = await ChamberStockClient.findOne({
        where: { id: existingJson.id },
        transaction: t,
      });
      createdChamber.push(refreshed.toJSON());
      
      if (c.category === "packed") {
        const totalBags = incomingChambers.reduce(
          (s, ch) => s + Number(ch.quantity || 0),
          0
        );
  
        const packetsPerBag =
  incomingChambers[0]?.packets_per_bag ?? 1;

        await PackingEventClient.create(
          {
            product_name: productName,
            rating,
            sku_id: uuid(),
            sku_label: productName,
  
            packet: {
              size: c.packaging?.size?.value || 1,
              unit: c.packaging?.size?.unit || "kg",
              packetsPerBag
            },
  
            bags_produced: totalBags,
            total_packets: totalBags * packetsPerBag,
  
            storage: incomingChambers.map((ch) => ({
              chamberId: ch.id,
              bagsStored: Number(ch.quantity || 0)
            })),
  
            rm_consumption: [] 
          },
          { transaction: t }
        );
      }

      if (c.clientId) mapCs.set(c.clientId, refreshed.id);
    }


    if (chamberErrors.length) {
      await t.rollback();
      return res.status(400).json({
        error:
          "Validation failed - invalid chamber stock (products missing in DB)",
        details: chamberErrors,
      });
    }

    // --- PACKAGES (types) DB VALIDATION ---
    const pkgKey = (id, size, unit) =>
      `${id}::${String(size).trim()}::${String(unit ?? "").trim()}`;
    const requestedMap = new Map(); // key -> { id, size, unit, totalRequested }

    for (const d of dispatch_orders) {
      if (!Array.isArray(d.packages)) continue;
      for (const p of d.packages) {
        if (!p || typeof p !== "object") continue;
        const id = (p.id || "").trim();
        if (!id) continue;
        const size = (p.size ?? "").toString().trim();
        const unit = (p.unit ?? "").toString().trim();
        const quantityRaw = p.quantity ?? p.quantity ?? 0;
        const quantity = Number(quantityRaw);
        if (!Number.isFinite(quantity) || quantity <= 0) continue;

        const key = pkgKey(id, size, unit);
        const cur = requestedMap.get(key);
        if (cur) cur.totalRequested += quantity;
        else
          requestedMap.set(key, { id, size, unit, totalRequested: quantity });
      }
    }

    if (hasDispatchOrder && requestedMap.size > 0) {
      const packageIds = [
        ...new Set(Array.from(requestedMap.values()).map((x) => x.id)),
      ];

      const packagesFromDb = await PackagesClient.findAll({
        where: { id: { [Op.in]: packageIds } },
        attributes: ["id", "types"],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const dbById = new Map(packagesFromDb.map((r) => [r.id, r.toJSON()]));

      const pkgIssues = [];

      for (const { id, size, unit, totalRequested } of requestedMap.values()) {
        const row = dbById.get(id);
        if (!row) {
          pkgIssues.push({
            path: `dispatch_orders.packages`,
            error: `Package id '${id}' not found`,
          });
          continue;
        }

        const types = Array.isArray(row.types) ? row.types : [];
        const normalize = (s) =>
          s == null ? "" : String(s).trim().toLowerCase();
        const match = types.find((tItem) => {
          const tSize = normalize(tItem?.size);
          const tUnit = normalize(tItem?.unit);
          return tSize === normalize(size) && tUnit === normalize(unit);
        });

        if (!match) {
          pkgIssues.push({
            path: `dispatch_orders.packages`,
            error: `Package '${id}' does not have a type with size='${size}' and unit='${unit}'`,
          });
          continue;
        }

        const avail = Number(match.quantity);
        if (!Number.isFinite(avail)) {
          pkgIssues.push({
            path: `dispatch_orders.packages`,
            error: `Package '${id}' has invalid stored quantity for size='${size}', unit='${unit}'`,
          });
          continue;
        }

        if (avail < totalRequested) {
          pkgIssues.push({
            path: `dispatch_orders.packages`,
            error: `Package '${id}' insufficient for size='${size}', unit='${unit}': requested ${totalRequested}, available ${avail}`,
          });
        }
      }

      if (pkgIssues.length) {
        await t.rollback();
        return res.status(400).json({
          error: "Validation failed - invalid or insufficient packages/types",
          details: pkgIssues,
        });
      }
    }

    // --- 6) Create Dispatch Orders (moved AFTER validation) ---
    const createdDispatch = [];
    const mapDo = new Map();

    if (hasDispatchOrder) {
      for (const d of dispatch_orders) {
        const id = uuid();
        const payload = { ...d, id };
        delete payload.clientId;

    if (Array.isArray(payload.products)) {
      payload.products = payload.products.map((p) => ({
        ...p,
        quantity: Number(p.quantity),
      }));
    }

    if (Array.isArray(payload.packages)) {
      payload.packages = payload.packages.map((p) => ({
        ...p,
        quantity: Number(p.quantity),
      }));
    }

    const row = await DispatchOrdersClient.create(payload, {
      transaction: t,
    });

    createdDispatch.push(row.toJSON());
    if (d.clientId) mapDo.set(d.clientId, id);
  }
}

    // --- RAW MATERIAL ORDERS notifications ---
    for (const asJson of createdRmos) {
      const description = [
        asJson.quantity_ordered,
        asJson.est_arrival_date ? fmt(asJson.est_arrival_date) : "--",
        asJson.vendor,
      ];

      const type = asJson.arrival_date
        ? "raw-material-reached"
        : "raw-material-ordered";

      notificationJobs.push(() =>
        dispatchAndSendNotification({
          type,
          title: asJson.raw_material_name,
          id: asJson.id,
          description,
        })
      );
    }

    // --- PRODUCTIONS notifications & updates ---
    for (const prod of createdProds) {
      const status = (prod.status || "").toLowerCase();

      let laneName = null;
      if (prod.lane) {
        try {
          const laneRec = await validateLaneAssignment(prod.lane, prod.id);
          laneName = laneRec?.name || null;
        } catch (_) {}
      }

      if (status === "in-progress" && laneName) {
        const description = [
          prod.product_name,
          `${prod.quantity}${prod.unit || ""}`,
        ];
        notificationJobs.push(() =>
          dispatchAndSendNotification({
            type: "lane-occupied",
            title: laneName,
            id: prod.id,
            description,
          })
        );
      }

      if (status === "completed" && laneName) {
        notificationJobs.push(() =>
          dispatchAndSendNotification({
            type: "lane-empty",
            title: laneName,
            id: prod.id,
          })
        );
      }

      if (status === "in-progress") {
        notificationJobs.push(() =>
          createAndSendProductionStartNotification(prod, laneName || "--")
        );
      }

      if (status === "completed") {
        notificationJobs.push(() =>
          createAndSendProductionCompleteNotification(
            prod,
            allowedChambersSnapshot
          )
        );
      }
    }

    // --- DISPATCH ORDERS notifications ---
    if (hasDispatchOrder) {
    for (const dj of createdDispatch) {
      const totalWeight = (dj?.products ?? []).reduce((productSum, p) => {
        if (Array.isArray(p?.chambers) && p.chambers.length) {
          const chamberSum = p.chambers.reduce(
            (s, ch) => s + (Number(ch.quantity) || 0),
            0
          );
          return productSum + chamberSum;
        }
        const quantity = Number(p?.quantity);
        return productSum + (Number.isFinite(quantity) ? quantity : 0);
      }, 0);

const description = [
  dj.product_name,
  `${totalWeight} Bags`
];

      notificationJobs.push(() =>
        dispatchAndSendNotification({
          type: "order-ready",
          description,
          title: dj.customer_name,
          id: dj.id,
          extraData: { id: dj.id, status: "pending" },
        })
      );

      const status = (dj.status || "").toLowerCase();

      if (status === "in-progress" || dj.dispatch_date) {
        notificationJobs.push(() =>
          dispatchAndSendNotification({
            type: "order-shipped",
            description,
            title: dj.customer_name,
            id: dj.id,
          })
        );
      }

      if (status === "completed" || dj.delivered_date) {
        notificationJobs.push(() =>
          dispatchAndSendNotification({
            type: "order-reached",
            description,
            title: dj.customer_name,
            id: dj.id,
          })
        );
      }
    }
  }
    await t.commit();

    try {
      await Promise.all(notificationJobs.map((fn) => fn()));
    } catch (notifyErr) {
      console.error("Notification fanout failed:", notifyErr);
    }

    return res.status(201).json({
      idMap: {
        raw_material_orders: Object.fromEntries(mapRmo),
        productions: Object.fromEntries(mapProd),
        chamber_stock: Object.fromEntries(mapCs),
        dispatch_orders: Object.fromEntries(mapDo),
      },
      created: {
        raw_material_orders: createdRmos,
        productions: createdProds,
        chamber_stock: createdChamber,
        dispatch_orders: createdDispatch,
      },
    });
  } catch (err) {
    try {
      if (t && !t.finished) {
        await t.rollback();
      }
    } catch (rbErr) {
      console.error("Rollback error:", rbErr);
    }
    console.error("Bulk ingest failed:", err?.errors ?? err?.parent ?? err);
    return res.status(400).json({ error: "Validation error" });
  }
});

module.exports = router;