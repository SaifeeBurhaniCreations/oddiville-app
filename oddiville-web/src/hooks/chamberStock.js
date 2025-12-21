import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchChambers,
  fetchChamberStock,
  updateChamberStock,
} from "../services/chamberstock.service";

export function useChamberstock(options = {}) {
  const defaults = {
    enabled: true,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  };
  const merged = { ...defaults, ...options };

  return useQuery({
    queryKey: ["chamberstock"],
    queryFn: async () => {
      const res = await fetchChamberStock();
      return res?.data ?? res;
    },
    enabled: merged.enabled,
    staleTime: merged.staleTime,
    cacheTime: merged.cacheTime,
    refetchOnWindowFocus: merged.refetchOnWindowFocus,
    refetchOnMount: merged.refetchOnMount,
    retry: merged.retry,
  });
}

export function useChambers(options = {}) {
  const defaults = {
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  };

  const merged = { ...defaults, ...options };

  return useQuery({
    queryKey: ["chambers"],
    queryFn: async () => {
      const res = await fetchChambers();
      return res?.data ?? res;
    },
    enabled: merged.enabled,
    staleTime: merged.staleTime,
    cacheTime: merged.cacheTime,
    refetchOnWindowFocus: merged.refetchOnWindowFocus,
    refetchOnMount: merged.refetchOnMount,
    retry: merged.retry,
  });
}

export function useUpdateChamberstock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateChamberStock({ id, data });
      return res.chamberStock;
    },

    onSuccess: (updated) => {
      if (!updated?.id) return;

      queryClient.setQueryData(["chamberstock"], (old = []) =>
        Array.isArray(old)
          ? old.map((it) => (it.id === updated.id ? updated : it))
          : old
      );

      queryClient.setQueryData(["chamberstock", updated.id], updated);
    },
  });
}

export function useChamberstockById(id, options = {}) {
  const qc = useQueryClient();

  const defaults = {
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  };
  const merged = { ...defaults, ...options };

  const initialFromCache = (() => {
    if (!id) return undefined;
    try {
      const cached = qc.getQueryData(["chamberstock"]);
      
      if (!cached) return undefined;

      if (Array.isArray(cached)) {
        return cached.find((item) => String(item?.id) === String(id));
      }

      if (cached && Array.isArray(cached.data)) {
        return cached.data.find((item) => String(item?.id) === String(id));
      }

      if (cached && typeof cached === "object" && cached[id]) {
        return cached[id];
      }

      return undefined;
    } catch (e) {
      return undefined;
    }
  })();

  return useQuery({
    queryKey: ["chamberstock", id],
    queryFn: async () => {
      const res = await fetchChamberStock();
      const list = res?.data ?? res;
      if (!list || !Array.isArray(list)) {
        if (list && typeof list === "object" && list.id && String(list.id) === String(id)) {
          return list;
        }
        throw new Error("Chamberstock not available");
      }
      const found = list.find((c) => String(c?.id) === String(id));
      if (!found) throw new Error(`Chamberstock item with id ${id} not found`);
      return found;
    },
    enabled: merged.enabled && !!id,
    initialData: initialFromCache ?? undefined,
    staleTime: merged.staleTime,
    cacheTime: merged.cacheTime,
    refetchOnWindowFocus: merged.refetchOnWindowFocus,
    refetchOnMount: merged.refetchOnMount,
    retry: merged.retry,
  });
}