import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRawMaterialOrder } from '@/src/services/rawmaterial.service';

export function useUpdateRawMaterialOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await updateRawMaterialOrder(id, data);
      return response.data;
    },
    onSuccess: (updatedOrder, { id }) => {
      queryClient.setQueryData(['raw-material-order-by-id', id], updatedOrder);

      queryClient.setQueryData(['raw-material-orders'], (old: any[] | undefined) => {
        if (!old) return;
        return old.map((order) => (order.id === id ? updatedOrder : order));
      });
    },
    onError: (error) => {
      console.error('Error updating raw material order:', error);
    },
  });
}
