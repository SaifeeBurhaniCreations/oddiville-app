import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useChamber } from './useChambers';
import { useChamberStock } from './useChamberStock';
import { Package, usePackageByName } from './Packages';
import Carrot from '../assets/images/item-icons/Carrot.png';
import { SelectedRawMaterial } from '../components/ui/dispatch-order/CreateFromStorage';

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


// --- Hook ---
export function useProductItems() {
    const selectedRm = useSelector((state: RootState) => state.rawMaterial.selectedRawMaterials as SelectedRawMaterial[]);

    const { data: chamberData = [], isLoading: chamberLoading } = useChamber() as {
        data: Chamber[];
        isLoading: boolean;
    };

    const { data: stockData = [], isLoading: stockLoading } = useChamberStock() as {
        data: StockDataEntry[];
        isLoading: boolean;
    };

    const productItems: ProductItem[] = useMemo(() => {
        if (chamberLoading || stockLoading || !selectedRm?.length) return [];

        const chamberMap = new Map(chamberData.map((c) => [c.id, c]));

        return selectedRm
            .map((rm): ProductItem | null => {
                const stock = stockData.find((s) => s.product_name === rm.name);

                if (!stock || !Array.isArray(stock.chamber)) return null;

                const mergedChambers: Record<string, FormattedChamber> = {};

                stock.chamber.forEach((entry) => {
                    const chamberDetails = chamberMap.get(entry.id);
                    if (!chamberDetails) return;

                    const qty = Number(entry.quantity) || 0;

                    if (mergedChambers[entry.id]) {
                        mergedChambers[entry.id].stored_quantity = `${Number(mergedChambers[entry.id].stored_quantity) + qty}`;
                    } else {
                        mergedChambers[entry.id] = {
                            id: entry.id,
                            name: chamberDetails.chamber_name,
                            stored_quantity: `${qty}`,
                            quantity: '',
                        };
                    }
                });

                return {
                    name: rm.name,
                    price: '',
                    chambers: Object.values(mergedChambers),
                    image: Carrot ?? null,
                };
            })
            .filter((item): item is ProductItem => item !== null);
    }, [selectedRm, stockData, chamberData, chamberLoading, stockLoading]);

    return {
        productItems,
        isLoading: chamberLoading || stockLoading,
    };
}

export function useProductPackage() {
    const { product: selectedProduct } = useSelector((state: RootState) => state.product);
    // console.log("selectedProduct", selectedProduct);
    
    const { data: packageData = { types: [] }, isLoading } = usePackageByName(selectedProduct) as {
        data: PackageData;
        isLoading: boolean;
    };

    const productPackages = useMemo(() => {

        return packageData?.types.map((pkg) => ({
            size: Number(pkg.size),
            stored_quantity: Number(pkg.quantity),
            unit: pkg.unit,
            quantity: '',
        }));
    }, [packageData, selectedProduct]);

    return {
        productPackages,
        isLoading,
    };
}

export function useRawMaterialByProduct(name: string) {
    const packageQuery = usePackageByName(name);
    const data = packageQuery.data as Package | null;
    return data?.raw_materials ?? [];
}