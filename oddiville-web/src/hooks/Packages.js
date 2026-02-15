import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPackages } from '../services/packages.service';
import { rejectEmptyOrNull } from '../util/validation';

function useDebounce(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function usePackages(searchText) {
    const debouncedText = useDebounce(searchText, 300);

    const query = useQuery({
        queryKey: ['packages'],
        queryFn: rejectEmptyOrNull(async () => {
            const response = await fetchPackages('');
            return response?.data || [];
        }),
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

const cached = Array.isArray(query.data) ? query.data : [];

    const filtered =
        debouncedText.length > 0
            ? cached.filter((pkg) =>
                pkg.product_name
                    .toLowerCase()
                    .startsWith(debouncedText.toLowerCase())
            )
            : cached;

    const fromCache = !query.isLoading;

    return {
        data: filtered,
        isFetching: query.isFetching,
        isLoading: query.isLoading,
        fromCache,
        refetch: query.refetch,
    };
}
