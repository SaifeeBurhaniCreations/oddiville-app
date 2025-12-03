import api from "@/src/lib/axios";

export const fetchLanes = () => api.get('/lane')
export const fetchLanesById = (id: string) => api.get(`/lane/${id}`)