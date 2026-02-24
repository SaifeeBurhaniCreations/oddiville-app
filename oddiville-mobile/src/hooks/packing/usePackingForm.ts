import { PackagingPlanItem } from "@/src/types/domain/packing/packing.types";
import { useCallback, useEffect, useMemo, useState } from "react";

/* ======================================================
   Types
====================================================== */
type rmMeta = {
  rmId: string;
  chambers: {
    chamberId: string;
    rating: number;
  }[];
}
type PackingForm = {
  product: {
    productName: string;
    finalRating: number;
  };
 rmInputs: {
    [rmId: string]: {
      [chamberId: string]: number;
    };
  };
  
  rmMeta: rmMeta[]

  rmConsumption: {
    [rmId: string]: {
      [chamberId: string]: {
        outer_used: number;
        rating: number;
      };
    };
  };

  outputs: {
    outer_container: "BAG" | "BOX";
    inner_unit: "PACKET" | "UNIT";
    conversion: {
      inner_per_outer: number;
      kg_per_outer?: number;
    };
  }[];
};

export type CreatePackingEventDTO = {
  product: {
    productName: string;
    finalRating: number;
  };
  rmConsumption: {
    [rmId: string]: {
      [chamberId: string]: {
        outer_used: number;
        rating: number;
      };
    };
  };
  outputs: {
    outer_container: "BAG" | "BOX";
    inner_unit: "PACKET" | "UNIT";
    conversion: {
      inner_per_outer: number;
      kg_per_outer?: number;
    };
  }[];
  packagingPlan: PackagingPlanItem[];
};

type InternalPackingForm = {
  product: {
    productName: string;
    finalRating: number;
  };
rmInputs: {
  [rmId: string]: {
    [chamberId: string]: number;
  };
};

  rmMeta: rmMeta[];
  outputs: CreatePackingEventDTO["outputs"];
  packagingPlan: PackagingPlanItem[];
};

export type ValidationResult =
  | { success: true; data: CreatePackingEventDTO }
  | { success: false; errors: Record<string, string> };

type PackingFormOptions = {
  validateOnChange?: boolean;
};

export type PackingFormController = {
  values: InternalPackingForm;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  hasError: (path: string) => boolean;
  getError: (path: string) => string | undefined;
  setField: (path: string, value: any) => void;
  setRMInput: (rmId: string, chamberId: string, value: number) => void;
  setRMMeta: (meta: rmMeta[]) => void;
  validateForm: () => ValidationResult;
  resetForm: () => void;
  clearError: (field: string) => void;
  canSubmit: boolean;
  setPackagingPlan: (plan: PackagingPlanItem[]) => void;
  getErrors: () => Record<string, string>;
  removePackagingPlan: (packageKey: string) => void;
};

export type PackingSubmitPayload = CreatePackingEventDTO;

/* ======================================================
   Constants
====================================================== */
const BLOCKING_ERRORS = new Set(["product.productName", "cross"]);

/* ======================================================
   Hook
====================================================== */

export function usePackingForm(options: PackingFormOptions = {}) {
  const { validateOnChange = false } = options;

  const [values, setValues] = useState<InternalPackingForm>({
    product: { productName: "", finalRating: 5 },
    rmInputs: {},
    rmMeta: [],
    outputs: [],
    packagingPlan: [],
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

  const rmConsumption = buildRMConsumption(
    values.rmMeta,
    values.rmInputs
  );

  if (Object.keys(rmConsumption).length === 0) {
    newErrors["rm"] = "Raw material consumption is required";
  }

  if (values.packagingPlan.length === 0) {
    newErrors["packaging"] = "Packaging quantity is required";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return { success: false, errors: newErrors };
  }

  return {
    success: true,
    data: buildFinalPayload(values),
  };
}, [values]);

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
  const getErrors = useCallback(
    () => errors,
    [errors]
  );

const canSubmit = useMemo(() => {
  const rmConsumption = buildRMConsumption(
    values.rmMeta,
    values.rmInputs
  );

if (!values.product.productName) return false;
if (values.packagingPlan.length === 0) return false;
if (Object.keys(rmConsumption).length === 0) return false;

return true;
}, [values]);

  const resetForm = useCallback(() => {
    setValues({
      product: { productName: "", finalRating: 5 },
      rmInputs: {},
      rmMeta: [],
      outputs: [],
      packagingPlan: [],
    });
    setErrors({});
    setTouched({});
    setHasSubmitted(false);
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

const setRMInput = useCallback(
  (rmId: string, chamberId: string, value: number) => {
    setValues(prev => ({
      ...prev,
      rmInputs: {
        ...prev.rmInputs,
        [rmId]: {
          ...(prev.rmInputs?.[rmId] || {}),
          [chamberId]: value,
        },
      },
    }));
  },
  []
);

  const setRMMeta = useCallback((meta: rmMeta[]) => {
    setValues((prev) => ({
      ...prev,
      rmMeta: meta,
    }));
  }, []);

  const setPackagingPlan = useCallback((plan: PackagingPlanItem[]) => {
    setValues((prev) => ({
      ...prev,
      packagingPlan: plan,
    }));
  }, []);

    const removePackagingPlan = useCallback((packageKey: string) => {
    setValues(prev => ({
      ...prev,
      packagingPlan: prev.packagingPlan.filter(
        p => `${p.packet.size}-${p.packet.unit}` !== packageKey
      )
    }));
  }, []);

  const controller = useMemo(
    () => ({
      values,
      errors,
      touched,
      hasError,
      getError,
      getErrors,
      setField,
      validateForm,
      resetForm,
      canSubmit,
      clearError,
      setRMInput,
      setRMMeta,
      setPackagingPlan,
       removePackagingPlan,
    }),
    [
      values,
      errors,
      touched,
      hasError,
      getError,
      getErrors,
      setField,
      validateForm,
      resetForm,
      canSubmit,
      clearError,
      setRMInput,
      setRMMeta,
      setPackagingPlan,
      removePackagingPlan,
    ]
  );

  return controller;
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

function buildRMConsumption(
  rmMeta: rmMeta[],
  rmInputs: PackingForm["rmInputs"]
): PackingForm["rmConsumption"] {
  const result: PackingForm["rmConsumption"] = {};

  rmMeta.forEach((rm) => {
    const rmInputForRM = rmInputs[rm.rmId];
    if (!rmInputForRM) return;

    const chambers: Record<
      string,
      { outer_used: number; rating: number }
    > = {};

    rm.chambers.forEach((ch) => {
      const value = rmInputForRM[ch.chamberId];
      if (!value || value <= 0) return;

      chambers[ch.chamberId] = {
        outer_used: Number(value),
        rating: ch.rating,
      };
    });

    if (Object.keys(chambers).length > 0) {
      result[rm.rmId] = chambers;
    }
  });

  return result;
}

function buildFinalPayload(values: InternalPackingForm): CreatePackingEventDTO {
  const rmConsumption = buildRMConsumption(values.rmMeta, values.rmInputs);

  return {
    product: values.product,
    rmConsumption,
    outputs: values.outputs, 
    packagingPlan: values.packagingPlan,
  };
}
