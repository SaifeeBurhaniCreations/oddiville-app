import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/src/redux/store";
import { DEFAULT_CONTAINER_SIZE } from "@/src/constants/packing";
import { createRMChamberSource } from "@/src/utils/packing/factories";

import { Chamber, useFrozenChambers } from "@/src/hooks/useChambers";
import { ChamberStock } from "@/src/hooks/useChamberStock";
import { RMChamberSource } from "@/src/types/domain/packing/packing.types";

/* Types */
type ChamberContainerInputMap = Record<string, Record<string, number>>;

export function useRawMaterialConsumption(rmUsed: ChamberStock[]) {
    const dispatch = useDispatch();

    const ratingByRM = useSelector(
        (state: RootState) => state.StorageRMRating.ratingByRM
    );

    const { data: frozenChambers, isLoading } = useFrozenChambers();

    const [editingRM, setEditingRM] = useState<string | null>(null);
    const [containerInputByChamber, setContainerInputByChamber] =
        useState<ChamberContainerInputMap>({});
    const [packetsPerBagPerRM, setPacketsPerBagPerRM] = useState<
        Record<string, number>
    >({});

    /* Maps */

    const chamberById = useMemo(() => {
        const map = new Map<string, Chamber>();
        frozenChambers?.forEach((ch) => map.set(String(ch.id), ch));
        return map;
    }, [frozenChambers]);

    const chamberIdsByRM = useMemo(() => {
        const map = new Map<string, Set<string>>();

        rmUsed.forEach((rm) => {
            const ids = new Set(rm.chamber.map((ch) => String(ch.id)));
            map.set(rm.product_name, ids);
        });

        return map;
    }, [rmUsed]);

    useEffect(() => {
        setPacketsPerBagPerRM((prev) => {
            let changed = false;
            const next = { ...prev };

            rmUsed.forEach((rm) => {
                if (next[rm.product_name] == null) {
                    next[rm.product_name] = DEFAULT_CONTAINER_SIZE.value;
                    changed = true;
                }
            });

            return changed ? next : prev;
        });
    }, [rmUsed]);

    /* Rm comsumption */
 const rmConsumption = useMemo(() => {
  return rmUsed.map((rm) => {
    const chamberIds =
      chamberIdsByRM.get(rm.product_name) ?? new Set<string>();

    const rmInputs = containerInputByChamber[rm.product_name] || {};

    const rmPackaging =
      rm.packaging && !Array.isArray(rm.packaging)
        ? rm.packaging
        : null;

    if (!rmPackaging) return null;

    const sourceChambers: RMChamberSource[] = Object.entries(rmInputs)
      .map(([chamberId, containersUsed]) => {
        if (!chamberIds.has(chamberId)) return null;

        const chamber = chamberById.get(chamberId);
        if (!chamber) return null;

        const quantityUsedKg =
          rmPackaging.size.unit === "kg"
            ? containersUsed * rmPackaging.size.value
            : rmPackaging.size.unit === "gm"
              ? (containersUsed * rmPackaging.size.value) / 1000
              : 0;


        return createRMChamberSource({
          chamberId,
          chamberName: chamber.chamber_name,
          containersUsed,
          containerSize: {
            value: rmPackaging.size.value,
            unit: "unit" as const,
          },
          quantityUsedKg,
        });
      })
      .filter(Boolean) as RMChamberSource[];

    return {
      rmId: rm.id,
      rmName: rm.product_name,
      rating: ratingByRM[rm.product_name]?.rating ?? 5,
      sourceChambers,
    };
  })
    .filter(Boolean);
}, [
  rmUsed,
  containerInputByChamber,
  chamberById,
  chamberIdsByRM,
  ratingByRM,
]);

    /* Handlers */

const setChamberInput = useCallback(
  (rmName: string, chamberId: string, value: number) => {
    setContainerInputByChamber((prev) => ({
      ...prev,
      [rmName]: {
        ...(prev[rmName] || {}),
        [chamberId]: value,
      },
    }));
  },
  []
);

    return {
      isLoading,
      editingRM,
      setEditingRM,
      packetsPerBagPerRM,
      setPacketsPerBagPerRM,
      containerInputByChamber,
      setChamberInput,
      rmConsumption,
    };
}

export type RawMaterialConsumptionSetter = ReturnType<typeof useRawMaterialConsumption>;