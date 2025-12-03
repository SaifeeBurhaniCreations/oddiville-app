import { useQuery, useQueryClient } from '@tanstack/react-query';
import useSocket from "@/src/hooks/useSocketFromContext";
import { useEffect } from 'react';
import { fetchChambers, fetchChamberById, fetchChamberByName, fetchChambersByIds } from '../services/chamber.service';
import { rejectEmptyOrNull } from '../utils/authUtils';

export interface Chamber {
    id: string;
    chamber_name: string;
    capacity: number;
    items: string[];
    tag: "frozen" | "dry";
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
}


export function useChamberById(id?: string | null, ids?: string[] | null) {
    const queryClient = useQueryClient();

    return useQuery<Chamber | Chamber[] | null>({
        queryKey: ['chamber', id, ids],
        queryFn: rejectEmptyOrNull(async () => {
            if (!id && (!ids || ids?.length === 0)) return null;

            const cachedChambers = queryClient.getQueryData<Chamber[]>(['chamber']);

            if (cachedChambers) {
                if (id) {
                    return cachedChambers.find(c => c.id === id) ?? null;
                } else if (ids) {
                    return cachedChambers.filter(c => ids.includes(c.id));
                }
            }

            if (id) {
                const response = await fetchChamberById(id);
                return response?.data ?? null;
            } else if (ids && ids?.length > 0) {
                const response = await fetchChambersByIds(ids);
                return response?.data ?? [];
            }

            return null;
        }),
        enabled: !!id || (!!ids && ids?.length > 0),
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

export function useChamberByName(name: string | null) {
    const queryClient = useQueryClient();

    return useQuery<Chamber>({
        queryKey: ['chamber', name],
        queryFn: rejectEmptyOrNull(async () => {
            if (!name) return null;

            const cachedChambers = queryClient.getQueryData<Chamber[]>(['chamber']);

            if (cachedChambers) {
                const chamber = cachedChambers.find(c => c.chamber_name === name);
                if (chamber) {
                    return chamber;
                }
            }

            const response = await fetchChamberByName(name);
            return response?.data ?? null;
        }),
        enabled: !!name,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

export function useChamber() {
    const queryClient = useQueryClient();
    const socket = useSocket();

    useEffect(() => {
        const listener = (updatedItem: any) => {
            if (!updatedItem?.id) return;

            queryClient.setQueryData(['chamber'], (oldData: any[] | undefined) => {
                if (!oldData) return [updatedItem];

                const index = oldData.findIndex(item => item.id === updatedItem.id);

                if (index !== -1) {
                    const newData = [...oldData];
                    newData[index] = updatedItem;
                    return newData;
                } else {
                    return [...oldData, updatedItem];
                }
            });
        };

        socket.on('chamber:receive', listener);

        return () => {
            socket.off('chamber:receive', listener);
        };
    }, [queryClient]);

    return useQuery<Chamber[]>({
        queryKey: ['chamber'],
        queryFn: rejectEmptyOrNull(async () => {
            const response = await fetchChambers();
            return response?.data || [];
        }),
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

export function useDryChambers({ useSeparateCache = false } = {}) {
    const queryClient = useQueryClient();
  
    const cached = queryClient.getQueryData<Chamber[]>(['chamber']);
    const initialData = Array.isArray(cached) && cached.length > 0
      ? cached.filter(c => c.tag === 'dry')
      : undefined;
      
      return useQuery<Chamber[], Error>({
        queryKey: ['dry-chamber'],
        initialData,             
        enabled: true,          
        staleTime: 1000 * 60 * 60, 
        refetchOnWindowFocus: false,
        refetchOnMount: false,    
        queryFn: async () => {
          const cached = queryClient.getQueryData<Chamber[]>(['chamber']);
          if (Array.isArray(cached) && cached.length) return cached.filter(c => c.tag === 'dry');
          const res = await fetchChambers();
          return Array.isArray(res?.data) ? res.data.filter(c => c.tag === 'dry') : [];
        }
      });
  }
  