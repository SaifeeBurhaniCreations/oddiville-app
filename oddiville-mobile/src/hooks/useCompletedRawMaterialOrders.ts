import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRawMaterialOrder } from '../services/rawmaterial.service';
import useSocket from "@/src/hooks/useSocketFromContext";
import { useEffect } from 'react';
import { rejectEmptyOrNull } from '../utils/authUtils';
import type { InfiniteData } from "@tanstack/react-query";
import { RawMaterialOrderProps } from "../types";
import { RawMaterialOrderCreated, RawMaterialOrderStatusChanged } from './rawMaterialOrders';

export type CompletedOrdersPage = {
  data: RawMaterialOrderProps[];
  nextOffset: number | null;
};

type CompletedInfinite = InfiniteData<CompletedOrdersPage>;

function upsertFirstPage(
  old: CompletedInfinite | undefined,
  item: RawMaterialOrderProps
): CompletedInfinite {
  if (!old) {
    return {
      pages: [{ data: [item], nextOffset: null }],
      pageParams: [0],
    };
  }

  const first = old.pages[0] ?? { data: [], nextOffset: null };
  if (first.data.some((n) => n.id === item.id)) {
    const idx = first.data.findIndex((n) => n.id === item.id);
    const newFirst = {
      ...first,
      data: first.data.map((n, i) => (i === idx ? item : n)),
    };
    return { ...old, pages: [newFirst, ...old.pages.slice(1)] };
  }

  const newFirst = { ...first, data: [item, ...first.data] };
  return { ...old, pages: [newFirst, ...old.pages.slice(1)] };
}

function removeFromAllPages(
  old: CompletedInfinite | undefined,
  id: string
): CompletedInfinite | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((p) => ({
      ...p,
      data: p.data.filter((n) => n.id !== id),
    })),
  };
}

const COMPLETED_KEY = ["raw-material-orders", "completed"] as const;

export function useCompletedRawMaterialOrders() {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const limit = 10;

  useEffect(() => {
const upsertCompletedIfNeeded = (updated: RawMaterialOrderProps) => {
  const isCompleted = updated.status === "completed" || !!updated.arrival_date;

  queryClient.setQueryData<CompletedInfinite>(COMPLETED_KEY, (old) => {
    if (isCompleted) return upsertFirstPage(old, { ...updated });
    return removeFromAllPages(old, updated.id);
  });
};

    const onCreated = (data: RawMaterialOrderCreated) => {
      const updated = data.materialDetails;
      if (!updated?.id) return;

      queryClient.setQueryData(
        ["raw-material-order-by-id", updated.id],
        updated
      );

      upsertCompletedIfNeeded(updated);
      
    };

    const onStatusChanged = (data: RawMaterialOrderStatusChanged) => {
      const updated = data.materialDetails;
      if (!updated?.id) return;

      queryClient.setQueryData(
        ["raw-material-order-by-id", updated.id],
        updated
      );

      upsertCompletedIfNeeded(updated);
    };

    socket.on("raw-material-order:created", onCreated);
    socket.on("raw-material-order:status-changed", onStatusChanged);

    return () => {
      socket.off("raw-material-order:created", onCreated);
      socket.off("raw-material-order:status-changed", onStatusChanged);
    };
  }, [queryClient, socket]);

  return useInfiniteQuery<CompletedOrdersPage, Error>({
    queryKey: COMPLETED_KEY,
    initialPageParam: 0,
    queryFn: rejectEmptyOrNull(async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const res = await fetchRawMaterialOrder({
        status: "completed",
        limit,
        offset,
      });

      return {
        data: res ?? [],
        nextOffset: (res?.length ?? 0) === limit ? offset + limit : null,
      };
    }),
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // @ts-ignore
    keepPreviousData: true,
  });
}