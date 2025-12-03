import api from "@/src/lib/axios";

export const fetchTruckById = (id: string) => api.get(`/truck/${id}`);

export const fetchTrucks = () => api.get(`/truck`);

export const createTruck = (data: any) => api.post(`/truck`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateTruck = ({data, id}: { data: any, id: string }) => api.patch(`/truck/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
