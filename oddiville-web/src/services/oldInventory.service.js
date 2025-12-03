import api from "../lib/axios";

export const bulkIngest = async (data) => {
    const response = await api.post(`/old-inventory/bulk-ingest`, data);
    return response.data;
  };