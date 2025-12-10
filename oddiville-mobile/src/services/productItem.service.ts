import api from "../lib/axios";
import { CreatePackedItemDTO } from "../utils/mapStorageFormToPackedDTO";

export const createPackedItem = (data: CreatePackedItemDTO) => api.post(`/packed-item`, data);
export const getPackedItems = () => api.get(`/packed-item`);
