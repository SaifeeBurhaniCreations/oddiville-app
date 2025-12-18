import api from "@/src/lib/axios";

type FetchVendorParams = {
    search?: string;
    limit?: number;
    offset?: number;
};

export const fetchPackages = async (searchText: string) => {
    const queryParams = new URLSearchParams();

    if (searchText) queryParams.append("search", String(searchText));

    return await api.get(`/package?${queryParams.toString()}`);
}
export const fetchPackageById = (id: string) => api.get(`/package/${id}`)
export const fetchPackageByName = (name: string) => api.get(`/package/product/${name}`)
export const createPackage = (formData: FormData) =>
  api.post(`/package/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
export const updatePackage = ({ data, id }: { data: any, id: string }) => api.patch(`/package/update/${id}`, data)

