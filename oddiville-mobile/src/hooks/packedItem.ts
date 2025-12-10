import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPackedItem, getPackedItems } from "@/src/services/productItem.service";
import {
  CreatePackedItemDTO,
  mapStorageFormToPackedDTO,
} from "@/src/utils/mapStorageFormToPackedDTO";
import { StorageForm } from "@/app/(tabs)/package";

const CHAMBER_STOCK_KEY = ["chamber-stock"];
const DRY_CHAMBER_QUERY_KEY: QueryKey = ["dry", "chamber", "summary"];

export type PackedItem = {
  id: string | number;
  product_name: string;
  unit: string;
  image: string | null;
  category: string;
  chamber: { id: string; quantity: string;}[];
  __optimistic?: boolean;
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
    },
  });
};

// export const useCreatePackedItem = () => {
//   return useMutation({
//     mutationFn: (form: StorageForm) => {
//       const dto: CreatePackedItemDTO = mapStorageFormToPackedDTO(form, null);
//       return createPackedItem(dto); 
//     },
//   });
// };

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