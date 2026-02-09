import { useCallback } from "react";

export default function useInventoryValidator() {
  const STEP_RULES = {
    1: {
      name: "Raw Material",
      requiredColumns: [
        "raw_material_name",
        "vendor",
        "quantity_ordered",
        "unit",
        "order_date",
        "est_arrival_date",
        "arrival_date",
        "truck_weight",
        "tare_weight",
        "truck_loaded_weight",
        "truck_number",
        "driver_name",
        "rating",
        "quantity_received",
        "price",
      ],
      validators: {
        Quantity: (v) =>
          v === "" || v == null
            ? "Quantity is required"
            : isFinite(Number(v))
            ? null
            : "Quantity must be a number",
        HSN: (v) =>
          v === "" || v == null
            ? "HSN is required"
            : /^\d+$/.test(String(v).trim())
            ? null
            : "HSN must be numeric",
      },
    },
    2: {
      name: "Vendor",
      requiredColumns: [
        "name",
        "phone",
        "state",
        "city",
        "address",
        "materials",
      ],
      validators: {
        Quantity: (v) =>
          v === "" || v == null
            ? "Quantity is required"
            : isFinite(Number(v))
            ? null
            : "Quantity must be a number",
      },
    },
    // 2: {
    //   name: "Production",
    //   requiredColumns: [
    //     "product_name",
    //     "raw_material_name",
    //     "quantity",
    //     "unit",
    //     "status",
    //     "start_time",
    //     "end_time",
    //     "wastage_quantity",
    //     "supervisor",
    //     "lane",
    //     "recovery",
    //     "rating",
    //   ],
    //   validators: {
    //     Quantity: (v) =>
    //       v === "" || v == null
    //         ? "Quantity is required"
    //         : isFinite(Number(v))
    //         ? null
    //         : "Quantity must be a number",
    //   },
    // },
    3: {
      name: "Chamber Stock",
      requiredColumns: [
        "product_name",
        "category",
        "unit",
        "chamber_name",
        "bags",
        "packets_per_bag",
        "rating",
      ],
 validators: {
    Quantity: (v) =>
      v === "" || v == null
        ? "Quantity is required"
        : isFinite(Number(v))
        ? null
        : "Quantity must be a number",

    rating: (v) => {
      const n = Number(v);
      if (!Number.isFinite(n)) return "Rating must be a number";
      if (n < 1 || n > 5) return "Rating must be between 1 and 5";
      return null;
    },
      packets_per_bag: (v) => {
      const n = Number(v);
      if (!Number.isInteger(n)) return "Packets per bag must be an integer";
      if (n <= 0) return "Packets per bag must be greater than 0";
      return null;
    }
  },
    },
    4: {
      name: "Dispatch",
      requiredColumns: [
        "customer_name",
        "status",
        "est_delivered_date",
        // "dispatch_date",
        // "delivered_date",
        "amount",
        "product_name",
        "product_bags",
        "product_chamber",
        "package_size",
        "package_quantity",
        "package_unit",
        "truck_weight",
        "tare_weight",
        "truck_loaded_weight",
        "truck_number",
        "truck_agency",
        "truck_driver",
        "truck_phone",
      ],
    validators: {
        Quantity: (v) =>
          v === "" || v == null
            ? "Quantity is required"
            : isFinite(Number(v))
            ? null
                : "Quantity must be a number",
          },
        },
  };

  const normalize = (s) => (s == null ? "" : String(s).trim().toLowerCase());

  const rowsToObjects = (rows2D) => {
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

    const dataRows = rows2D.slice(1);
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
      rowsToObjects(rows2D);

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
