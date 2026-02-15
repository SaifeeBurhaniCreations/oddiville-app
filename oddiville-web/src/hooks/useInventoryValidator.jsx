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
        "unit",
        "chamber_name",
        "bags",
        "size_value",
        "size_unit",
        "packets_per_bag",
        "rating",
      ],
      validators: {
        bags: (v) =>
          v === "" || v == null
            ? "Bags is required"
            : isFinite(Number(v))
              ? null
              : "Bags must be a number",

        size_value: (v) =>
          v === "" || v == null
            ? "Size value is required"
            : isFinite(Number(v))
              ? null
              : "Size value must be a number",

        packets_per_bag: (v) =>
          v === "" || v == null
            ? null
            : isFinite(Number(v))
              ? null
              : "Packets per bag must be a number",
      },
    },
    4: {
      name: "Dispatch",
      requiredColumns: [
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