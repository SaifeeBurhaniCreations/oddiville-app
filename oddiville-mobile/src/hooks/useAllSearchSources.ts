import { useMemo } from "react";

import {
  useRawMaterialOrderedSource,
  useRawMaterialReachedSource,
} from "./search/rawMaterialSource";
import { useProductionStartSource, useProductionInprogressSource, useProductionCompletedSource } from "./search/productionSource";
import {
  useOrderReachedSource,
  useOrderReadySource,
  useOrderShippedSource,
} from "./search/dispatchOrderSource";
import { useVendorDomainSource } from "./search/vendorSource";
import { useTruckDomainSource } from "./search/truckSource";
import { usePackingEventDomainSource } from "./search/packingEventSource";
import { usePackageInventoryDomainSource } from "./search/packageInventorySource";

import type { SearchActivityProps } from "@/src/types";

export function useAllSearchSources() {
  const rawOrdered = useRawMaterialOrderedSource();
  const rawReached = useRawMaterialReachedSource();
  const productionStart = useProductionStartSource();
  const productionInprogress = useProductionInprogressSource();
  const productionCompleted = useProductionCompletedSource();
  const orderReady = useOrderReadySource();
  const orderShipped = useOrderShippedSource();
  const orderReached = useOrderReachedSource();
  const vendor = useVendorDomainSource();
  const truck = useTruckDomainSource();
  const packing = usePackingEventDomainSource();
  const packages = usePackageInventoryDomainSource();

  const sources = [
    rawOrdered,
    rawReached,
    productionStart,
    productionInprogress,
    productionCompleted,
    orderReady,
    orderShipped,
    orderReached,
    vendor,
    truck,
    packing,
    packages,
  ];

  const activities: SearchActivityProps[] = useMemo(() => {
    return sources.flatMap((s) => s.activities);
  }, [
    rawOrdered.activities,
    rawReached.activities,
    productionStart.activities,
    productionInprogress.activities,
    productionCompleted.activities,
    orderReady.activities,
    orderShipped.activities,
    orderReached.activities,
    vendor.activities,
    truck.activities,
    packing.activities,
    packages.activities,
  ]);

  const isLoading = sources.some((s) => s.isLoading);

  return { activities, isLoading };
}