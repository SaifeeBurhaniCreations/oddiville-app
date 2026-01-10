import { useCallback, useMemo, useState } from "react";

/* ======================================================
   Types
====================================================== */

export type PackingForm = {
  product: {
    productName: string;
    finalRating: number;
  };

  rmConsumption: {
    [rmName: string]: {
      [chamberId: string]: {
        outer_used: number;
        rating: number;
      };
    };
  };

  outputs: {
    outer_container: "BAG" | "BOX";
    inner_unit: "PACKET" | "UNIT";
    outer_produced: number;
    conversion: {
      inner_per_outer: number;
      kg_per_outer?: number;
    };
  }[];
};

export type ValidationResult =
  | { success: true; data: PackingForm }
  | { success: false; errors: Record<string, string> };

type PackingFormOptions = {
  validateOnChange?: boolean;
};

/* ======================================================
   Hook
====================================================== */

export function usePackingForm(options: PackingFormOptions = {}) {
  const { validateOnChange = false } = options;

  const [values, setValues] = useState<PackingForm>({
    product: { productName: "", finalRating: 5 },
    rmConsumption: {},
    outputs: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  /* ======================================================
     Field Setter
  ====================================================== */
  const setField = useCallback(
    (path: string, value: any) => {
      setValues((prev) => {
        const clone = structuredClone(prev);
        const keys = path.split(".");
        let ref: any = clone;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!ref[keys[i]]) ref[keys[i]] = {};
          ref = ref[keys[i]];
        }

        ref[keys[keys.length - 1]] = value;
        return clone;
      });

      setTouched((prev) => ({ ...prev, [path]: true }));

      if (validateOnChange) {
        const error = validateField(path, value);
        setErrors((prev) => {
          const next = { ...prev };
          if (error) next[path] = error;
          else delete next[path];
          return next;
        });
      }
    },
    [validateOnChange]
  );

  /* ======================================================
     Submit Validation (FINAL)
  ====================================================== */
  const validateForm = useCallback((): ValidationResult => {
    setHasSubmitted(true);

    const newErrors: Record<string, string> = {};

    if (!values.product.productName) {
      newErrors["product.productName"] = "Product is required";
    }

    if (values.product.finalRating < 1 || values.product.finalRating > 5) {
      newErrors["product.finalRating"] = "Invalid product rating";
    }

    const totalOuterUsed = sumOuterUsed(values.rmConsumption);
    const totalOuterProduced = sumOuterProduced(values.outputs);

    if (totalOuterUsed === 0) {
      newErrors.rmConsumption =
        "At least one raw material container must be consumed";
    }

    if (totalOuterUsed !== totalOuterProduced) {
      newErrors.cross =
        `Consumed (${totalOuterUsed}) must equal produced (${totalOuterProduced})`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return { success: false, errors: newErrors };
    }

    return { success: true, data: values };
  }, [values]);

  /* ======================================================
     UI Helpers
  ====================================================== */

  const hasError = useCallback(
    (path: string) =>
      Boolean(errors[path]) && (touched[path] || hasSubmitted),
    [errors, touched, hasSubmitted]
  );

  const getError = useCallback(
    (path: string) =>
      hasError(path) ? errors[path] : undefined,
    [errors, hasError]
  );

  const canSubmit = useMemo(() => {
  if (!values.product.productName) return false;

  if (hasBlockingErrors(errors)) return false;

  return true;
}, [values.product.productName, errors]);


  const resetForm = useCallback(() => {
    setValues({
      product: { productName: "", finalRating: 5 },
      rmConsumption: {},
      outputs: [],
    });
    setErrors({});
    setTouched({});
    setHasSubmitted(false);
  }, []);

  const totals = useMemo(
    () => ({
      outerUsed: sumOuterUsed(values.rmConsumption),
      outerProduced: sumOuterProduced(values.outputs),
    }),
    [values]
  );

  return {
    values,
    errors,
    touched,
    hasError,
    getError,
    setField,
    validateForm,
    resetForm,
    totals,
    canSubmit,
  };
}

/* ======================================================
   Field Validation (onChange)
====================================================== */

function validateField(path: string, value: any): string | null {
  if (path === "product.productName" && !value)
    return "Product is required";

  if (path === "product.finalRating" && (value < 1 || value > 5))
    return "Invalid rating";

  if (path.endsWith("outer_used") && value <= 0)
    return "Must be greater than 0";

  if (path.endsWith("outer_produced") && value <= 0)
    return "Must be greater than 0";

  if (path.endsWith("inner_per_outer") && value <= 0)
    return "Conversion must be valid";

  return null;
}

/* ======================================================
   Helpers
====================================================== */

function sumOuterUsed(rmConsumption: PackingForm["rmConsumption"]) {
  return Object.values(rmConsumption).reduce(
    (rmSum, chambers) =>
      rmSum +
      Object.values(chambers).reduce(
        (sum, c) => sum + (Number(c.outer_used) || 0),
        0
      ),
    0
  );
}

function sumOuterProduced(outputs: PackingForm["outputs"]) {
  return outputs.reduce(
    (sum, o) => sum + (Number(o.outer_produced) || 0),
    0
  );
}

function hasBlockingErrors(errors: Record<string, string>) {
  return Object.keys(errors).length > 0;
}

export type PackingFormController = ReturnType<typeof usePackingForm>;
