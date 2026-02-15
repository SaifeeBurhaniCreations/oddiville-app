import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { socket } from "../lib/notificationSocket";
import {
  createTruck,
  fetchTruckById,
  fetchTrucks,
  updateTruck,
} from "../services/truck.service";
import { rejectEmptyOrNull } from "../utils/authUtils";

/** ----- Types ----- */
export type TruckDetailsProps = {
  id: string;
  agency_name: string;
  driver_name: string;
  phone: string;
  size: string;
  type: string;
  number: string;
  isMyTruck: boolean;
  active: boolean;
  arrival_date: Date | string;
  challan: string;
  status?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/** ----- Hooks ----- */
export function useTrucks() {
  const queryClient = useQueryClient();

  const query = useQuery<TruckDetailsProps[]>({
    queryKey: ["Trucks"],
    queryFn: rejectEmptyOrNull(async () => {
      const response = await fetchTrucks();
      return (response?.data as TruckDetailsProps[]) || [];
    }),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    const listener = (updatedTruck: Partial<TruckDetailsProps> & { id?: string }) => {
      if (!updatedTruck?.id) return;

      queryClient.setQueryData<TruckDetailsProps[]>(
        ["Trucks"],
        (oldData = []) => {
          const idx = oldData.findIndex((t) => t.id === updatedTruck.id);
          if (idx !== -1) {
            const newData = [...oldData];
            newData[idx] = { ...newData[idx], ...(updatedTruck as TruckDetailsProps) };
            return newData;
          }
          return [...oldData, updatedTruck as TruckDetailsProps];
        }
      );

      queryClient.setQueryData<TruckDetailsProps>(["Truck", updatedTruck.id], updatedTruck as TruckDetailsProps);
    };

    socket.on("Truck:receive", listener);
    return () => {
      socket.off("Truck:receive", listener);
    };
  }, [queryClient]);

  return query;
}

export function useTruckById(id: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<TruckDetailsProps | null>({
    queryKey: ["Truck", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id) return null;

      const cached = queryClient.getQueryData<TruckDetailsProps[]>(["Trucks"]);
      if (cached) {
        const found = cached.find((p) => p.id === id);
        if (found) return found;
      }

      const response = await fetchTruckById(id);
      return (response?.data as TruckDetailsProps) ?? null;
    }),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (!id) return;
    const listener = (data: Partial<TruckDetailsProps> & { id?: string }) => {
      if (data?.id === id) {
        queryClient.setQueryData<TruckDetailsProps>(["Truck", id], data as TruckDetailsProps);
      }
    };
    socket.on("Truck-id:receive", listener);
    return () => {
      socket.off("Truck-id:receive", listener);
    };
  }, [queryClient, id]);

  return query;
}

export function useCreateTruck() {
  const queryClient = useQueryClient();

  return useMutation<TruckDetailsProps, unknown, FormData>({
    mutationFn: async (data: FormData) => {
      const response = await createTruck(data);
      return response.data as TruckDetailsProps;
    },
    onSuccess: (newTruck) => {
      if (!newTruck?.id) return;

      socket.emit("Truck-id:send", newTruck);

      queryClient.setQueryData<TruckDetailsProps[]>(
        ["Trucks"],
        (old = []) => [...old, newTruck]
      );

      queryClient.setQueryData<TruckDetailsProps>(["Truck", newTruck.id], newTruck);
    },
  });
}

export function useUpdateTruck() {
  const queryClient = useQueryClient();

  return useMutation<TruckDetailsProps, unknown, { id: string; data: FormData }>({
    mutationFn: async ({ id, data }) => {
      const response = await updateTruck({ id, data });
      return response.data as TruckDetailsProps;
    },
    onSuccess: (updatedTruck) => {
      if (!updatedTruck?.id) return;

      socket.emit("Truck-id:send", updatedTruck);

      queryClient.setQueryData<TruckDetailsProps[]>(
        ["Trucks"],
        (old = []) => {
          const idx = old.findIndex((t) => t.id === updatedTruck.id);
          if (idx !== -1) {
            const copy = [...old];
            copy[idx] = updatedTruck;
            return copy;
          }
          return [...old, updatedTruck];
        }
      );

      queryClient.setQueryData<TruckDetailsProps>(["Truck", updatedTruck.id], updatedTruck);
    },
  });
}