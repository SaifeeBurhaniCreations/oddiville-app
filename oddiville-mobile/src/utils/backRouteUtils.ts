import { Access } from "@/src/utils/policiesUtils";
import { RootStackParamList } from "@/src/types/navigation";

type BackRouteRule = {
  when: (a: Access) => boolean;
  route: keyof RootStackParamList;
};

export const PURCHASE_BACK_ROUTES: BackRouteRule[] = [
  { when: (a) => a.isFullAccess, route: "purchase" },
  { when: (a) => a.purchase.view || a.purchase.edit, route: "policies/purchase" },
];

export const PRODUCTION_BACK_ROUTES: BackRouteRule[] = [
  { when: (a) => a.isFullAccess, route: "production" },
  { when: (a) => a.production, route: "policies/production" },
];

export const PACKAGE_BACK_ROUTES: BackRouteRule[] = [
  { when: (a) => a.isFullAccess, route: "package" },
  { when: (a) => a.package, route: "policies/package" },
];

export const SALES_BACK_ROUTES: BackRouteRule[] = [
  { when: (a) => a.isFullAccess, route: "sales" },
  { when: (a) => a.sales.view || a.sales.edit, route: "policies/sales" },
];

export const CHAMBERS_BACK_ROUTES: BackRouteRule[] = [
  { when: (a) => a.isFullAccess, route: "home" },

  { when: (a) => a.production, route: "policies/production" },
  { when: (a) => a.package, route: "policies/package" },
  { when: (a) => a.sales.view || a.sales.edit, route: "policies/sales" },
];

export function resolveBackRoute(
  access: Access,
  rules: BackRouteRule[],
  fallback: keyof RootStackParamList
): keyof RootStackParamList {
  for (const rule of rules) {
    if (rule.when(access)) {
      return rule.route;
    }
  }
  return fallback;
}

export function resolveDefaultRoute(
  access: Access
): keyof RootStackParamList {
  if (access.isFullAccess) {
    return "home";
  }

  if (access.purchase.view || access.purchase.edit) return "policies/purchase";
  if (access.production) return "policies/production";
  if (access.package) return "policies/package";
  if (access.sales.view || access.sales.edit) return "policies/sales";

  return "login"; 
}