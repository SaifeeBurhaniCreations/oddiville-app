import { PackagingPlanItem, PackagingPlanValidation } from "@/src/types/domain/packing/packing.types";

export function validatePackagingPlanBags(
    plan: PackagingPlanItem[]
): PackagingPlanValidation[] {
    return plan.map((item) => {
        const bagsAssigned = item.storage.reduce(
            (sum, s) => sum + (s.bagsStored ?? 0),
            0
        );

        const isValid = bagsAssigned === item.bagsProduced;

        return {
            skuId: item.skuId,
            skuLabel: item.skuLabel,
            bagsProduced: item.bagsProduced,
            bagsAssigned,
            isValid,
            error: isValid
                ? undefined
                : `Assigned ${bagsAssigned} bags but produced ${item.bagsProduced}`,
        };
    });
}
