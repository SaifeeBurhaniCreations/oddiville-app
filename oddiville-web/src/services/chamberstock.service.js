import api from "../lib/axios";
export const fetchChamberStock = async (params = {}) => {
  const queryParams = new URLSearchParams();

  if (params.limit !== undefined)
    queryParams.append("limit", String(params.limit));
  if (params.offset !== undefined)
    queryParams.append("offset", String(params.offset));
  if (params.search) queryParams.append("search", params.search);
  const response = await api.get(`/chamber-stock?${queryParams.toString()}`);
  return response.data;
};

export const updateChamberStock = async ({ id, data }) => {
  const response = await api.patch(`/chamber-stock/${id}`, data);
  return response.data;
};

export const fetchChambers = () => api.get("/chamber");
