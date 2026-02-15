import { RootStackParamList } from "../types";

type Role = "superadmin" | "admin" | "supervisor" | "manager" | "guest";

export type Policy =
  "purchase-view"
  | "purchase-edit"
  | "production"
  | "package"
  | "sales-view"
  | "sales-edit"
  | "trucks"
  | "labours";

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
      trucks: true,
      labours: true,
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
      trucks: false,
      labours: false,
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
    trucks: set.has("trucks"),
    labours: set.has("labours"),
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

  if (access.trucks) {
    return "trucks";
  }

  if (access.labours) {
    return "labours";
  }

  // No module access
  return null;
}

type ModulePermission = { view: boolean; edit: boolean };

const hasPerm = (perm: boolean | ModulePermission | undefined): perm is ModulePermission => {
  return typeof perm === "object" && perm !== null;
};


export const isSingleModuleUser = (access: Access, module: keyof Access) => {
  const keys = Object.keys(access) as (keyof Access)[];

  return keys.every((key) => {
    if (key === module) return true;

    const perm = access[key];

    if (!hasPerm(perm)) return true; 

    return !(perm.view || perm.edit);
  });
};

export const canView = (perm?: boolean | ModulePermission) =>
  typeof perm === "object" && !!(perm.view || perm.edit);

export const canEdit = (perm?: boolean | ModulePermission) =>
  typeof perm === "object" && !!perm.edit;

export const isSingleModuleUserSafe = (
  access: Access | undefined,
  module: keyof Access
) => {
  if (!access) return false;
  return isSingleModuleUser(access, module);
};