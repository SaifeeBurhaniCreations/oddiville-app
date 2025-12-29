import type { RawMaterialOrderProps, SearchActivityProps } from "@/src/types";
import { format } from "date-fns";
import { Vendor } from "../hooks/vendor";
import { Production } from "../hooks/production";
import { TruckDetailsProps } from "../hooks/truck";
import { DispatchOrderData } from "../hooks/dispatchOrder";

export const RAW_MATERIAL_ALL_KEY = ["raw-material-orders", "all"] as const;

export const VENDOR_ALL_KEY = ["vendors"] as const;
export const PRODUCTION_ALL_KEY = ["production"] as const;
export const TRUCKS_ALL_KEY = ["Trucks"] as const;
export const DISPATCH_ORDER_ALL_KEY = ["dispatchOrders"] as const;

export function normalizeRawMaterialOrderToSearchActivity(rm: RawMaterialOrderProps): SearchActivityProps {
  return {
    id: `raw-ord-${rm.id}`, // optional use for notification
    itemId: rm.id,
    title: rm.raw_material_name ?? "Raw material order",
    read: true,
    extraData: undefined,
    type: "RAW MATERIAL ORDERED",
    badgeText: rm.status ?? null,
    createdAt: rm.createdAt ? new Date(rm.createdAt) : new Date(),
    extra_details: [String(rm.quantity_ordered), rm.est_arrival_date
      ? format(new Date(rm.est_arrival_date), "MMM d, yyyy")
      : "--", String(rm.vendor ?? "")],
    identifier: "raw-material-ordered",
  };
}

export function normalizeRawMaterialReachToSearchActivity(rm: RawMaterialOrderProps): SearchActivityProps {
  return {
    id: `raw-rch-${rm.id}`, // optional use for notification
    itemId: rm.id,
    title: rm.raw_material_name ?? "Raw material reach",
    read: true,
    extraData: undefined,
    type: "RAW MATERIAL REACHED",
    badgeText: rm.status ?? null,
    createdAt: rm.createdAt ? new Date(rm.createdAt) : new Date(),
    extra_details: [String(rm.quantity_ordered), rm.est_arrival_date
      ? format(new Date(rm.est_arrival_date), "MMM d, yyyy")
      : "--", String(rm.vendor ?? "")],
    identifier: "raw-material-reached",
  };
}

export function normalizeVendorToSearchActivity(vendor: Vendor): SearchActivityProps {
  return {
    id: `vendor-${vendor.id}`, // optional use for notification
    itemId: vendor.id,
    title: vendor.name ?? "Vendor",
    read: true,
    extraData: undefined,
    type: "VENDOR",
    badgeText: vendor.alias ?? null,
    createdAt: new Date(),
    extra_details: [String(vendor.phone), vendor.city, vendor.materials.join(",")],
    identifier: "raw-material-reached",
  };
}

export function normalizeProductionStartToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-start-${production.id}`, // optional use for notification
    itemId: production.id,
    title: production.product_name ?? "Production Start",
    read: true,
    extraData: undefined,
    type: "PRODUCTION START",
    badgeText: production.status ?? null,
    createdAt: new Date(),
    extra_details: [
      String(production.quantity ?? ""),
      production.start_time ? format(new Date(production.start_time), "MMM d, yyyy") : "--",
      production.end_time ? format(new Date(production.end_time), "MMM d, yyyy") : "--",
    ],

    identifier: "production-start",
  };
}

export function normalizeProductionCompleteToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-complete-${production.id}`, // optional use for notification
    itemId: production.id,
    title: production.product_name ?? "Production Completed",
    read: true,
    extraData: undefined,
    type: "PRODUCTION COMPLETED",
    badgeText: production.status ?? null,
    createdAt: new Date(),
    extra_details: [
      String(production.quantity ?? ""),
      production.start_time ? format(new Date(production.start_time), "MMM d, yyyy") : "--",
      production.end_time ? format(new Date(production.end_time), "MMM d, yyyy") : "--",
    ],

    identifier: "production-completed",
  };
}

export function normalizeProductionInprogressToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-inprogress-${production.id}`, // optional use for notification
    itemId: production.id,
    title: production.product_name ?? "Production Inprogress",
    read: true,
    extraData: undefined,
    type: "PRODUCTION INPROGRESS",
    badgeText: production.status ?? null,
    createdAt: new Date(),
    extra_details: [
      String(production.quantity ?? ""),
      production.start_time ? format(new Date(production.start_time), "MMM d, yyyy") : "--",
      production.end_time ? format(new Date(production.end_time), "MMM d, yyyy") : "--",
    ],

    identifier: "production-completed",
  };
}

export function normalizeTrucksToSearchActivity(truck: TruckDetailsProps): SearchActivityProps {
  return {
    id: `trucks-${truck.id}`, // optional use for notification
    itemId: truck.id,
    title: truck.agency_name ?? "Trucks",
    read: true,
    extraData: undefined,
    type: "TRUCKS",
    badgeText: truck.type ?? null,
    createdAt: new Date(),
    extra_details: [
      truck.driver_name,
      String(truck.phone ?? ""), String(truck.status ?? "--")
    ],
    identifier: "production-completed",
  };
}

export function normalizeDispatchOrderReadyToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {
  return {
    id: `dispatch-order-ready-${disOrder.id}`, // optional use for notification
    itemId: disOrder.id,
    title:
      "Order Ready",
    read: true,
    extraData: undefined,
    type: "ORDER READY",
    badgeText: disOrder.status ?? null,
    createdAt: disOrder.createdAt ? new Date(disOrder.createdAt) : new Date(),
    extra_details: [String(disOrder.customer_name ?? ""),
    String(`${disOrder.amount} Rs`),
    disOrder.est_delivered_date
      ? format(new Date(disOrder.est_delivered_date), "MMM d, yyyy")
      : "--"
    ],
    identifier: "order-ready",
  };
}

export function normalizeDispatchOrderShippedToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {

  return {
    id: `dispatch-order-shipped-${disOrder.id}`, // optional use for notification
    itemId: disOrder.id,
    title:
      "Order Shipped",
    read: true,
    extraData: undefined,
    type: "ORDER SHIPPED",
    badgeText: disOrder.status ?? null,
    createdAt: disOrder.createdAt ? new Date(disOrder.createdAt) : new Date(),
    extra_details: [String(disOrder.customer_name ?? ""),
    String(`${disOrder.amount} Rs`),
    disOrder.dispatch_date
      ? format(new Date(disOrder.dispatch_date), "MMM d, yyyy")
      : "--"
    ],
    identifier: "order-shipped",
  };
}

export function normalizeDispatchOrderReachedToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {
  
  return {
    id: `dispatch-order-reached-${disOrder.id}`, // optional use for notification
    itemId: disOrder.id,
    title:
      "Order Reached",
    read: true,
    extraData: undefined,
    type: "ORDER REACHED",
    badgeText: disOrder.status ?? null,
    createdAt: disOrder.createdAt ? new Date(disOrder.createdAt) : new Date(),
    extra_details: [disOrder.customer_name,
    String(`${disOrder.amount} Rs`),
    disOrder.delivered_date
      ? format(new Date(disOrder.delivered_date), "MMM d, yyyy")
      : "--"
    ],
    identifier: "order-reached",
  };
}

export const searchRegistry = {
  "raw-material-ordered": {
    normalize: normalizeRawMaterialOrderToSearchActivity,
    queryKey: RAW_MATERIAL_ALL_KEY,
  },
  "raw-material-reached": {
    normalize: normalizeRawMaterialReachToSearchActivity,
    queryKey: RAW_MATERIAL_ALL_KEY,
  },
  "vendor": {
    normalize: normalizeVendorToSearchActivity,
    queryKey: VENDOR_ALL_KEY,
  },
  "production-start": {
    normalize: normalizeProductionStartToSearchActivity,
    queryKey: PRODUCTION_ALL_KEY,
  },
  "production-completed": {
    normalize: normalizeProductionCompleteToSearchActivity,
    queryKey: PRODUCTION_ALL_KEY,
  },
  "production-inprogress": {
    normalize: normalizeProductionInprogressToSearchActivity,
    queryKey: PRODUCTION_ALL_KEY,
  },
  "trucks": {
    normalize: normalizeTrucksToSearchActivity,
    queryKey: TRUCKS_ALL_KEY,
  },
  "order-ready": {
    normalize: normalizeDispatchOrderReadyToSearchActivity,
    queryKey: DISPATCH_ORDER_ALL_KEY,
  },
  "order-shipped": {
    normalize: normalizeDispatchOrderShippedToSearchActivity,
    queryKey: DISPATCH_ORDER_ALL_KEY,
  },
  "order-reached": {
    normalize: normalizeDispatchOrderReachedToSearchActivity,
    queryKey: DISPATCH_ORDER_ALL_KEY,
  },
} as const;

export type SearchRegistryKey = keyof typeof searchRegistry;
