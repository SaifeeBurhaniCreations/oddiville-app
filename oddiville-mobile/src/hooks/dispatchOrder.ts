import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchOrders, fetchOrderById, dispatchOrder, updateOrder, updateOrderStatus } from "../services/dispatchOrder.service";
import { useEffect } from "react";
import { socket } from "../lib/notificationSocket";
import { rejectEmptyOrNull } from "../utils/authUtils";

export interface DispatchOrderPackage {
    quantity: string;        
    size: number;           
    stored_quantity: number;
    unit: string;            
  }
  
  export interface DispatchOrderProduct {
    name: string;           
    chambers: {
        id: string;
        name: string;
        quantity: string;
    }[];        
  }
  
  export interface DispatchTruckDetails {
    agency_name: string;     // "Hans Travels"
    driver_name: string;     // "Rajesh Choudhary"
    number: string;          // "MP0913GH62"
    phone: string;           // "6415151648"
    type: string;            // "Eicher"
  }
  
  export interface DispatchOrderData {
    id: string;                       
    status: "pending" | "dispatched" | "completed" | "in-progress" | string;
    
    customer_name: string;           
    product_name: string;              
    address: string;                  
    city: string;                   
    state: string;                  
    country: string;                  
    postal_code: number;             
    
    amount: number;                    
  
    createdAt: string | Date;           
    dispatch_date: string | Date;      
    est_delivered_date: string | Date;  
    delivered_date: string | Date | null;
  
    packages: DispatchOrderPackage[];
    products: DispatchOrderProduct[];
  
    sample_images: string[];          
  
    truck_details: DispatchTruckDetails | null;
  
    updatedAt: string | Date;
  }
  
export function useOrders() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['dispatchOrders'],
        queryFn: rejectEmptyOrNull(async () => {
            try {
                const response = await fetchOrders();
                // Ensure we always return an array
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
        const handleOrderUpdate = (updatedOrder: any) => {
            if (!updatedOrder?.id) {
                console.warn('Received order update without valid ID:', updatedOrder);
                return;
            }

            queryClient.setQueryData(['dispatchOrders'], (oldData: any[] | undefined) => {
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

        const handleOrderReceive = (newOrder: any) => {
            if (!newOrder?.id) {
                console.warn('Received new order without valid ID:', newOrder);
                return;
            }

            queryClient.setQueryData(['dispatchOrders'], (oldData: any[] | undefined) => {
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

            queryClient.setQueryData(['dispatchOrders'], (oldData: any[] | undefined) => {
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

            const cachedOrders = queryClient.getQueryData<any[]>(['dispatchOrders']);
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

        const listener = (data: any) => {
            if (data?.orderDetails?.id === id) {
                queryClient.setQueryData(['dispatchOrder', id], data.orderDetails);
            }
        };

        socket.on('dispatchOrder-id:receive', listener);

        return () => {
            socket.off('dispatchOrder-id:receive', listener);
        };
    }, [queryClient, id]);

    return query;
}

export function useDispatchOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await dispatchOrder(data);
            return response.data;
        },
        onSuccess: (newOrder) => {
            if (!newOrder?.id) return;

            queryClient.setQueryData(['dispatchOrders'], (oldData: any[] | undefined) => {
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
        }
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