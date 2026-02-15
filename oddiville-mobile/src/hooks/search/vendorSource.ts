import { useMemo } from "react";
import { searchRegistry } from "@/src/utils/searchRegistyUtil";
import type { DomainSourceHook } from "@/src/types/search/sources";
import { useVendors } from "@/src/hooks/vendor";

export const useVendorDomainSource: DomainSourceHook = () => {
  const { _vendors = [], isLoading } = useVendors("");

  const activities = useMemo(() => {
    const normalizeVendor = searchRegistry["vendor"].normalize;

    return (_vendors ?? []).map((vendor) => normalizeVendor(vendor as any));
  }, [_vendors]);

  return {
    domain: "vendor",
    activities,
    isLoading,
  };
};
