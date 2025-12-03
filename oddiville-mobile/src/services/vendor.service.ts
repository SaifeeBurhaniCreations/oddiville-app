import api from "@/src/lib/axios";

export const addVendor = (formData: any) => api.post('/vendor/create', formData)

export type FetchVendorParams = {
    search?: string;
    limit?: number;
    offset?: number;
};

export async function fetchVendors(params: FetchVendorParams = {}) {
    const queryParams = new URLSearchParams();

    if (params.limit !== undefined) queryParams.append("limit", String(params.limit));
    if (params.offset !== undefined) queryParams.append("offset", String(params.offset));
    if (params.search) queryParams.append("search", params.search);

    return await api.get(`/vendor?${queryParams.toString()}`);
}

export const fetchAllVendors = () => api.get(`/vendor/all`);

export const fetchVendorById = (id: string) => api.get(`/vendor/${id}`);

export const fetchVendorByName = (name: string) => api.get(`/vendor/name/${name}`);

export const updateVendor = (id: string, data: any) => api.patch(`/vendor/update/${id}`, data);

export async function removeVendor(id: string) {
  return await api.delete(`/vendor/${id}`);
}