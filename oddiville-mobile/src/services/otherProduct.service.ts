import { OtherProductHistory } from "@/src/hooks/othersProducts";
import api from "@/src/lib/axios";

export const fetchOtherProductById = (id: string) => api.get(`/other-product/item/${id}`)

export const fetchOthersProductHistory = (id: string) => api.get<OtherProductHistory>(`/other-product/history/${id}`);