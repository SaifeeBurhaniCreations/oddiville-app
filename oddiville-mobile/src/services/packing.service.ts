import { CreatePackingEventDTO } from "../hooks/packing/usePackingForm";
import api from "../lib/axios";

export const createPackedItem = (data: CreatePackingEventDTO) => api.post(`/packing-event`, data);
export const getPackedItems = () => api.get(`/packing-event`);

// packing.service.ts
export function getPackingSummary(params: {
  sku?: string;
  date?: string;
  mode: "product" | "sku" | "event";
}) {
  return api.get("/packing-summary", { params });
}

// legacy
export const getPackingSummaryToday = () =>
  api.get(`/packing-event/packing-summary`);

// export const createPackedItem = (data: CreatePackingEventDTO) => api.post(`/packed-item`, data);
// export const getPackedItems = () => api.get(`/packed-item`);
// export const getPackedItemsToday = () => api.get(`/packed-item/packing-summary/today`);
