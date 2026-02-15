import { useMemo } from "react";
import { useOrders } from "@/src/hooks/dispatchOrder";
import { searchRegistry } from "@/src/utils/searchRegistyUtil";
import type { DomainSourceHook } from "@/src/types/search/sources";

export const useOrderReadySource: DomainSourceHook = () => {
  const { data = [], isLoading } = useOrders();

  const normalize = searchRegistry["order-ready"].normalize;

  const activities = useMemo(
    () =>
      (data ?? [])
        .filter(o => String(o.status).toLowerCase() === "pending")
        .map(normalize),
    [data]
  );

  return { domain: "order-ready", activities, isLoading };
};

export const useOrderShippedSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useOrders();

  const normalize = searchRegistry["order-shipped"].normalize;

  const activities = useMemo(
    () =>
      (data ?? [])
        .filter(o => {
          const s = String(o.status).toLowerCase();
          return s === "inprogress" || s === "in-progress" || s === "dispatched";
        })
        .map(normalize),
    [data]
  );

  return { domain: "order-shipped", activities, isLoading };
};

export const useOrderReachedSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useOrders();

  const normalize = searchRegistry["order-reached"].normalize;

  const activities = useMemo(
    () =>
      (data ?? [])
        .filter(o => {
          const s = String(o.status).toLowerCase();
          return s === "completed" || s === "done";
        })
        .map(normalize),
    [data]
  );

  return { domain: "order-reached", activities, isLoading };
};