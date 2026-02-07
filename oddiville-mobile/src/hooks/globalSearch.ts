import { useMemo } from "react";
import { useRawMaterialOrdersAll } from "./useRawMaterialOrders";
import { useVendors } from "./vendor";
import { Production, useProduction } from "./production";
import { useTrucks } from "./truck";
import { searchRegistry, SearchRegistryKey } from "@/src/utils/searchRegistyUtil";
import type { SearchActivityProps, RawMaterialOrderProps, DispatchOrder } from "@/src/types";
import type { TruckDetailsProps } from "./truck";
import type { Vendor } from "@/src/hooks/vendor";
import { useOrders } from "./dispatchOrder";

export type SeparatorItem = {
  kind: "separator";
  id: string;
  title: string;
  key: SearchRegistryKey;
};

export type ActivityItem = {
  kind: "activity";
  activity: SearchActivityProps;
  key: SearchRegistryKey;
};

export type SearchActivityItem = SeparatorItem | ActivityItem;

function statusMatches(
  statusRaw: string | undefined,
  want: "pending" | "inprogress" | "completed"
) {
  if (!statusRaw) return false;
  const s = String(statusRaw).toLowerCase();
  if (want === "pending") return s === "pending";
  if (want === "inprogress")
    return s === "inprogress" || s === "in_progress" || s === "in-progress";
  if (want === "completed") return s === "completed" || s === "done";
  return false;
}

export function useGlobalSearch(
  keys: SearchRegistryKey[] = ["raw-material-ordered"],
  searchText?: string
) {
  const { data: rawOrdersData = [], isLoading: rawLoading } = useRawMaterialOrdersAll();
  const { _vendors: vendorList = [], isLoading: vendorsLoading } = useVendors("");
  const { data: productionData = [], isLoading: productionLoading } = useProduction();
  const { data: truckData = [], isLoading: trucksLoading } = useTrucks();
  const { data: ordersData = [], isLoading: ordersLoading } = useOrders();

  const rawOrders: RawMaterialOrderProps[] = rawOrdersData ?? [];
  const productions = Array.isArray(productionData) ? productionData : (productionData?.items ?? []);
  const trucks: TruckDetailsProps[] = truckData ?? [];
  const vendors: any = vendorList ?? [];
  const orders: DispatchOrder[] = ordersData ?? [];

  const s = (searchText ?? "").trim().toLowerCase();

  const matchesSearch = (activity: SearchActivityProps): boolean => {
    if (!s) return true;
    const hay = [
      activity.title,
      activity.badgeText ?? "",
      String(activity.itemId ?? ""),
      ...(activity.extra_details ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(s);
  };

  const itemsForKey = (key: SearchRegistryKey): SearchActivityProps[] => {
    const entry = searchRegistry[key] as any;
    if (!entry) return [];

    // RAW ORDERS keys
    if (key === "raw-material-ordered" || key === "raw-material-reached") {
      const normalizeRaw = entry.normalize as (rm: RawMaterialOrderProps) => SearchActivityProps;
      let filtered: RawMaterialOrderProps[] = rawOrders;
      if (key === "raw-material-ordered") {
        filtered = rawOrders.filter((r) => statusMatches(r.status, "pending"));
      } else {
        filtered = rawOrders.filter(
          (r) =>
            statusMatches(r.status, "inprogress") ||
            statusMatches(r.status, "completed") ||
            ["reached", "arrived", "delivered"].includes(String(r.status ?? "").toLowerCase())
        );
      }
      const normalized = filtered.map((r) => normalizeRaw(r));
      return s ? normalized.filter(matchesSearch) : normalized;
    }

    // VENDOR
    if (key === "vendor") {
      const normalizeVendor = entry.normalize as (v: Vendor) => SearchActivityProps;
      const normalized = (vendors ?? []).map((v: Vendor) => normalizeVendor(v));
      return s ? normalized.filter(matchesSearch) : normalized;
    }

    // PRODUCTION keys
    if (key === "production-start" || key === "production-inprogress" || key === "production-completed") {
      const normalizeProd = entry.normalize as (p: any) => SearchActivityProps;
      let arr: any[] = productions ?? [];
      if (key === "production-start") {
        arr = arr.filter((p: Production) => statusMatches(p.status, "pending"));
      } else if (key === "production-inprogress") {
        arr = arr.filter((p: Production) => statusMatches(p.status, "inprogress"));
      } else {
        arr = arr.filter((p: Production) => statusMatches(p.status, "completed"));
      }
      const normalized = arr.map((p: Production) => normalizeProd(p));
      return s ? normalized.filter(matchesSearch) : normalized;
    }

    // TRUCKS
    if (key === "trucks") {
      const normalizeTruck = (entry.normalize as unknown as (t: TruckDetailsProps) => SearchActivityProps);
      const normalized = (trucks ?? []).map((t) => normalizeTruck(t));
      return s ? normalized.filter(matchesSearch) : normalized;
    }

    if (key === "order-ready" || key === "order-shipped" || key === "order-reached") {
      const normalizeOrder = entry.normalize as (o: DispatchOrder) => SearchActivityProps;
      let filtered = orders;

      if (key === "order-ready") {
        filtered = orders.filter((o) => {
          const s = String(o.status ?? "").toLowerCase();
          return s === "pending";
        });
      } else if (key === "order-shipped") {
        filtered = orders.filter((o) => {
          const s = String(o.status ?? "").toLowerCase();
          return s === "inprogress" || s === "in-progress" || s === "dispatched";
        });
      } else {
        filtered = orders.filter((o) => {
          const s = String(o.status ?? "").toLowerCase();
          return s === "completed" || s === "done";
        });
      }

      const normalized = filtered.map((o) => normalizeOrder(o));
      return s ? normalized.filter(matchesSearch) : normalized;
    }

    const normalizeAny = entry.normalize as (x: any) => SearchActivityProps;
    const normalized = (rawOrders ?? []).map((r) => normalizeAny(r));
    return s ? normalized.filter(matchesSearch) : normalized;
  };

  const items = useMemo<SearchActivityItem[]>(() => {
    const out: SearchActivityItem[] = [];

    const keysToUse =
      !keys || keys.length === 0
        ? (Object.keys(searchRegistry) as SearchRegistryKey[])
        : keys;

    if (keysToUse.length === 1) {
      const onlyKey = keysToUse[0];
      const arr = itemsForKey(onlyKey);
      return arr.map((a) => ({ kind: "activity", activity: a, key: onlyKey }));
    }

    for (const key of keysToUse) {
      const title = (() => {
        switch (key) {
          case "raw-material-ordered": return "Raw material ordered";
          case "raw-material-reached": return "Raw material reached";
          case "vendor": return "Vendors";
          case "production-start": return "Production — Start";
          case "production-inprogress": return "Production — In progress";
          case "production-completed": return "Production — Completed";
          case "trucks": return "Trucks";
          default: return String(key);
        }
      })();

      const block = itemsForKey(key);

      if (block && block.length > 0) {
        out.push({ kind: "separator", id: `sep-${key}`, title, key });
        out.push(...block.map((a) => ({ kind: "activity" as const, activity: a, key })));
      }
    }

    return out;
  }, [keys, rawOrders, vendors, productions, trucks, s]);

  const activities = useMemo<SearchActivityProps[]>(() => {
    return items.filter((it): it is ActivityItem => it.kind === "activity").map((it) => it.activity);
  }, [items]);

  return {
    items,
    activities,
    count: items.length,
    isLoading: rawLoading || vendorsLoading || productionLoading || trucksLoading || ordersLoading,
  };
}