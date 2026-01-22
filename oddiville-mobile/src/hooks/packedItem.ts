import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPackedItem,
  getPackedItems,
  getPackingSummaryToday,
} from "@/src/services/packing.service";

import { PackageItem, useChamberStock } from "./useChamberStock";
import { useMemo } from "react";
import { CreatePackingEventDTO } from "./packing/usePackingForm";

const CHAMBER_STOCK_KEY = ["chamber-stock"];
const DRY_CHAMBER_QUERY_KEY: QueryKey = ["dry", "chamber", "summary"];
const PACKING_TODAY_QUERY_KEY: QueryKey = ["packing-summary", "today"];

export type PackedItem = {
  id: string;
  product_name: string;
  unit: string;
  rating: number;
  image: string | null;
  category: string;
  chamber: { id: string; quantity: string }[];
  packages?: PackageItem[];
  __optimistic?: boolean;
};

export type PackingSummaryEvent = {
  eventId: string;
  stockId: string;
  product_name: string;
  createdAt: string;
  size: {
    size: string;
    packets: number;
    rating: number;
  };
  rawMaterials: string[];
};

export const useCreatePackedItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackingEventDTO) => {
      return createPackedItem(payload);
    },

    onSettled() {
      queryClient.invalidateQueries({ queryKey: CHAMBER_STOCK_KEY });
      queryClient.invalidateQueries({ queryKey: DRY_CHAMBER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PACKING_TODAY_QUERY_KEY });
    },
  });
};

export const usePackedItems = () => {
  const queryClient = useQueryClient();

  return useQuery<PackedItem[]>({
    queryKey: CHAMBER_STOCK_KEY,
    queryFn: async () => {
      const cached = queryClient.getQueryData<PackedItem[]>(CHAMBER_STOCK_KEY);

      if (Array.isArray(cached) && cached.length > 0) {
        return cached;
      }

      const res = await getPackedItems();
      const data = Array.isArray(res?.data) ? res.data : [];

      return data;
    },
    select: (items) => items.filter((item) => item.category === "packed"),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export function usePackedItemsFromChamberStock() {
  const { data, isFetching, refetch } = useChamberStock();

  const packedItems = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter((item) => item.category === "packed");
  }, [data]);

  return {
    data: packedItems,
    isFetching,
    refetch,
  };
}

export const usePackingSummaryToday = () => {
  return useQuery<PackingSummaryEvent[]>({
    queryKey: PACKING_TODAY_QUERY_KEY,
    queryFn: async () => {
      const res = await getPackingSummaryToday();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
