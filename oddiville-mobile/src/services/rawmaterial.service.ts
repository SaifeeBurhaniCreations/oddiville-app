import api from "@/src/lib/axios";
import { AxiosResponse } from 'axios';
import { RawMaterialOrderProps } from "../types";

export type FetchOrderParams = {
  status?: string;
  limit?: number;
  offset?: number;
};

export const fetchAllRawMaterial = async () => {
  return api.get("/raw-material/all");
}


export const addRawMaterialOrder = async (formData: any): Promise<AxiosResponse<RawMaterialOrderProps>> => {
  return api.post<RawMaterialOrderProps>('/raw-material/order', formData);
}


export async function fetchRawMaterialOrder(params: FetchOrderParams = {}): Promise<RawMaterialOrderProps[]> {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append("status", params.status);
  if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
  if (params.offset !== undefined) queryParams.append("offset", String(params.offset));

  const res = await api.get(`/raw-material/order?${queryParams.toString()}`);
  return res.data;
}

export const fetchRawMaterialOrderById = async (id: string): Promise<RawMaterialOrderProps> => {
  const res = await api.get(`/raw-material/order/${id}`);
  return res.data;
};

export const fetchRawMaterialOrderAll = async (): Promise<RawMaterialOrderProps[]> => {
  const res = await api.get(`/raw-material/order/all`);
  return res.data;
};

export const updateRawMaterialOrder = async (id: string, data: Record<string, any>): Promise<AxiosResponse<RawMaterialOrderProps>> => await api.patch(`/raw-material/order/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
