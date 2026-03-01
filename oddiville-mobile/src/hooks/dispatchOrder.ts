import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchOrders, fetchOrderById, dispatchOrder, updateOrder, updateOrderStatus } from "../services/dispatchOrder.service";
import { useEffect } from "react";
import { socket } from "../lib/notificationSocket";
import { rejectEmptyOrNull } from "../utils/authUtils";
import { OrderStorageForm } from "@/app/create-orders";

export type OrderStatus =
  | "pending"
  | "in-progress"
  | "completed";

export interface DispatchOrderProduct {
  id: string;
  product_name: string;
  image: string | null;
  rating: number;
}

export interface DispatchTruckDetails {
  challan: string | null;
  truck_type: string | null;
  driver_name: string | null;
  tare_weight: number | null;
  truck_phone: string | null;
  truck_number: string | null;
  truck_weight: number | null;
  truck_agency_name: string | null;
}

export interface PacketInfo {
  size: number;
  unit: string;
  packetsPerBag: number;
}

export interface DispatchedItemSKU {
  packet: PacketInfo;
  byChamber: Record<string, number>;
  totalBags: number;
  totalPackets: number;
}

export type DispatchedItems = Record<
  string, 
  Record<
    string, 
    DispatchedItemSKU
  >
>;

export interface DispatchOrderData {
  id: string;
  customer_name: string;
  address: string;
  city: string;
  state: string;
  country: string;

  status: OrderStatus;

  dispatch_date: string | null;
  est_delivered_date: string | null;
  delivered_date: string | null;

  products: DispatchOrderProduct[];

  sample_images: string[] | null;

  amount: number;

  truck_details: DispatchTruckDetails;

  dispatched_items: DispatchedItems;

  createdAt: string;
  updatedAt: string;
}

export function useOrders() {
    const queryClient = useQueryClient();

    const query = useQuery<DispatchOrderData[]>({
        queryKey: ['dispatchOrders'],
        queryFn: rejectEmptyOrNull(async () => {
            try {
                const response = await fetchOrders();
                const data = response?.data;
                return Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Error fetching orders:', error);
                return [];
            }
        }),
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    useEffect(() => {
        const handleOrderUpdate = (updatedOrder: DispatchOrderData) => {
            if (!updatedOrder?.id) {
                console.warn('Received order update without valid ID:', updatedOrder);
                return;
            }

            queryClient.setQueryData(['dispatchOrders'], (oldData: DispatchOrderData[] | undefined) => {
                if (!oldData || !Array.isArray(oldData)) {
                    return [updatedOrder];
                }

                const index = oldData.findIndex(item => item?.id === updatedOrder.id);

                if (index !== -1) {
                    const newData = [...oldData];
                    newData[index] = { ...newData[index], ...updatedOrder };
                    return newData;
                } else {
                    return [updatedOrder, ...oldData];
                }
            });

            queryClient.setQueryData(['dispatchOrder', updatedOrder.id], updatedOrder);
        };

        const handleOrderReceive = (newOrder: DispatchOrderData) => {
            if (!newOrder?.id) {
                console.warn('Received new order without valid ID:', newOrder);
                return;
            }

            queryClient.setQueryData(['dispatchOrders'], (oldData: DispatchOrderData[] | undefined) => {
                if (!oldData || !Array.isArray(oldData)) {
                    return [newOrder];
                }

                const exists = oldData.some(order => order?.id === newOrder.id);
                if (exists) {
                    return oldData;
                }

                return [newOrder, ...oldData];
            });

            queryClient.setQueryData(['dispatchOrder', newOrder.id], newOrder);
        };

        socket.on('dispatchOrder:update', handleOrderUpdate);
        socket.on('dispatchOrder:receive', handleOrderReceive);
        socket.on('dispatchOrder:created', handleOrderReceive);

        return () => {
            socket.off('dispatchOrder:update', handleOrderUpdate);
            socket.off('dispatchOrder:receive', handleOrderReceive);
            socket.off('dispatchOrder:created', handleOrderReceive);
        };
    }, [queryClient]);

    return query;
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ orderId, status }: { orderId: string | number; status: 'pending' | 'in-progress' | 'completed' }) => {
            const response = await updateOrderStatus(orderId, status);
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            if (!updatedOrder?.id) return;

            queryClient.setQueryData(['dispatchOrders'], (oldData: DispatchOrderData[] | undefined) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;

                return oldData.map(order =>
                    order?.id === updatedOrder.id
                        ? { ...order, ...updatedOrder }
                        : order
                );
            });

            queryClient.setQueryData(['dispatchOrder', updatedOrder.id], updatedOrder);
        },
    });
}

export function useOrderById(id: string | null) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['dispatchOrder', id],
        queryFn: rejectEmptyOrNull(async () => {
            if (!id) return null;

            const cachedOrders = queryClient.getQueryData<DispatchOrderData[]>(['dispatchOrders']);
            if (cachedOrders) {
                const orderFromCache = cachedOrders.find(o => o.id === id);
                if (orderFromCache) {
                    return orderFromCache;
                }
            }

            const response = await fetchOrderById(id);
            return response?.data ?? null;
        }),
        enabled: !!id,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (!id) return;

        const listener = (data: DispatchOrderData) => {
            if (data?.id === id) {
                queryClient.setQueryData(['dispatchOrder', id], data);
            }
        };

        socket.on('dispatchOrder-id:receive', listener);

        return () => {
            socket.off('dispatchOrder-id:receive', listener);
        };
    }, [queryClient, id]);

    return query;
}

// export function useDispatchOrder() {
//   return useMutation({
//     mutationFn: async (data: OrderStorageForm) => {
//       const response = await dispatchOrder(data);
//       console.log("response.data", response.data);

//       return response.data;
//     },
//     onSuccess: () => {
//       console.log("Dispatch order request success — no cache updated");
//     },
//     onError: (error) => {
//       console.error("Error creating dispatch order:", error);
//     },
//   });
// }

export function useDispatchOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: OrderStorageForm) => {
            const payload: OrderStorageForm = {
                ...data,
                products: data.products.map(p => ({
                    id: p.id,
                    product_name: p.product_name,
                    image: p.image,
                    rating: p.rating,
                })),
            };

            const response = await dispatchOrder(payload);
            return response.data;
        },
        onSuccess: (newOrder) => {
            if (!newOrder?.id) return;

            queryClient.setQueryData(['dispatchOrders'], (oldData: DispatchOrderData[] | undefined) => {
                if (!oldData || !Array.isArray(oldData)) {
                    return [newOrder];
                }

                const exists = oldData.some(order => order.id === newOrder.id);
                if (exists) {
                    return oldData.map(order =>
                        order.id === newOrder.id ? { ...order, ...newOrder } : order
                    );
                }

                return [newOrder, ...oldData];
            });

            queryClient.setQueryData(['dispatchOrder', newOrder.id], newOrder);

            queryClient.invalidateQueries({
                queryKey: ['dispatchOrders'],
                exact: true
            });
        },
        onError: (error) => {
            console.error('Error creating dispatch order:', error);
            queryClient.invalidateQueries({ queryKey: ['dispatchOrders'] });
        },
        onSettled() {
            queryClient.invalidateQueries({ queryKey: ['dispatchOrders'] });
        },
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await updateOrder(id, data);
            return response.data;
        },
        onSuccess: (updatedOrder) => {
            if (!updatedOrder?.id) return;

            queryClient.setQueryData(['dispatchOrder', updatedOrder.id], updatedOrder);

            queryClient.setQueryData(['dispatchOrders'], (old: any[] = []) => {
                return old.map(order => (order.id === updatedOrder.id ? updatedOrder : order));
            });
        },
    });
}