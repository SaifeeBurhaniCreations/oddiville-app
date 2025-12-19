type Role = "superadmin" | "admin" | "supervisor" | "manager";

export type Policy =
  | "purchase"
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

      purchase: true,
      production: true,
      package: true,

      sales: {
        view: true,
        edit: true,
      },
    };
  }

  // 🔐 Policy-based roles
  const set = new Set(policies ?? []);

  return {
    isFullAccess: false,

    purchase: set.has("purchase"),
    production: set.has("production"),
    package: set.has("package"),

    sales: {
      view: set.has("sales-view"),
      edit: set.has("sales-edit"),
    },
  };
}

export type Access = ReturnType<typeof resolveAccess>;