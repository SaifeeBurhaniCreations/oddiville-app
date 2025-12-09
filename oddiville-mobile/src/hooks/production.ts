import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  fetchProduction,
  fetchProductionById,
  startProduction,
  updateProduction,
  completeProduction,
} from "../services/production.service";
import { socket } from "../lib/notificationSocket";
import { useDispatch } from "react-redux";
import { setCurrentProduct } from "../redux/slices/store-product.slice";
import { rejectEmptyOrNull } from "../utils/authUtils";

export interface Production {
  id: string;
  // supervisor?: string | null;
  // lane?: string | null;
  // rating?: string | null;
  // wastage_quantity?: string | null;
  // recovery?: number | null;
  // unit: string;
  // createdAt: string | Date;
  // updatedAt: string | Date;
  product_name: string;
  quantity: number;
  raw_material_order_id: string;
  start_time?: string | Date | null;
  end_time?: string | Date | null;
  status: "pending" | "in-queue" | "in-progress" | "completed" | "cancelled";
  batch_code?: string | null;
  notes?: string | null;
  sample_images?: { url: string; key: string }[] | null;
}
const toProduction = (payload: any): Production | null => {
  if (!payload) return null;
  return payload.productionDetails ?? payload; 
};

export function useProduction() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const listener = (payload: any) => {
      const updated = toProduction(payload);
      if (!updated?.id) return;

      queryClient.setQueryData(
        ["production"],
        (old: Production[] | undefined) => {
          if (!old) return [updated];
          const idx = old.findIndex((i) => i.id === updated.id);
          if (idx === -1) return [updated, ...old];
          const copy = old.slice();
          copy[idx] = updated;
          return copy;
        }
      );

      queryClient.setQueryData(["production", updated.id], updated);
    };

    socket.on("production:receive", listener);
    socket.on("production:status-changed", listener);

    return () => {
      socket.off("production:receive", listener);
      socket.off("production:status-changed", listener);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["production"],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchProduction();
      return response?.data || [];
    }),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useProductionById(id: string | null) {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: productions } = useProduction();

  const initialData = useMemo(() => {
    if (!id || !productions) return undefined;
    // @ts-ignore
    return productions?.find((item: any) => item.id === id);
  }, [productions, id]);

  const query = useQuery({
    queryKey: ["production", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id) return null;

      if (initialData) {
        dispatch(setCurrentProduct(initialData));
        return initialData;
      }
      const response = await fetchProductionById(id);
      dispatch(setCurrentProduct(response?.data));
      return response?.data;
    }),
    enabled: !!id,
    initialData,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!id) return;

    const listener = (payload: any) => {
      const updated = toProduction(payload);
      if (updated?.id !== id) return;
      queryClient.setQueryData(["production", id], updated);
    };

    socket.on("production:status-changed", listener);
    socket.on("production:receive", listener);

    return () => {
      socket.off("production:status-changed", listener);
      socket.off("production:receive", listener);
    };
  }, [queryClient, id]);

  return query;
}

export function useStartProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await startProduction({ id, data });
      return { ...response.data };
    },
    onSuccess: (updatedProduction, variables) => {
      if (!updatedProduction?.id) return;

      queryClient.setQueryData(["production"], (oldData: any[] = []) => {
        const index = oldData.findIndex(
          (item) => item.id === updatedProduction.id
        );
        if (index !== -1) {
          const newData = [...oldData];
          newData[index] = updatedProduction;
          return newData;
        } else {
          return [...oldData, updatedProduction];
        }
      });

      queryClient.setQueryData(["production", variables.id], updatedProduction);
    },
  });
}

export function useUpdateProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await updateProduction({ id, data });
      return response.data;
    },
    onSuccess: (updatedProduction, variables) => {
      if (!updatedProduction?.id) return;

      queryClient.setQueryData(["production"], (oldData: any[] = []) => {
        const index = oldData.findIndex(
          (item) => item.id === updatedProduction.id
        );
        if (index !== -1) {
          const newData = [...oldData];
          newData[index] = updatedProduction;
          return newData;
        } else {
          return [...oldData, updatedProduction];
        }
      });

      queryClient.setQueryData(["production", variables.id], updatedProduction);

      if (updatedProduction?.lane && updatedProduction.id) {
        queryClient.setQueryData(["lanes-data"], (oldLanes: any[] = []) => {
          return oldLanes.map((lane) => {
            if (lane.production_id === updatedProduction.id) {
              return { ...lane, production_id: null };
            }
            if (lane.id === updatedProduction.lane) {
              return { ...lane, production_id: updatedProduction.id };
            }
            return lane;
          });
        });
      }
    },
  });
}

export function useCompleteProduction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await completeProduction({ id, data });
      return response.data;
    },
    onSuccess: (updatedProduction, variables) => {
      const { production, updatedStock } = updatedProduction;

      if (!production?.id) return;

      queryClient.setQueryData(["production"], (oldData: Production[] = []) => {
        return oldData.filter((item) => item.id !== production.id);
      });

      queryClient.setQueryData(["production", variables.id], production);

      if (production?.lane) {
        queryClient.setQueryData(["lanes-data"], (oldLanes: any[] = []) => {
          return oldLanes.map((lane) =>
            lane.id === production.lane
              ? { ...lane, production_id: null }
              : lane
          );
        });
      }

      if (updatedStock) {
        queryClient.setQueryData(["chamber-stock"], (oldStocks: any[] = []) => {
          const index = oldStocks.findIndex(
            (item) => item.id === updatedStock.id
          );
          if (index !== -1) {
            const newStocks = [...oldStocks];
            newStocks[index] = updatedStock;
            return newStocks;
          } else {
            return [...oldStocks, updatedStock];
          }
        });

        queryClient.setQueryData(
          ["chamber-stock", updatedStock.id],
          updatedStock
        );
      }

      queryClient.invalidateQueries({ queryKey: ["production"] });
    },
  });
}
