import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPackedItem, getPackedItems } from "@/src/services/productItem.service";
import {
  CreatePackedItemDTO,
  mapStorageFormToPackedDTO,
} from "@/src/utils/mapStorageFormToPackedDTO";
import { StorageForm } from "@/app/(tabs)/package";
import { PackageItem, useChamberStock } from "./useChamberStock";
import { useMemo } from "react";
import { getPackedItemsToday } from "@/src/services/productItem.service";

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
  chamber: { id: string; quantity: string;}[];
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
    mutationFn: (form: StorageForm) => {
      const dto: CreatePackedItemDTO = mapStorageFormToPackedDTO(form, null);
      return createPackedItem(dto);
    },

    async onMutate(form: StorageForm) {
      const dto = mapStorageFormToPackedDTO(form, null);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: CHAMBER_STOCK_KEY }),
        queryClient.cancelQueries({ queryKey: DRY_CHAMBER_QUERY_KEY }),
      ]);

      const previousItems =
        queryClient.getQueryData<PackedItem[]>(CHAMBER_STOCK_KEY) ?? [];

      const optimisticItem: PackedItem = {
        id: `temp-${Date.now()}`,
        product_name: dto.product_name,
        unit: dto.unit,
        rating: dto.rating,
        image: dto.image,
        category: "packed",
        chamber: dto.chambers.map((c) => ({
          id: String(c.id),
          quantity: String(c.quantity),
        })),
        __optimistic: true,
      };

      queryClient.setQueryData<PackedItem[]>(CHAMBER_STOCK_KEY, (old) => [
        ...(old ?? []),
        optimisticItem,
      ]);

      return { previousItems };
    },

    onError(_error, _variables, context) {
      if (context?.previousItems) {
        queryClient.setQueryData(CHAMBER_STOCK_KEY, context.previousItems);
      }
    },

    onSuccess(response) {
      const created: PackedItem = response.data;

      queryClient.setQueryData<PackedItem[]>(CHAMBER_STOCK_KEY, (old) => {
        if (!old) return [created];
        return [...old.filter((i) => !i.__optimistic), created];
      });
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
    return data.filter(item => item.category === "packed");
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
      const res = await getPackedItemsToday();
      return Array.isArray(res?.data) ? res.data : [];
    },
    staleTime: 1000 * 60 * 10,        
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
