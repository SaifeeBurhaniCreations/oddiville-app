import { PackingPackages } from "@/src/types/domain/packing/packing.types";
import { PackageSize } from "@/src/redux/slices/bottomsheet/package-size.slice";
import { OutputBagPackaging } from "@/src/hooks/useChamberStock";

export const normalizeToPackingPackages = (data: any[]): PackingPackages[] => {
    return data.map((item) => ({
        size: item.size,
        unit: item.unit,
        count: item.totalAvailableCount,
    }));
};
// ----------------------------------------------------------------------------
export type NormalizedSelectedPackage = {
    size: number;
    unit: "gm" | "kg";
};

export const normalizeSelectedPackages = (
    selected: PackageSize[]
): NormalizedSelectedPackage[] => {
    return selected
        .filter(
            (p): p is PackageSize & { unit: "gm" | "kg" } =>
                p.unit === "gm" || p.unit === "kg"
        )
        .map((p) => ({
            size: p.size,
            unit: p.unit,
        }));
};

// ----------------------------------------------------------------------------
export function toChamberPackage(
  pkg: PackingPackages,
  packetsPerBag: number
): OutputBagPackaging {
  if (pkg.unit !== "gm" && pkg.unit !== "kg") {
    throw new Error(
      `Invalid unit for output bag packaging: ${pkg.unit}`
    );
  }

  return {
    size: {
      value: pkg.size,
      unit: pkg.unit,
    },
    packetsPerBag,
  };
}

// ----------------------------------------------------------------------------
export function normalizeKgToGrams(size: number, unit: string): number {
    return unit === "kg" ? size * 1000 : size;
}

// ----------------------------------------------------------------------------
export function normalizeBagsToKg(bags: number, packetsPerBag: number): number {
    return (bags * packetsPerBag) / 1000;
}