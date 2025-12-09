import api from "../lib/axios";

export const createPackedItem = (data: any) => api.post(`/packed-item`, data);
export const getPackedItems = () => api.get(`/packed-item`);
