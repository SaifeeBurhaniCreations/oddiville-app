import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchPackageById, fetchPackageByName, fetchPackages, createPackage, addPackageType, updatePackageQuantity } from '../services/packages.service';
import { socket } from '../lib/notificationSocket';
import { rejectEmptyOrNull } from '../utils/authUtils';

export type StoredImage = {
  url: string;
  key: string;
};

export type Package = {
  id: string;
  product_name: string;
  types: Array<{
    size: string;
    quantity: string;
    unit: 'kg' | 'gm' | null;
  }> | null;
  raw_materials: string[];
  image?: StoredImage | null;
  package_image?: StoredImage | null;
};

export type CreatePackageDTO = {
  product_name: string;
  types: Array<{
    quantity: string;
    size: string;
    unit: "kg" | "gm" | null;
  }>;
  raw_materials: string[];
  chamber_name: string;
};

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

export function usePackageSocketSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const listener = ({ id }: { id?: string }) => {
      console.log("📦 socket received package update", id);
      
      queryClient.invalidateQueries({ queryKey: ["packages"] });

      if (id) {
        queryClient.invalidateQueries({ queryKey: ["package", id] });
      }
    };

    socket.on("package:updated", listener);

    return () => {
      socket.off("package:updated", listener);
    };
  }, [queryClient]);
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

    // useEffect(() => {
    //     const listener = (updatedPackage: Package) => {
    //         if (!updatedPackage?.id) return;

    //         queryClient.setQueryData(['packages'], (oldData: Package[] = []) => {
    //             const index = oldData.findIndex(pkg => pkg.id === updatedPackage.id);
    //             if (index !== -1) {
    //                 const newData = [...oldData];
    //                 newData[index] = updatedPackage;
    //                 return newData;
    //             }
    //             return [...oldData, updatedPackage];
    //         });

    //         queryClient.setQueryData(['package', updatedPackage.id], updatedPackage);
    //     };

    //     socket.on('package:receive', listener);
    //     return () => {
    //         socket.off('package:receive', listener);
    //     };
    // }, [queryClient]);

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

  return useQuery({
    queryKey: ['package', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetchPackageById(id);
      return response?.data ?? null;
    },
    enabled: !!id,
    initialData: () => {
      const packages = queryClient.getQueryData<Package[]>(['packages']);
      return packages?.find(p => p.id === id);
    },
    staleTime: 0, 
  });
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
    mutationFn: async (formData: FormData) => {
      const response = await createPackage(formData);
      return response.data as Package;
    },
    onSuccess: (newPackage) => {
      if (!newPackage?.id) return;

      socket.emit("package-id:send", newPackage);

      queryClient.setQueryData(
        ["packages"],
        (oldPackages: Package[] = []) => [...oldPackages, newPackage]
      );

      queryClient.setQueryData(
        ["package", newPackage.id],
        newPackage
      );
    },
  });
}

// export function useUpdatePackage() {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async ({ id, data }: { id: string; data: UpdatePackageDTO }) => {
//             const response = await updatePackage({ id, data });
//             return response.data;
//         },
//         onSuccess: (updatedPackage) => {
//             if (!updatedPackage?.id) return;

//             socket.emit('package-id:send', updatedPackage);

//             queryClient.setQueryData(['packages'], (oldPackages: Package[] = []) => {
//                 const index = oldPackages.findIndex(pkg => pkg.id === updatedPackage.id);
//                 if (index !== -1) {
//                     const newPackages = [...oldPackages];
//                     newPackages[index] = updatedPackage;
//                     return newPackages;
//                 }
//                 return oldPackages;
//             });

//             queryClient.setQueryData(['package', updatedPackage.id], updatedPackage);
//         },
//     });
// }

export function useAddPackageType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        product_name: string;
        size: string;
        unit: "kg" | "gm" | null;
        quantity: string;
      };
    }) => {
      const response = await addPackageType({ id, data });
      return response.data as Package;
    },

    // onSuccess: (updatedPackage) => {
    //   if (!updatedPackage?.id) return;

    //   socket.emit("package-id:send", updatedPackage);

    //   queryClient.setQueryData(
    //     ["packages"],
    //     (old: Package[] = []) =>
    //       old.map((pkg) =>
    //         pkg.id === updatedPackage.id ? updatedPackage : pkg
    //       )
    //   );

    //   queryClient.setQueryData(
    //     ["package", updatedPackage.id],
    //     updatedPackage
    //   );
    // },
  });
}

export function useIncreasePackageQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        size: string;
        unit: "kg" | "gm" | null;
        quantity: string;
      };
    }) => {
      const response = await updatePackageQuantity({ id, data });
      return response.data as Package;
    },

    // onSuccess: (updatedPackage) => {
    //   if (!updatedPackage?.id) return;

    //   socket.emit("package-id:send", updatedPackage);

    //   queryClient.setQueryData(
    //     ["packages"],
    //     (old: Package[] = []) =>
    //       old.map((pkg) =>
    //         pkg.id === updatedPackage.id ? updatedPackage : pkg
    //       )
    //   );

    //   queryClient.setQueryData(
    //     ["package", updatedPackage.id],
    //     updatedPackage
    //   );
    // },
  });
}