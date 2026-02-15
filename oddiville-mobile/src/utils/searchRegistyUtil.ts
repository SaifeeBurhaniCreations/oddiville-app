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
export const PACKING_EVENT_ALL_KEY = ["packing-events"] as const;

export function normalizeRawMaterialOrderToSearchActivity(rm: RawMaterialOrderProps): SearchActivityProps {
  return {
    id: `raw-ord-${rm.id}`,
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
    domain: "raw-material-ordered",
    action: {
      type: "bottomSheet",
      key: "raw-material-ordered",
    }
  };
}

export function normalizeRawMaterialReachToSearchActivity(rm: RawMaterialOrderProps): SearchActivityProps {
  return {
    id: `raw-rch-${rm.id}`,
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
    domain: "raw-material-reached",
    action: {
      type: "bottomSheet",
      key: "raw-material-reached",
    }
  };
}

export function normalizeVendorToSearchActivity(vendor: Vendor): SearchActivityProps {
  return {
    id: `vendor-${vendor.id}`,
    itemId: vendor.id,
    title: vendor.name ?? "Vendor",
    read: true,
    extraData: undefined,
    type: "VENDOR",
    badgeText: vendor.alias ?? null,
    createdAt: new Date(),
    extra_details: [String(vendor.phone), vendor.city, vendor.materials.join(",")],
    domain: "vendor",
    action: {
      type: "navigate",
      screen: "vendors",
    }
  };
}

export function normalizeProductionStartToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-start-${production.id}`,
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

    domain: "production-start",
    action: {
      type: "bottomSheet",
      key: "production-start",
    }
  };
}

export function normalizeProductionCompleteToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-complete-${production.id}`,
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

    domain: "production-completed",
    action: {
      type: "bottomSheet",
      key: "production-completed",
    }
  };
}

export function normalizeProductionInprogressToSearchActivity(production: Production): SearchActivityProps {
  return {
    id: `production-inprogress-${production.id}`,
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

    domain: "production-start",
    action: {
      type: "bottomSheet",
      key: "production-start",
    }
  };
}

export function normalizeTrucksToSearchActivity(truck: TruckDetailsProps): SearchActivityProps {
  return {
    id: `trucks-${truck.id}`,
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
    domain: "trucks",
    action: { type: "none" }
  };
}

export function normalizeDispatchOrderReadyToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {
  return {
    id: `dispatch-order-ready-${disOrder.id}`,
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
    domain: "order-ready",
    action: {
      type: "bottomSheet",
      key: "order-ready",
    }
  };
}

export function normalizeDispatchOrderShippedToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {

  return {
    id: `dispatch-order-shipped-${disOrder.id}`,
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
    domain: "order-shipped",
    action: {
      type: "bottomSheet",
      key: "order-shipped",
    }
  };
}

export function normalizeDispatchOrderReachedToSearchActivity(disOrder: DispatchOrderData): SearchActivityProps {

  return {
    id: `dispatch-order-reached-${disOrder.id}`,
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
    domain: "order-reached",
    action: {
      type: "bottomSheet",
      key: "order-reached",
    }
  };
}

export function normalizePackingEventToSearchActivity(event: any): SearchActivityProps {
  return {
    id: `packing-${event.id}`,
    itemId: event.id,
    title: event.product_name ?? "Packing",
    read: true,
    extraData: undefined,
    type: "PACKING COMPLETED",
    badgeText: `${event.bagsProduced ?? 0} bags`,
    createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
    extra_details: [
      String(event.skuLabel ?? ""),
      `${event.totalPacketsProduced ?? 0} packets`,
      `rating ${event.rating ?? 5}`,
    ],
    domain: "packing-event",
    action: {
      type: "navigate",
      screen: "package",
    }
  };
}

export function normalizePackage(pkg: any): SearchActivityProps {
  const totalQty =
    pkg.types?.reduce(
      (sum: number, t: any) => sum + Number(t.quantity || 0),
      0
    ) ?? 0;

  return {
    id: `package-${pkg.id}`,
    itemId: pkg.id,
    title: pkg.product_name ?? "Package",
    read: true,
    extraData: undefined,
    type: "PACKAGE STOCK",
    badgeText: `${totalQty} available`,
    createdAt: new Date(),

    extra_details: (pkg.types ?? []).map(
      (t: any) => `${t.size}${t.unit ?? ""} (${t.quantity})`
    ),

    domain: "package-inventory",
    action: {
      type: "navigate",
      screen: "package",
    }
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
  "packing-event": {
    normalize: normalizePackingEventToSearchActivity,
    queryKey: PACKING_EVENT_ALL_KEY,
  },
  "package-inventory": {
    normalize: normalizePackage,
    queryKey: ["packages"],
  },
} as const;

export type SearchRegistryKey = keyof typeof searchRegistry;
