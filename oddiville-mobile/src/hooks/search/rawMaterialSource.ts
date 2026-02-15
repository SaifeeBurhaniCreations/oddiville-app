import { useMemo } from "react";
import { useRawMaterialOrdersAll } from "@/src/hooks/useRawMaterialOrders";
import { searchRegistry } from "@/src/utils/searchRegistyUtil";
import type { DomainSourceHook } from "@/src/types/search/sources";
import type { RawMaterialOrderProps } from "@/src/types";

function statusLower(v: unknown) {
  return String(v ?? "").toLowerCase();
}
export const useRawMaterialOrderedSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useRawMaterialOrdersAll();

  const activities = useMemo(() => {
    const normalize = searchRegistry["raw-material-ordered"].normalize;
console.log("data", JSON.stringify(data, null, 2));

    return (data ?? [])
      .filter(rm => String(rm.status).toLowerCase() === "pending")
      .map(normalize);
  }, [data]);

  return {
    domain: "raw-material-ordered",
    activities,
    isLoading,
  };
};

export const useRawMaterialReachedSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useRawMaterialOrdersAll();

  const activities = useMemo(() => {
    const normalize = searchRegistry["raw-material-reached"].normalize;

    return (data ?? [])
      .filter(rm => {
        const s = String(rm.status ?? "").toLowerCase();
        return (
          s === "inprogress" ||
          s === "completed" ||
          s === "reached" ||
          s === "arrived" ||
          s === "delivered"
        );
      })
      .map(normalize);
  }, [data]);

  return {
    domain: "raw-material-reached",
    activities,
    isLoading,
  };
};
