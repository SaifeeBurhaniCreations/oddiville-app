// mapStorageFormToPackedDTO.ts
import { StorageForm } from "@/app/(tabs)/package";
import { PackageItem } from "@/src/types";

export type CreatePackedItemDTO = {
  product_name: string;
  unit: string;
  image: string | null;
  chambers: { id: string; quantity: number }[];

  rawProducts: {
    product_name: string;
    chambers: { id: string; quantity: number; rating: number }[];
  }[];

  packages: {
    size: number | null;
    unit: string | null;
    stored_quantity: number | null;
    quantity: number;
    rawSize: string | null;
    rawUnit: string | null;
  }[];
};

const getUnitFromPackages = (packages: PackageItem[]): string => {
  if (!packages || packages.length === 0) {
    return "kg";
  }
  return packages[0].unit || "kg";
};

export const mapStorageFormToPackedDTO = (
  form: StorageForm,
  image: string | null = null
): CreatePackedItemDTO => {
  const chambers = (form.packedChambers || [])
    .filter((ch) => Number(ch.quantity) > 0)
    .map((ch) => ({
      id: String(ch.id),
      quantity: Number(ch.quantity),
    }));

  const rawProducts = (form.products || [])
    .map((p) => ({
      product_name: p.name,
      chambers: (p.chambers || [])
        .filter((ch) => Number(ch.quantity) > 0)
        .map((ch) => ({
          id: String(ch.id),
          quantity: Number(ch.quantity),
          rating: Number(ch.rating ?? 0),
        })),
    }))
    .filter((p) => p.chambers.length > 0);

  const packages =
  (form.packages || [])
    .map((pkg) => ({
      size:
        pkg.size === null || pkg.size === undefined
          ? null
          : Number(pkg.size),
      unit: pkg.unit ?? null,
      stored_quantity:
        pkg.stored_quantity === null || pkg.stored_quantity === undefined
          ? null
          : Number(pkg.stored_quantity),
      quantity: Number(pkg.quantity || 0),
      rawSize: pkg.rawSize ?? null,
      rawUnit: pkg.rawUnit ?? null,
    }))
    .filter((p) => p.quantity > 0) || [];

  return {
    product_name: form.product_name,
    unit: getUnitFromPackages(form.packages || []),
    image: form.image ?? image,
    chambers,
    rawProducts,
    packages, 
  };
};