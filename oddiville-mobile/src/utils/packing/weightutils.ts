import { PacketsAvailableInput } from "@/src/types/domain/packing/packing.types";
import { PackageItem } from "../../types";

type PackageType = "pouch" | "bag" | "box";

type TareRange = { max: number; tare: number };

const TARE_WEIGHT_MAP: Record<PackageType, TareRange[]> = {
  pouch: [
    { max: 100, tare: 0.4 },
    { max: 250, tare: 0.6 },
    { max: 500, tare: 0.9 },
    { max: 1000, tare: 1.5 },
    { max: 2000, tare: 2.5 },
    { max: 5000, tare: 4 },
    { max: 10000, tare: 7 },
  ],
  bag: [
    { max: 1000, tare: 1 },
    { max: 5000, tare: 2 },
    { max: 25000, tare: 5 },
  ],
  box: [
    { max: 5000, tare: 3 },
    { max: 25000, tare: 8 },
    { max: Infinity, tare: 15 },
  ],
};

export function getTareWeight(
  type: PackageType,
  size: number,
  unit: "gm" | "kg"
): number {
  const sizeInGram = unit === "kg" ? size * 1000 : size;

  const ranges = TARE_WEIGHT_MAP[type];
  const found = ranges.find((r) => sizeInGram <= r.max);

  return found?.tare ?? 1;
}

type WeightUnit = "gm" | "kg";

export function parseWeightBoth(weight: string): {
  value: number;
  unit: WeightUnit;
} {
  const normalized = weight.toLowerCase().replace(/\s+/g, "");

  if (normalized.endsWith("kg")) {
    return {
      value: Number(normalized.replace("kg", "")),
      unit: "kg",
    };
  }

  if (normalized.endsWith("gm")) {
    return {
      value: Number(normalized.replace("gm", "")),
      unit: "gm",
    };
  }

  throw new Error(`Invalid weight format: ${weight}`);
}

export const getSimplifiedMaxPackagesFor = (
  input: PacketsAvailableInput
): number => {
  const { size, unit, storedKg } = input;

  if (storedKg <= 0 || Number.isNaN(storedKg)) return 0;

  const storedGrams = storedKg * 1000;
  const tareWeightGrams = getTareWeight("pouch" as PackageType, size, unit);

  return Math.floor(storedGrams / tareWeightGrams);
};


export const getMaxPackagesFor = (pkg: PackageItem): number | null => {
  const storedKg = Number(pkg.stored_quantity)

  if (Number.isNaN(storedKg) || storedKg <= 0) return null

  const storedGrams = storedKg * 1000;
    const size = Number(pkg.size)
  const unit = pkg.unit as 'gm' | 'kg'
  const type = 'pouch' as PackageType

   const tareWeightGrams = getTareWeight(
    type,
    size,
    unit
  )

  return Math.floor(storedGrams / tareWeightGrams)
}

export const convertToKg = (size: number, unit: string) => {
  const lowerUnit = unit?.toLowerCase();
  if (lowerUnit === "kg") return size;
  if (lowerUnit === "gm") return size / 1000;
  return 0;
};