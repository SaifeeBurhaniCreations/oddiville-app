import api from "@/src/lib/axios";
import { LocationDTO } from "../types/location.dto";

export const fetchLocations = async (): Promise<LocationDTO[]> => {
  const res = await api.get<LocationDTO[]>('/location');
  return res.data;
};