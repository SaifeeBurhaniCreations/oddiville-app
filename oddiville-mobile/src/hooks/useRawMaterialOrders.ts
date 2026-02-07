  import {
    useQuery,
    useQueryClient,
    useInfiniteQuery,
    UseQueryResult,
    UseInfiniteQueryResult,
  } from "@tanstack/react-query";
  import useSocket from "@/src/hooks/useSocketFromContext";
  import { useEffect } from 'react';
  import { fetchRawMaterialOrder, fetchRawMaterialOrderAll, fetchRawMaterialOrderById } from '../services/rawmaterial.service';
  import { RawMaterialOrderProps } from '../types';
  import { rejectEmptyOrNull } from '../utils/authUtils';
  import useOrdersRealtimeSync from "./useOrdersRealtimeSync";

  export interface Challan {
      url: string;
      key: string;
  }
  export interface TruckDetails {
      truck_weight: string;
      tare_weight: string;
      truck_number: string;
      driver_name: string;
      challan: Challan;
  }

  export interface RawMaterialOrderCreated {
      materialDetails: RawMaterialOrderProps;
      timestamp?: string | Date;
      type?: string;
  }
  export interface RawMaterialOrderStatusChanged {
      materialId: string;
      materialDetails: RawMaterialOrderProps;
      timestamp: string | Date;
      type: 'RAW_MATERIAL_ORDER_STATUS_CHANGED';
  }

  export type CompletedOrdersPage = {
    data: RawMaterialOrderProps[];
    nextOffset: number | null;
  };
  
  export const PENDING_KEY = ["raw-material-orders", "pending"] as const;
  export const ALL_KEY = ["raw-material-orders", "all"] as const;

export type OrderStatus = "pending" | "completed";

type CompletedPage = {
  data: RawMaterialOrderProps[];
  nextOffset: number | null;
};

const LIMIT = 10;

/* ===============================
   OVERLOADS (⭐ important)
================================ */

export function useRawMaterialOrders(
  status: "pending",
): UseQueryResult<RawMaterialOrderProps[]>;

export function useRawMaterialOrders(
  status: "completed",
): UseInfiniteQueryResult<CompletedPage, Error>;

/* ===============================
   IMPLEMENTATION
================================ */

export function useRawMaterialOrders(status: OrderStatus) {
  useOrdersRealtimeSync();

  if (status === "pending") {
    return useQuery<RawMaterialOrderProps[]>({
      queryKey: ["raw-material-orders", "pending"],
      queryFn: rejectEmptyOrNull(async () =>
        fetchRawMaterialOrder({ status: "pending" }),
      ),
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });
  }

  return useInfiniteQuery<CompletedPage, Error, CompletedPage, any, number>({
    queryKey: ["raw-material-orders", "completed"],
    initialPageParam: 0,

    queryFn: rejectEmptyOrNull(async ({ pageParam }) => {
      const res = await fetchRawMaterialOrder({
        status: "completed",
        limit: LIMIT,
        offset: pageParam,
      });

      return {
        data: res ?? [],
        nextOffset: (res?.length ?? 0) === LIMIT ? pageParam + LIMIT : null,
      };
    }),

    getNextPageParam: (last) => last.nextOffset,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useRawMaterialOrdersAll() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    const onCreated = (data: RawMaterialOrderCreated) => {
      const updated = data.materialDetails;
      if (!updated?.id) return;

      queryClient.setQueryData(
        ["raw-material-order-by-id", updated.id],
        updated
      );

      queryClient.setQueryData<RawMaterialOrderProps[]>(ALL_KEY, (old = []) => {
        const idx = old.findIndex((o) => o.id === updated.id);
        if (idx === -1) return [updated, ...old];
        const copy = old.slice();
        copy[idx] = updated;
        return copy;
      });

      if (updated.status === "pending") {
        queryClient.setQueryData<RawMaterialOrderProps[]>(
          PENDING_KEY,
          (old = []) => {
            if (old.some((o) => o.id === updated.id)) return old;
            return [updated, ...old];
          }
        );
      }
    };

    socket.on("raw-material-order:created", onCreated);
    return () => {
      socket.off("raw-material-order:created", onCreated);
    };
  }, [queryClient]);

  return useQuery<RawMaterialOrderProps[]>({
    queryKey: ALL_KEY,
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchRawMaterialOrderAll();
      return response;
    }),
  });
}

export function useRawMaterialOrderById(id: string | null) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!id) return;

const onStatusChanged = (data: any) => {
  const updated = data?.materialDetails ?? data;
  if (!updated?.id) return;

  queryClient.setQueryData(["raw-material-order-by-id", updated.id], updated);

  queryClient.setQueryData<RawMaterialOrderProps[]>(PENDING_KEY, (old = []) => {
    const isPending = updated.status === "pending" || !updated.arrival_date;
    if (!isPending) return old.filter((o) => o.id !== updated.id);

    const idx = old.findIndex((o) => o.id === updated.id);
    if (idx === -1) return [updated, ...old];
    const copy = old.slice();
    copy[idx] = updated;
    return copy;
  });

  queryClient.setQueryData<RawMaterialOrderProps[]>(ALL_KEY, (old = []) => {
    const idx = old.findIndex((o) => o.id === updated.id);
    if (idx === -1) return [updated, ...old];
    const copy = old.slice();
    copy[idx] = updated;
    return copy;
  });
};


    const onUpdated = (updatedOrder: RawMaterialOrderProps) => {
      if (updatedOrder?.id === id) {
        queryClient.setQueryData(
          ["raw-material-order-by-id", id],
          updatedOrder
        );
      }
    };

    socket.on("raw-material-order:status-changed", onStatusChanged);
    socket.on("raw-material-order:updated", onUpdated);
    return () => {
      socket.off("raw-material-order:status-changed", onStatusChanged);
      socket.off("raw-material-order:updated", onUpdated);
    };
  }, [id, queryClient]);

  return useQuery<RawMaterialOrderProps | null>({
    queryKey: ["raw-material-order-by-id", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id || id === "undefined") return null;

      const pending =
        queryClient.getQueryData<RawMaterialOrderProps[]>(PENDING_KEY);
      const hitPending = pending?.find((o) => o.id === id);
      if (hitPending) return hitPending;

      const all = queryClient.getQueryData<RawMaterialOrderProps[]>(ALL_KEY);
      const hitAll = all?.find((o) => o.id === id);
      if (hitAll) return hitAll;

      const response = await fetchRawMaterialOrderById(id);
      return response ?? null;
    }),
    enabled: !!id && id !== "undefined",
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

