import { useMemo } from "react";
import { usePackages } from "@/src/hooks/Packages";
import type { DomainSourceHook } from "@/src/types/search/sources";
import type { SearchActivityProps } from "@/src/types";

function normalizePackage(pkg: any): SearchActivityProps {
  const totalQty =
    pkg.types?.reduce(
      (sum: number, t: any) => sum + Number(t.quantity || 0),
      0
    ) ?? 0;

  return {
    id: `package-${pkg.id}`,
    itemId: pkg.id,
    title: pkg.product_name,
    type: "PACKAGE STOCK",
    badgeText: `${totalQty} available`,
    read: true,
    createdAt: new Date(),
    extra_details: (pkg.types ?? []).map(
      (t: any) => `${t.size}${t.unit ?? ""} (${t.quantity})`
    ),
    domain: "package-inventory",
    action: { type: "navigate", screen: "package" }
  };
}

export const usePackageInventoryDomainSource: DomainSourceHook = () => {
  const { data = [], isLoading } = usePackages("");

  const activities = useMemo(
    () => (data ?? []).map(normalizePackage),
    [data]
  );

  return {
    domain: "package-inventory",
    activities,
    isLoading,
  };
};