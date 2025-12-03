import api from "@/src/lib/axios";

export type ImageObject = {
  key?: string;
  url?: string | null;
};

export type DryChamberSummary = {
  chamberId: string;
  chamberName: string | null;
  capacity: number | null;
  totalQuantity: number;
  itemsCount: number;
  image?: ImageObject | null;
};

export type DryChamberSummaryResponse = {
  summaries: DryChamberSummary[];
  totalChambers: number;
  grandTotal: number;
};

export const fetchDryWarehouseItems = () => api.get('/chamber/type/dry');

export const fetchDryWarehouseSummary = async (): Promise<DryChamberSummaryResponse> => {
  const response = await api.get("/chamber/type/dry/summary");
  return response.data as DryChamberSummaryResponse;
};
