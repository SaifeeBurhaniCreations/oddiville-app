import { UpdateChamberStockPayload } from "../hooks/othersProducts";
import api from "@/src/lib/axios";

export type FetchChamberStockParams = {
  search?: string;
  limit?: number;
  offset?: number;
};
export const fetchChamberStock = async (params: FetchChamberStockParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.limit !== undefined)
    queryParams.append("limit", String(params.limit));
  if (params.offset !== undefined)
    queryParams.append("offset", String(params.offset));
  if (params.search) queryParams.append("search", params.search);

  return await api.get(`/chamber-stock?${queryParams.toString()}`);
};
   
export const fetchChamberStockById = async (id: string | string[]) => {
    let response = null

    if (Array.isArray(id)) {
        response = await api.post('/chamber-stock', { id });
    } else {
        response = await api.get(`/chamber-stock/${id}`)
    }

    return response
}

export const updateChamberStock = async ({
  othersItemId,
   id,
  data,
}: UpdateChamberStockPayload): Promise<any> => {
  const response = await api.patch(
    `/other-product/update-quantity/${othersItemId}/${id}`,
    data
  );
  return response.data;
};

export const getChamberStockProduction = async (productName: string): Promise<any> => {
    const response = await api.get(`/chamber-stock/stock/${productName}`);
    return response;
};
