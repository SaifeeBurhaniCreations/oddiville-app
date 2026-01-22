import {
    DEFAULT_CONTAINER_SIZE,
    DEFAULT_CONTAINER_TYPE,
} from "@/src/constants/packing";
import { RMChamberSource } from "@/src/types/domain/packing/packing.types";

export const createRMChamberSource = (
    params: Partial<RMChamberSource> & {
        chamberId: string;
        chamberName: string;
    }
): RMChamberSource => ({
    chamberId: params.chamberId,
    chamberName: params.chamberName,

    containerType: params.containerType ?? DEFAULT_CONTAINER_TYPE,

    containerSize: params.containerSize ?? DEFAULT_CONTAINER_SIZE,

    containersUsed: params.containersUsed ?? 0,
    quantityUsedKg: params.quantityUsedKg ?? 0,
});
