import { useQuery } from "@tanstack/react-query";
import { fetchAllRawMaterial } from "../services/rawmaterial.service";
import { rejectEmptyOrNull } from "../utils/authUtils";

type RawMaterial = {
    id: string;
    name: string;
    sample_image: { key: string; url: string };
}

export const useRawMaterial = () =>
    useQuery<RawMaterial[]>({
        queryKey: ['raw-material'],
        queryFn: rejectEmptyOrNull(async () => {
            const response = await fetchAllRawMaterial();
            return response.data;
        }),
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
