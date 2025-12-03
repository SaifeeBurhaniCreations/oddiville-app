import { useCallback } from "react";
import { useQuery, useQueryClient, QueryKey } from "@tanstack/react-query";
import { fetchDryWarehouseSummary, DryChamberSummary } from "@/src/services/dryWarehouse.service";

const QUERY_KEY: QueryKey = ["dry", "chamber", "summary"];

export const useDryChamberSummary = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDryWarehouseSummary,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const summaries: DryChamberSummary[] = (query.data?.summaries ?? []) as DryChamberSummary[];

  const refreshFromServer = useCallback(async () => {
    const data = await queryClient.fetchQuery({
      queryKey: QUERY_KEY,
      queryFn: fetchDryWarehouseSummary,
    });
    return data;
  }, [queryClient]);

  const upsertChamber = useCallback(
    (chamber: DryChamberSummary) => {
      queryClient.setQueryData(QUERY_KEY, (old: any) => {
        const prev: { summaries: DryChamberSummary[] } | undefined = old ?? query.data;
        const list = prev?.summaries ?? [];
        
        const idx = list.findIndex((c) => c.chamberId === chamber.chamberId);
        if (idx === -1) return { ...(prev ?? {}), summaries: [chamber, ...list] };
        const next = [...list];
        next[idx] = chamber;
        return { ...(prev ?? {}), summaries: next };
      });
    },
    [queryClient, query.data]
  );

  return {
    summaries,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,

    // Inversion controls
    refetch: query.refetch,
    refreshFromServer,
    upsertChamber,
    queryClient,
  };
};