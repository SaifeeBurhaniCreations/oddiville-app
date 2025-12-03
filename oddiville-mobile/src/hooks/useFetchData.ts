import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLanes } from '../services/lane.service';
import { fetchLocations } from '../services/worklocation.service';
import { useEffect, useMemo } from 'react';
import { socket } from '../lib/notificationSocket';
import { rejectEmptyOrNull } from '../utils/authUtils';

export function useLanes() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['lanes-data'],
        queryFn: rejectEmptyOrNull(async () => {
            const res = await fetchLanes();
            return res.data;
        }),
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchInterval: false,
    });

    useEffect(() => {
        const listener = (data: any) => {
            if (data?.lanes) {
                queryClient.setQueryData(['lanes-data'], data.lanes);
            }
        };

        socket.on('lanes:receive', listener);

        return () => {
            socket.off('lanes:receive', listener);
        };
    }, [queryClient]);

    return query;
}

export function useLaneById(laneId: string) {
    const { data: lanes, ...rest } = useLanes();

    const lane = useMemo(() => {
        if (!lanes || !laneId) return undefined;
        return lanes.find((lane: any) => lane.id === laneId);
    }, [lanes, laneId]);

    return { lane, lanes, ...rest };
}

export const useLocations = () =>
    useQuery({
        queryKey: ['work-locations'],
        queryFn: rejectEmptyOrNull(fetchLocations),
        select: (res) => res.data,
        staleTime: 1000 * 60 * 2400, 
        refetchOnMount: false, 
        refetchOnWindowFocus: false, 
        refetchInterval: false, 
    });
