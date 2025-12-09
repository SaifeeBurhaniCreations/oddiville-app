import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPackageById, fetchPackageByName, fetchPackages, createPackage, updatePackage } from '../services/packages.service';
import { socket } from '../lib/notificationSocket';
import { rejectEmptyOrNull } from '../utils/authUtils';

export type Package = {
    id: string;
    product_name: string;
    types: Array<{
        size: string;
        quantity: string;
        unit: 'kg' | 'gm' | null;
    }> | null;
    raw_materials: string[];
}

export type CreatePackageDTO = {
    product_name: string;
    types: Array<{
        quantity: string;
        size: string;
        unit: "kg" | "gm" | null;
    }>;
    raw_materials: string[];
    chamber_name: string;
}

export type UpdatePackageDTO = {
    product_name: string;
    size: string;
    quantity: string;
    unit: "kg" | "gm" | null;
};

function useDebounce(value: string, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function usePackages(searchText: string) {
    const queryClient = useQueryClient();
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

    useEffect(() => {
        const listener = (updatedPackage: Package) => {
            if (!updatedPackage?.id) return;

            queryClient.setQueryData(['packages'], (oldData: Package[] = []) => {
                const index = oldData.findIndex(pkg => pkg.id === updatedPackage.id);
                if (index !== -1) {
                    const newData = [...oldData];
                    newData[index] = updatedPackage;
                    return newData;
                }
                return [...oldData, updatedPackage];
            });

            queryClient.setQueryData(['package', updatedPackage.id], updatedPackage);
        };

        socket.on('package:receive', listener);
        return () => {
            socket.off('package:receive', listener);
        };
    }, [queryClient]);

    const cached = query.data || [];
    const filtered =
        debouncedText.length > 0
            ? cached.filter((pkg: Package) =>
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

export function usePackageById(id: string | null) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['package', id],
        queryFn: rejectEmptyOrNull(async () => {
            if (!id) return null;

            const cachedPackages = queryClient.getQueryData<Package[]>(['packages']);
            if (cachedPackages) {
                const cachedPackage = cachedPackages.find(p => p.id === id);
                if (cachedPackage) return cachedPackage;
            }

            const response = await fetchPackageById(id);
            return response?.data ?? null;
        }),
        enabled: !!id,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        if (!id) return;
        const listener = (data: Package) => {
            if (data?.id === id) {
                queryClient.setQueryData(['package', id], data);
            }
        };
        socket.on('package-id:receive', listener);
        return () => {
            socket.off('package-id:receive', listener);
        };
    }, [queryClient, id]);

    return query;
}

export function usePackageByName(name: string | null) {
    const queryClient = useQueryClient();
    
    useEffect(() => {
        if (!name) return;
        const listener = (data: Package | null) => {

            if (data?.id) {
                queryClient.setQueryData(['packageName', name], data);
            }
        };
        socket.on('package-name:receive', listener);
        return () => {
            socket.off('package-name:receive', listener);
        };
    }, [queryClient, name]);


    return useQuery<Package | null>({
        queryKey: ['packageName', name],
        queryFn: rejectEmptyOrNull(async () => {
            if (!name) return null;

            const cachedPackages = queryClient.getQueryData<Package[]>(['packages']);

            if (cachedPackages) {
                const cachedPackage = cachedPackages.find(p => p.product_name === name);
                if (cachedPackage) return cachedPackage;
            }

            const response = await fetchPackageByName(name);
            return response?.data ?? null;
        }),
        enabled: !!name,
        staleTime: 1000 * 60 * 60,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

export function useCreatePackage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreatePackageDTO) => {
            const response = await createPackage(data);
            return response.data as Package;
        },
        onSuccess: (newPackage) => {
            if (!newPackage?.id) return;

            socket.emit('package-id:send', newPackage);

            queryClient.setQueryData(['packages'], (oldPackages: Package[] = []) => [...oldPackages, newPackage]);

            queryClient.setQueryData(['package', newPackage.id], newPackage);
        },
    });
}

export function useUpdatePackage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdatePackageDTO }) => {
            const response = await updatePackage({ id, data });
            return response.data;
        },
        onSuccess: (updatedPackage) => {
            if (!updatedPackage?.id) return;

            socket.emit('package-id:send', updatedPackage);

            queryClient.setQueryData(['packages'], (oldPackages: Package[] = []) => {
                const index = oldPackages.findIndex(pkg => pkg.id === updatedPackage.id);
                if (index !== -1) {
                    const newPackages = [...oldPackages];
                    newPackages[index] = updatedPackage;
                    return newPackages;
                }
                return oldPackages;
            });

            queryClient.setQueryData(['package', updatedPackage.id], updatedPackage);
        },
    });
}

// export function useUpdatePackage() {
//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: UpdatePackageDTO }) => {
//       const response = await updatePackage({ id, data });
//       return response.data as Package;
//     },
//     onSuccess(_updatedPackage) {
//       // test mode: no cache update, no socket emit
//     },
//     onError(_error) {
//       // optional: console.log(_error);
//     },
//     onSettled() {
//       // nothing
//     },
//   });
// }