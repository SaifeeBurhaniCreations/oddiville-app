import { RootStackParamList } from "../types";

type Role = "superadmin" | "admin" | "supervisor" | "manager" | "guest";

export type Policy =
  "purchase-view"
  | "purchase-edit"
  | "production"
  | "package"
  | "sales-view"
  | "sales-edit";

export function resolveAccess(
  role: Role,
  policies: Policy[] | null | undefined
) {
  // 🔓 Full access roles
  if (role === "admin" || role === "superadmin") {
    return {
      isFullAccess: true,

     purchase: { view: true, edit: true },
      production: true,
      package: true,
      sales: { view: true, edit: true },
    };
  }

  // 🔓 No access roles/policies
  if (role === "guest") {
    return {
      isFullAccess: false,
      purchase: { view: false, edit: false },
      production: false,
      package: false,
      sales: { view: false, edit: false },
  };
}

  // 🔐 Policy-based roles
  const set = new Set(policies ?? []);

  return {
    isFullAccess: false,

    purchase: {
      view: set.has("purchase-view"),
      edit: set.has("purchase-edit"),
    },
    production: set.has("production"),
    package: set.has("package"),

    sales: {  
      view: set.has("sales-view"),
      edit: set.has("sales-edit"),
    },
  };
}

export type Access = ReturnType<typeof resolveAccess>;

export function resolveEntryRoute(
  access: Access
): keyof RootStackParamList | null {
  // Admin / Superadmin
  if (access.isFullAccess) {
    return "home";
  }

  // Policy-based users (priority order)
  if (access.purchase.view || access.purchase.edit) {
    return "policies/purchase";
  }

  if (access.production) {
    return "policies/production";
  }

  if (access.package) {
    return "policies/package";
  }

  if (access.sales.view || access.sales.edit) {
    return "policies/sales";
  }

  // No module access
  return null;
}