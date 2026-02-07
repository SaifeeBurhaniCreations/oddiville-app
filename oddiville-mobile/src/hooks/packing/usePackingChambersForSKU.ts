import { useMemo } from "react";
import { useFrozenChambers } from "@/src/hooks/useChambers";
import { useChamberStockByName } from "@/src/hooks/useChamberStock";
import { PackingPackages } from "@/src/types/domain/packing/packing.types";

export type PackingChamberOption = {
    chamberId: string;
    chamberName: string;
    availableKg: number;
    maxBags: number;
    assignedBags: number;
};

type UsePackingChambersForSKUInput = {
    productName: string;
    sku: PackingPackages;
    packetsPerBag: number;
};

export function usePackingChambersForSKU({
    productName,
    sku,
    packetsPerBag,
}: UsePackingChambersForSKUInput) {
    const { data: frozenChambers, isLoading: chambersLoading } =
        useFrozenChambers();

    const { chamberStock, isFetching: stockLoading } = useChamberStockByName([
        productName,
    ]);

    const data = useMemo<PackingChamberOption[]>(() => {
        if (!frozenChambers || !packetsPerBag || packetsPerBag <= 0) return [];

        const packetWeightKg = sku.unit === "gm" ? sku.size / 1000 : sku.size;
        const bagWeightKg = packetWeightKg * packetsPerBag;
        if (bagWeightKg <= 0) return [];

        return frozenChambers.map((chamber) => {
            const stock = chamberStock?.find((s) => s.product_name === productName);

            const chamberEntry = stock?.chamber?.find(
                (c) => String(c.id) === String(chamber.id),
            );

            const availableKg = Number(chamberEntry?.quantity ?? 0);
            const maxBags = Math.floor(availableKg / bagWeightKg);

            return {
                chamberId: String(chamber.id),
                chamberName: chamber.chamber_name,
                availableKg,
                maxBags,
                assignedBags: 0,
            };
        });
    }, [frozenChambers, chamberStock, sku, packetsPerBag, productName]);

    return {
        data,
        isLoading: chambersLoading || stockLoading,
    };
}
