import api from "@/src/lib/axios";

export const fetchProductionById = (id: string) => api.get(`/production/${id}`);

export const fetchProduction = () => api.get(`/production`);

export const startProduction = ({data, id}: { data: any, id: string }) => api.patch(`/production/start/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const updateProduction = ({data, id}: { data: any, id: string }) => api.patch(`/production/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

export const completeProduction = ({data, id}: { data: any, id: string }) => api.patch(`/production/complete/${id}`, data);