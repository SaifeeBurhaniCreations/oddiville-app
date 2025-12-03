import api from "@/src/lib/axios";

export const fetchLocations = () => api.get('/location')