import { useMemo } from "react";
import { useTrucks } from "@/src/hooks/truck";
import { searchRegistry } from "@/src/utils/searchRegistyUtil";
import type { DomainSourceHook } from "@/src/types/search/sources";

export const useTruckDomainSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useTrucks();

  const activities = useMemo(() => {
    const normalizeTruck = searchRegistry["trucks"].normalize;

    return (data ?? []).map((truck) => normalizeTruck(truck as any));
  }, [data]);

  return {
    domain: "trucks",
    activities,
    isLoading,
  };
};