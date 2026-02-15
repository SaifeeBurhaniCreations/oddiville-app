import api from "../lib/axios";

export const fetchPackages = async (searchText) => {
    const queryParams = new URLSearchParams();

    if (searchText) queryParams.append("search", String(searchText));

    return await api.get(`/package?${queryParams.toString()}`);
}