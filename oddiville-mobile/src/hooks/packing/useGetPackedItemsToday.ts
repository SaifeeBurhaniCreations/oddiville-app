import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createPackedItem,
  getPackingSummary,
} from "@/src/services/packing.service";
import { CreatePackingEventDTO } from "./usePackingForm";
import { PackageItemLocal } from "../useChamberStock";

export const PACKING_SUMMARY_KEY = (
  mode: "event" | "sku" | "product",
  sku?: string,
) => ["packing-summary", "today", mode, sku ?? "ALL"];
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
  packages?: PackageItemLocal[];
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
      queryClient.invalidateQueries({ queryKey: ["packing-summary"] });
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

type UsePackingSummaryParams = {
  mode: "event" | "sku" | "product";
  sku?: string;
};

export function useGetPackingSummary({ mode, sku }: UsePackingSummaryParams) {
  return useQuery({
    queryKey: PACKING_SUMMARY_KEY(mode, sku),
    queryFn: async () => {
      const res = await getPackingSummary({
        mode,
        sku,
        date: "today",
      });
      return res.data ?? [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}