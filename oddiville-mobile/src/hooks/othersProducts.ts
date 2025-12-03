import {
  useQuery,
  useQueryClient,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import useSocket from "@/src/hooks/useSocketFromContext";
import {
  fetchOtherProductById,
  fetchOthersProductHistory,
} from "../services/otherProduct.service";
import { updateChamberStock } from "../services/chamberStock.service";
import {
  OthersProductForm,
  OthersProductPayload,
} from "@/app/other-products-detail";
import { rejectEmptyOrNull } from "../utils/authUtils";

export type UpdateChamberStockPayload = {
  id: string;
  othersItemId: string;
  data: OthersProductPayload;
};

export interface OtherProductHistory {
  id: string;
  product_id: string;
  chamber_id: string;
  deduct_quantity: number | string;
  remaining_quantity: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export function useOtherProductHistoryById(id: string) {
  const queryClient = useQueryClient();
  return useQuery<OtherProductHistory | null>({
    queryKey: ["otherProductHistory", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id) return null;

      const cached = queryClient.getQueryData<OtherProductHistory[]>([
        "otherProductHistory",
      ]);
      if (cached) {
        const item = cached.find((h) => h.id === id);
        if (item) return item;
      }

      const result = await fetchOthersProductHistory(id);
      return result?.data ?? null;
    }),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// export function useOtherProductHistory() {

//     return useQuery({
//       queryKey: ["otherProductHistory"],
//       queryFn: rejectEmptyOrNull(async () => {
//         const response = await fetchOthersProductHistory("id");
//         return response?.data || [];
//       }),
//       staleTime: 1000 * 60 * 60,
//       refetchOnWindowFocus: false,
//       refetchOnMount: false,
//     });
// }

export function useOthersProductsById(id: string | null) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  useEffect(() => {
    if (!id || !socket) return;

    const handleOrderUpdated = (updatedOrder: any) => {
      if (updatedOrder.id === id) {
        queryClient.setQueryData(["others-product-by-id", id], updatedOrder);
      }
    };

    socket.on("others-product:updated", handleOrderUpdated);
    return () => {
      socket.off("others-product:updated", handleOrderUpdated);
    };
  }, [id, queryClient]);

  return useQuery({
    queryKey: ["others-product-by-id", id],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchOtherProductById(id!);
      return response.data ?? null;
    }),
    enabled: !!id,
    staleTime: 5 * 60 * 30,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateOtherProduct(): UseMutationResult<
  any,
  Error,
  UpdateChamberStockPayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      othersItemId,
      id,
      data,
    }: {
      othersItemId: string;
      id: string;
      data: OthersProductPayload;
    }) => {
      
      const response = await updateChamberStock({ othersItemId, id, data });
      return response;
    },
    onSuccess: (updatedStock, { id }) => {
      queryClient.setQueryData(["chamber-stock", id], updatedStock);
      // queryClient.setQueryData(["chamber-stock", id], updatedStock);
      queryClient.setQueryData(
        ["chamber-stock"],
        (oldData: UpdateChamberStockPayload[]) => {
          if (!oldData) return [updatedStock];
          const idx = oldData.findIndex((item) => item.id === id);
          if (idx === -1) {
            return [...oldData, updatedStock];
          }
          const newData = [...oldData];
          newData[idx] = updatedStock;
          return newData;
        }
      );

      queryClient.invalidateQueries({ queryKey: ["chamber-stock"] });
      queryClient.invalidateQueries({ queryKey: ["chamber"] });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
    },
  });
}
