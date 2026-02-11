import { AddPackageQuantityForm } from "../components/ui/bottom-sheet/InputComponent";

export const PACKAGE_UNITS = ["kg", "gm", "qn", "unit"] as const;

export type PackageUnit = typeof PACKAGE_UNITS[number];

export const isPackageUnit = (unit?: string): unit is PackageUnit => {
  return PACKAGE_UNITS.includes(unit as PackageUnit);
};