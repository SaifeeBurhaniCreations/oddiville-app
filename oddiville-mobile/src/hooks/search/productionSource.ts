import { useMemo } from "react";
import { useProduction } from "@/src/hooks/production";
import { searchRegistry } from "@/src/utils/searchRegistyUtil";
import type { DomainSourceHook } from "@/src/types/search/sources";
import type { Production } from "@/src/hooks/production";

function normalizeStatus(v: unknown) {
  return String(v ?? "").toLowerCase();
}

function extractProductions(data: unknown): Production[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data)
    return (data as { items: Production[] }).items ?? [];
  return [];
}

export const useProductionStartSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useProduction();

  const activities = useMemo(() => {
    const normalize = searchRegistry["production-start"].normalize;
    const list = extractProductions(data);

    return list
      .filter(p => normalizeStatus(p.status) === "pending")
      .map(normalize);
  }, [data]);

  return {
    domain: "production-start",
    activities,
    isLoading,
  };
};
export const useProductionInprogressSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useProduction();

  const activities = useMemo(() => {
    const normalize = searchRegistry["production-inprogress"].normalize;
    const list = extractProductions(data);

    return list
      .filter(p => ["inprogress","in_progress","in-progress"].includes(normalizeStatus(p.status)))
      .map(normalize);
  }, [data]);

  return {
    domain: "production-inprogress",
    activities,
    isLoading,
  };
};

export const useProductionCompletedSource: DomainSourceHook = () => {
  const { data = [], isLoading } = useProduction();

  const activities = useMemo(() => {
    const normalize = searchRegistry["production-completed"].normalize;
    const list = extractProductions(data);

    return list
      .filter(p => ["completed","done"].includes(normalizeStatus(p.status)))
      .map(normalize);
  }, [data]);

  return {
    domain: "production-completed",
    activities,
    isLoading,
  };
};
