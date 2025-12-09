export const rawMaterialOrderBackRoute: Record<"superadmin" | "admin" | "supervisor", string> = {
    "superadmin": "/purchase",
    "admin": "/purchase",
    "supervisor": "/policies/purchase",
};
export const rawMaterialReceiveBackRoute: Record<"superadmin" | "admin" | "supervisor", string> = {
    "superadmin": "/purchase",
    "admin": "/purchase",
    "supervisor": "/policies/purchase",
};
export const productionStartBackRoute: Record<"superadmin" | "admin" | "supervisor", string> = {
    "superadmin": "/production",
    "admin": "/production",
    "supervisor": "/policies/production",
};
export const productionCompletedBackRoute: Record<"superadmin" | "admin" | "supervisor", string> = {
    "superadmin": "/production",
    "admin": "/production",
    "supervisor": "/policies/production",
};
export const truckBackRoute: Record<"superadmin" | "admin" | "supervisor", string> = {
    "superadmin": "/sales",
    "admin": "/sales",
    "supervisor": "/policies/sales",
};
export const chambersBackRoute: Record<"superadmin" | "admin" | "supervisor" | "production", string> = {
    "superadmin": "/home",
    "admin": "/home",
    "supervisor": "/policies/package",
    "production": "/policies/production",
};