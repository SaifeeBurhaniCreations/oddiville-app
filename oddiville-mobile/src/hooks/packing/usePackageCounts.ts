import { useMemo } from "react";
import { usePackageByName } from "@/src/hooks/Packages";
import { getSimplifiedMaxPackagesFor } from "@/src/utils/packing/weightutils";
import { PackingPackages } from "@/src/types/domain/packing/packing.types";

type SelectedPackage = {
    size: number;
    unit: "gm" | "kg";
};

export const usePackingPackages = (
    productName: string | null,
    selectedPackages: SelectedPackage[]
) => {
    const { data: pkg, isLoading } = usePackageByName(productName);

    const types = pkg?.types ?? null;

    const data: PackingPackages[] = useMemo(() => {
        if (!types) return [];
// console.log("selectedPackages", JSON.stringify(selectedPackages, null, 2));

        return selectedPackages.map((sel) => {
            const type = types.find(
                (t) => Number(t.size) === sel.size && t.unit === sel.unit
            );

            const count = type
                ? getSimplifiedMaxPackagesFor({
                    size: Number(type.size),
                    unit: sel.unit,
                    storedKg: Number(type.quantity),
                })
                : 0;

            return {
                size: sel.size,
                unit: sel.unit,
                count,
            };
        });
    }, [types, selectedPackages]);

    return { data, isLoading };
};
