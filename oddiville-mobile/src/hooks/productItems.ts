import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useChamber } from './useChambers';
import { ChamberStock, ChamberStockPage, useChamberStock } from './useChamberStock';
import { usePackageByName } from './Packages';
import Carrot from '../assets/images/item-icons/Carrot.png';
import { InfiniteData } from '@tanstack/query-core';

// --- Interfaces ---

interface Chamber {
    id: string;
    chamber_name: string;
}

interface StockChamberEntry {
    id: string;
    quantity: number | string;
}

interface StockDataEntry {
    product_name: string;
    chamber: StockChamberEntry[];
}

interface PackageType {
    size: string | number;
    quantity: string | number;
    unit: string;
}

interface PackageData {
    product_name: string;
    types: PackageType[];
}

// --- Return Types ---
interface FormattedChamber {
    id: string;
    name: string;
    stored_quantity: string;
    quantity: string;
}

interface FormattedPackage {
    size: number;
    stored_quantity: number;
    unit: string;
    quantity: string;
}

interface ProductItem {
    name: string;
    price: string;
    chambers: FormattedChamber[];
    image: any;
}

export function useFlattenedChamberStock(
  data?: InfiniteData<ChamberStockPage>
): ChamberStock[] {
  return useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);
}


// --- Hook ---

export function useProductItems() {
  const selectedRm = useSelector(
    (state: RootState) => state.product.rawMaterials
  );

  const {
    data: chamberData = [],
    isLoading: chamberLoading,
    isFetching: chamberFetching,
    refetch: chamberRefetch,
  } = useChamber();

  const {
    data: stockQueryData,
    isLoading: stockLoading,
    isFetching: stockFetching,
    refetch: stockRefetch,
  } = useChamberStock();

const stockData = stockQueryData ?? [];

  const productItems = useMemo(() => {
    if (chamberLoading || stockLoading || !selectedRm?.length) return [];

    const chamberMap = new Map(chamberData.map((c) => [c.id, c]));

    return selectedRm
      .map((rm) => {
        const stock = stockData.find(
          (s) => s.product_name === rm
        );

        if (!stock) {
          console.warn("⚠️ Missing stock for raw material:", rm);
          return null;
        }

        if (!Array.isArray(stock.chamber)) return null;

        const mergedChambers: Record<string, any> = {};

        stock.chamber.forEach((entry) => {
          const chamberDetails = chamberMap.get(entry.id);
          if (!chamberDetails) return;

          const qty = Number(entry.quantity) || 0;

          if (mergedChambers[entry.id]) {
            mergedChambers[entry.id].stored_quantity =
              String(
                Number(mergedChambers[entry.id].stored_quantity) + qty
              );
          } else {
            mergedChambers[entry.id] = {
              id: entry.id,
              name: chamberDetails.chamber_name,
              stored_quantity: String(qty),
              quantity: "",
            };
          }
        });

        return {
          name: rm,
          price: "",
          chambers: Object.values(mergedChambers),
          image: Carrot,
        };
      })
      .filter(Boolean);
  }, [
    selectedRm,
    stockData,
    chamberData,
    chamberLoading,
    stockLoading,
  ]);

  return {
    productItems,
    isLoading: chamberLoading || stockLoading,
    isFetching: chamberFetching || stockFetching,
    refetch: () => {
      chamberRefetch();
      stockRefetch();
    },
  };
}

type Unit = "gm" | "kg";

function normalizeUnit(raw: string | null | undefined): Unit | null {
  if (!raw) return null;
  const u = String(raw).toLowerCase().replace(/\.$/, "");
  if (["g", "gm", "gram", "grams", "gms"].includes(u)) return "gm";
  if (["kg", "kgs", "kilogram", "kilograms"].includes(u)) return "kg";
  return null;
}

function extractFirstNumber(s: string | number | null | undefined): number | null {
  if (s === null || s === undefined) return null;
  const str = String(s).trim();
  if (!str) return null;

  if (/\bNaN\b/i.test(str)) return null;

  const m = str.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : null;
}

function extractUnitFromString(s: string | null | undefined): Unit | null {
  if (!s) return null;
  const m = String(s).match(/\b(kgs?|kilograms?|gms?|grams?|gm|g)\b/i);
  return normalizeUnit(m?.[0] ?? null);
}

type ProductPackageItem = {
  size: number | null;
  unit: Unit | null;
  stored_quantity: number | null;
  quantity: string;     
  rawSize?: string;     
  rawUnit?: string | null;
};

export function useProductPackage() {
  const { product: selectedProduct } = useSelector((state: RootState) => state.product);

  const { data: packageData = { types: [] }, isLoading, refetch, isFetching } = usePackageByName(selectedProduct) as {
    data: PackageData;
    isLoading: boolean;
    isFetching: boolean;
    refetch: () => void;
  };

  const productPackages: ProductPackageItem[] = useMemo(() => {
    return (packageData?.types || []).map((pkg) => {
      const rawSizeStr = pkg.size === undefined || pkg.size === null ? "" : String(pkg.size);

      let size = typeof pkg.size === "number" ? pkg.size : extractFirstNumber(pkg.size);

      const unitFromPkgField = normalizeUnit(pkg.unit);
const unitFromSizeString = extractUnitFromString(
  pkg.size != null ? String(pkg.size) : undefined
);

      const unit = unitFromPkgField ?? unitFromSizeString ?? null;

      const stored_quantity = (() => {
        const q = Number(pkg.quantity);
        return Number.isFinite(q) ? q : null;
      })();

      return {
        size: size === null ? null : size,
        unit,
        stored_quantity,
        quantity: "",
        rawSize: rawSizeStr,
        rawUnit: pkg.unit ?? null,
      };
    });
  }, [packageData, selectedProduct]);

  return { productPackages, isLoading, isFetching, refetch };
}


export function useRawMaterialByProduct(name: string | null) {
  const {
    data,
    refetch,
    isFetching,
    isLoading,
  } = usePackageByName(name);

  return {
    rawMaterials: data?.raw_materials ?? [],
    refetch,
    isFetching,
    isLoading,
  };
}