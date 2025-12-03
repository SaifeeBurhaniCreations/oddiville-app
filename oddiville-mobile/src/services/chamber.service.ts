import api from "@/src/lib/axios";

export const fetchChambers = () => api.get('/chamber')
export const fetchChamberById = (id: string) => api.get(`/chamber/${id}`)
export const fetchChambersByIds = (ids: string[]) => api.post(`/chamber/ids`, { ids })
export const fetchChamberByName = (id: string) => api.get(`/chamber/name/${id}`)
