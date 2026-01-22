import { CreatePackingEventDTO } from "../hooks/packing/usePackingForm";
import api from "../lib/axios";

export const createPackedItem = (data: CreatePackingEventDTO) => api.post(`/packing-event`, data);
export const getPackedItems = () => api.get(`/packing-event`);
export const getPackingSummaryToday = () =>
  api.get(`/packing-event/packing-summary/today`);

// export const createPackedItem = (data: CreatePackingEventDTO) => api.post(`/packed-item`, data);
// export const getPackedItems = () => api.get(`/packed-item`);
// export const getPackedItemsToday = () => api.get(`/packed-item/packing-summary/today`);
