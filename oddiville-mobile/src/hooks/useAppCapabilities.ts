import { useAuth } from "@/src/context/AuthContext";
import { resolveAccess } from "@/src/utils/policiesUtils";
export type Permission = {
  view: boolean;
  edit: boolean;
  valueOf(): boolean;
};

export const makePermission = (view: boolean, edit: boolean): Permission => ({
  view,
  edit,
  valueOf() {
    return view;
  },
});

export const useAppCapabilities = () => {
  const { role, policies } = useAuth();
  const access = resolveAccess(role ?? "guest", policies ?? []);

  const purchase = makePermission(access.purchase.view, access.purchase.edit);
  const production = makePermission(access.production, access.production);
  const sales = makePermission(access.sales.view, access.sales.edit);
  const pkg = makePermission(access.package, access.package);
  const trucks = makePermission(access.trucks, access.trucks);
  const labours = makePermission(access.labours, access.labours);

  const modules = {
    purchase: purchase.valueOf(),
    production: production.valueOf(),
    sales: sales.valueOf(),
    package: pkg.valueOf(),
    trucks: trucks.valueOf(),
    labours: labours.valueOf(),
  };

  const activeModules = Object.entries(modules)
    .filter(([_, allowed]) => allowed)
    .map(([name]) => name);

  const moduleCount = activeModules.length;

  return {
    access,

    purchase,
    production,
    sales,
    package: pkg,
    trucks,
    labours,

    moduleCount,
    primaryModule: moduleCount === 1 ? activeModules[0] : null,

    isSingleOperator: moduleCount === 1,
    isMultiModuleUser: moduleCount > 1,
    isNoModuleUser: moduleCount === 0,

    isAdmin: access.isFullAccess,
  };
};

export type AppCapabilities = ReturnType<typeof useAppCapabilities>;