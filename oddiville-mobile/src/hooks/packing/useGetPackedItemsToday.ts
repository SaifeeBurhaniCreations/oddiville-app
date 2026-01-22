import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPackedItem, getPackingSummaryToday } from "@/src/services/packing.service";
import { CreatePackingEventDTO } from "./usePackingForm";
import { PackageItem } from "../useChamberStock";

export const PACKING_TODAY_KEY: QueryKey = ["packing-summary", "today"];
const CHAMBER_STOCK_KEY: QueryKey = ["chamber-stock"];
const DRY_CHAMBER_QUERY_KEY: QueryKey = ["dry", "chamber", "summary"];

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

export const useCreatePacking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePackingEventDTO) => createPackedItem(payload),

    onSettled() {
      queryClient.invalidateQueries({ queryKey: CHAMBER_STOCK_KEY });
      queryClient.invalidateQueries({ queryKey: DRY_CHAMBER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PACKING_TODAY_KEY });
    },
  });
};

export type PackingTodayRow = {
  summary_id: string;
  product_name: string;
  sku_label: string;
  totalBags: number;
  totalPackets: number;
  events: number;
};

export function useGetPackedItemsToday() {
  return useQuery<PackingTodayRow[]>({
    queryKey: PACKING_TODAY_KEY,
    queryFn: async () => {
      const res = await getPackingSummaryToday();
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchOnWindowFocus: false,
  });
}
