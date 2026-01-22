import * as Crypto from "expo-crypto";
import {
    PackingPackages,
    PackageInputsByKey,
    PackagingPlanItem,
} from "@/src/types/domain/packing/packing.types";

export const buildPackagingPlan = (
    packages: PackingPackages[],
    inputs: PackageInputsByKey
): PackagingPlanItem[] => {
    return packages
        .map((pkg) => {
            const key = `${pkg.size}-${pkg.unit}`;
            const input = inputs[key];

            const bagsProduced = input?.bagCount ?? 0;
            const packetsPerBag = input?.packetsPerBag ?? 0;

            if (bagsProduced <= 0 || packetsPerBag <= 0) return null;

            return {
                skuId: key,
                skuLabel: `${pkg.size}${pkg.unit}`,
                packet: {
                    size: pkg.size,
                    unit: pkg.unit,
                    packetsPerBag,
                },
                bagsProduced,
                totalPacketsProduced: bagsProduced * packetsPerBag,
                storage: Object.entries(input?.chambers ?? {}).map(
                    ([chamberId, bagsStored]) => ({
                        chamberId,
                        chamberName: "",
                        bagsStored,
                    })
                ),
            };
        })
        .filter(Boolean) as PackagingPlanItem[];
};