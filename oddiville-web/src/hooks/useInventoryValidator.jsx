import { useCallback } from "react";

export default function useInventoryValidator() {
  const STEP_RULES = {
    1: {
      name: "Vendor",
      requiredColumns: [
        "name",
        "phone",
        "state",
        "city",
        "address",
        "materials",
      ],
    },
    2: {
      name: "Raw Material",
      requiredColumns: [
        "raw_material_name",
        "vendor",
        "quantity_ordered",
        "unit",
        "order_date",
        "est_arrival_date",
        "arrival_date",
        "gross_weight",
        "tare_weight",
        "truck_number",
        "driver_name",
        "rating",
        "quantity_received",
        "price",
      ],
      validators: {
        gross_weight: (v) =>
          isFinite(Number(v)) ? null : "Gross weight must be a number",

        tare_weight: (v) =>
          isFinite(Number(v)) ? null : "Tare weight must be a number",
      }
    },
3: {
  name: "Chamber Stock",
  requiredColumns: [
    "product_name",
    "category",
    "chamber_name",
    "size_value",
    "size_unit",
    "rating",
  ],
    },
    4: {
      name: "Dispatch",
      requiredColumns: [
        "order_id",
        "customer_name",
        "address",
        "state",
        "country",
        "city",
        "status",
        "est_delivered_date",
        "amount",
        "product_name",
        "chamber_id",
        "dispatch_quantity",
        "package_size",
        "package_unit",
        "rating",
        "package_quantity",
        "gross_weight",
        "tare_weight",
        "truck_number",
        "truck_agency",
        "truck_driver",
        "truck_phone",
      ],
    }
  };

  const normalize = (s) =>
    s == null
      ? ""
      : String(s)
        .normalize("NFKD")
        .replace(/[^\w\s]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_");

  const rowsToObjects = (rows2D, rule) => {
    if (!Array.isArray(rows2D) || rows2D.length === 0)
      return { headers: [], headerNormToOriginal: {}, objects: [] };

    const rawHeaders = rows2D[0].map((h) => (h == null ? "" : String(h)));
    const headerNormToOriginal = {};

    const normalizedHeaders = rawHeaders.map((h) => {
      const n = normalize(h);
      if (!(n in headerNormToOriginal))
        headerNormToOriginal[n] = h == null ? "" : String(h).trim();
      return n;
    });

    const requiredNorms = rule.requiredColumns.map((c) => normalize(c));

    const dataRows = rows2D.slice(1).filter((row) => {
      if (!row || row.length === 0) return false;
      
      let filledRequired = 0;

      requiredNorms.forEach((reqNorm) => {
        const header = headerNormToOriginal[reqNorm];
        if (!header) return;

        const index = rawHeaders.indexOf(header);
        const value = row[index];

        if (
          value != null &&
          String(value).trim() !== "" &&
          String(value).trim() !== "`" &&
          String(value).trim() !== "-"
        ) {
          filledRequired++;
        }
      });

      return filledRequired > 0;
    });

    const objects = dataRows.map((row) => {
      const obj = {};
      for (let i = 0; i < normalizedHeaders.length; i++) {
        const key =
          headerNormToOriginal[normalizedHeaders[i]] || normalizedHeaders[i];
        obj[key] = row && i < row.length ? row[i] : "";
      }
      return obj;
    });

    return {
      headers: rawHeaders,
      headerNormToOriginal,
      objects,
      normalizedHeaders,
    };
  };


  const validateExcel = useCallback((rows2D, step = 1) => {
    const rule = STEP_RULES[step];
    
    if (!rule) {
      return {
        errors: [
          {
            column: "global",
            issues: [{ row: 0, message: `No rules defined for step ${step}` }],
          },
        ],
        mappedRows: [],
      };
    }

    const { headerNormToOriginal, objects, normalizedHeaders } =
      rowsToObjects(rows2D, rule);

    const availableNorms = {};
    Object.keys(headerNormToOriginal).forEach((norm) => {
      availableNorms[norm] = headerNormToOriginal[norm];
    });

    const requiredNormalized = rule.requiredColumns.map((c) => normalize(c));

    const missingColumns = requiredNormalized.filter(
      (req) => !(req in availableNorms)
    );
    const errorsByColumn = {};

    missingColumns.forEach((missNorm) => {
      const display =
        rule.requiredColumns.find((rc) => normalize(rc) === missNorm) ||
        missNorm;
      errorsByColumn[display] = {
        column: display,
        issues: [{ row: 0, message: `Missing required column: ${display}` }],
      };
    });

    objects.forEach((rowObj, idx) => {
      const rowNumber = idx + 2; 

if (step === 3) {
  const categoryHeader = availableNorms[normalize("category")];
  const bagsHeader = availableNorms[normalize("bags")];
  const quantityHeader = availableNorms[normalize("quantity")];
  const packetsHeader = availableNorms[normalize("packets_per_bag")];

  if (categoryHeader) {
    const categoryValue = String(rowObj[categoryHeader] || "")
      .trim()
      .toLowerCase();

    // ===== BULK =====
    if (categoryValue === "bulk") {
      const qty = rowObj[quantityHeader];

      if (!qty || !isFinite(Number(qty))) {
        errorsByColumn["quantity"] = errorsByColumn["quantity"] || {
          column: "quantity",
          issues: [],
        };
        errorsByColumn["quantity"].issues.push({
          row: rowNumber,
          message: "Material must have valid quantity (KG)",
        });
      }

      if (rowObj[bagsHeader]) {
        errorsByColumn["bags"] = errorsByColumn["bags"] || {
          column: "bags",
          issues: [],
        };
        errorsByColumn["bags"].issues.push({
          row: rowNumber,
          message: "Material must NOT contain bags",
        });
      }

      if (rowObj[packetsHeader]) {
        errorsByColumn["packets_per_bag"] =
          errorsByColumn["packets_per_bag"] || {
            column: "packets_per_bag",
            issues: [],
          };
        errorsByColumn["packets_per_bag"].issues.push({
          row: rowNumber,
          message: "Material must NOT contain packets_per_bag",
        });
      }
    }

    // ===== PACKED =====
    if (categoryValue === "packed") {
      const bags = rowObj[bagsHeader];
      const packets = rowObj[packetsHeader];

      if (!bags || !isFinite(Number(bags))) {
        errorsByColumn["bags"] = errorsByColumn["bags"] || {
          column: "bags",
          issues: [],
        };
        errorsByColumn["bags"].issues.push({
          row: rowNumber,
          message: "Packed product must have valid bags",
        });
      }

      if (!packets || !isFinite(Number(packets))) {
        errorsByColumn["packets_per_bag"] =
          errorsByColumn["packets_per_bag"] || {
            column: "packets_per_bag",
            issues: [],
          };
        errorsByColumn["packets_per_bag"].issues.push({
          row: rowNumber,
          message: "Packed product must have packets_per_bag",
        });
      }

      if (rowObj[quantityHeader]) {
        errorsByColumn["quantity"] = errorsByColumn["quantity"] || {
          column: "quantity",
          issues: [],
        };
        errorsByColumn["quantity"].issues.push({
          row: rowNumber,
          message: "Packed product must NOT contain quantity",
        });
      }
    }
  }
}
      rule.requiredColumns.forEach((reqCol) => {
        const normReq = normalize(reqCol);
        const originalHeader = availableNorms[normReq];
        if (!originalHeader) {
          return;
        }
        const value = rowObj[originalHeader];
        if (value === "" || value == null) {
          const display = originalHeader;
          errorsByColumn[display] = errorsByColumn[display] || {
            column: display,
            issues: [],
          };
          errorsByColumn[display].issues.push({
            row: rowNumber,
            message: `${display} is required`,
          });
        } else {
          const validatorFn = rule.validators && rule.validators[reqCol];
          if (typeof validatorFn === "function") {
            const maybeMsg = validatorFn(value);
            if (maybeMsg) {
              const display = originalHeader;
              errorsByColumn[display] = errorsByColumn[display] || {
                column: display,
                issues: [],
              };
              errorsByColumn[display].issues.push({
                row: rowNumber,
                message: maybeMsg,
              });
            }
          }
        }
      });

      if (rule.validators) {
        Object.keys(rule.validators).forEach((col) => {
          const normCol = normalize(col);
          const originalHeader = availableNorms[normCol];
          if (!originalHeader) return;
        });
      }
    });

    const errors = Object.keys(errorsByColumn).map((k) => errorsByColumn[k]);

    const mappedRows = objects.map((r) => {
      const mapped = {};
      Object.keys(r).forEach((k) => {
        const trimmedKey = k == null ? "" : String(k).trim();
        mapped[trimmedKey] = r[k];
      });
      try {
        mapped._id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      } catch {
        mapped._id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      }
      return mapped;
    });

    return { errors, mappedRows };
  }, []);

  return { validateExcel };
}