import { useQuery, useQueryClient } from '@tanstack/react-query';
import useSocket from "@/src/hooks/useSocketFromContext";
import { useEffect } from 'react';
import { fetchRawMaterialOrder } from '../services/rawmaterial.service';

export function useDispatchNotifications() {
    const queryClient = useQueryClient();
  const socket = useSocket();

    const query = useQuery({
        queryKey: ['dispatch-orders'],
        queryFn: async () => {
            // const response = await fetchRawMaterialOrder();
            return [];
            // return response?.data;
        },
    });
    useEffect(() => {
        const listener = (data: any) => {
            queryClient.setQueryData(['dispatch-orders'], (old: any) => {
                if (!old) return [data.dispatchDetails];
                return [data.dispatchDetails, ...old];
            });
        };

        socket.on('dispatch:created', listener);

        return () => {
            socket.off('dispatch:created', listener);
        };
    }, [queryClient]); 
}
