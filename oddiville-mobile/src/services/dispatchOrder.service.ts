import api from "@/src/lib/axios";

export const fetchOrders = () => api.get('/order')
export const fetchOrderById = (id: string) => api.get(`/order/${id}`)
export const dispatchOrder = (data: any) => api.post(`/order/create`, data)
export const updateOrderStatus = (id: any, status: 'pending' | 'in-progress' | 'completed') => api.patch(`/order/status/${id}/`, status)
export const updateOrder = (id: string, data: any) => api.patch(`/order/update/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
})
