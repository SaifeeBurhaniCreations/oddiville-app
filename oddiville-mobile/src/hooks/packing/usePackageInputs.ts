import { useCallback, useMemo, useState } from "react";
import {
  PackageInputsByKey,
  PackageInputState,
} from "@/src/types/domain/packing/packing.types";

type Updater<T> = T | ((prev: T | undefined) => T);

export function usePackageInputs() {
  const [packageInputs, setPackageInputs] = useState<PackageInputsByKey>({});

  const updatePackageInput = useCallback(
    <K extends keyof PackageInputState>(
      packageKey: string,
      field: K,
      value: Updater<PackageInputState[K]>
    ) => {
      setPackageInputs((prev) => {
        const prevPkg = prev[packageKey] ?? {};

        return {
          ...prev,
          [packageKey]: {
            ...prevPkg,
            [field]:
              typeof value === "function" ? value(prevPkg[field]) : value,
          },
        };
      });
    },
    []
  );

  const removePackage = useCallback((packageKey: string) => {
    setPackageInputs((prev) => {
      const { [packageKey]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const reset = useCallback(() => {
    setPackageInputs({});
  }, []);

  /* ======================================================
     ✅ DERIVED SKU GUARDS (READ-ONLY)
  ====================================================== */

  const packageErrors = useMemo(() => {
    const errors: Record<string, string> = {};

    Object.entries(packageInputs).forEach(([packageKey, input]) => {
      const bagCount = input.bagCount ?? 0;
      const chambers = input.chambers ?? {};

      if (!bagCount) return;

      const chamberSum = Object.values(chambers).reduce(
        (sum, v) => sum + (Number(v) || 0),
        0
      );

      if (chamberSum > bagCount) {
        errors[
          packageKey
        ] = `Assigned ${chamberSum} bags, but only ${bagCount} selected`;
        return;
      }

      if (chamberSum < bagCount) {
        errors[packageKey] = `Assign all ${bagCount} bags to chambers`;
      }
    });

    return errors;
  }, [packageInputs]);

  return {
    packageInputs,
    updatePackageInput,
    removePackage,
    reset,

    // read-only
    packageErrors,
  };
}
