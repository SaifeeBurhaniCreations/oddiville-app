import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
  QueryClient,
} from "@tanstack/react-query";
import useSocket from "@/src/hooks/useSocketFromContext";
import { useEffect, useMemo, useState } from "react";
import {
  fetchVendors,
  fetchVendorById,
  updateVendor,
  fetchVendorByName,
  fetchAllVendors,
  removeVendor,
} from "@/src/services/vendor.service";
import { UnparsedVendor, UserProps, VendorOrder } from "../types";
import { rejectEmptyOrNull } from "../utils/authUtils";
import PencilIcon from "../components/icons/common/PencilIcon";
import { parseVendorsWithDates } from "../utils/vendor";
import { AxiosError } from "axios";

// export type Vendor = {
//   id: string;
//   name: string;
//   phone: string;
//   address: string;
//   alias: string;
//   state: { name: string; isoCode: string };
//   city: string;
//   zipcode: string;
//   materials: string[];
//   orders: VendorOrder[];
// };

// export type VendorsPage = {
//   data: Vendor[];
//   nextOffset?: number;
// };

export function updateAllVendorLists(
  queryClient: QueryClient,
  updated: Vendor
) {
  const lists = queryClient.getQueriesData<unknown>({ queryKey: ["vendors"] });

  lists.forEach(([key, data]) => {
    if (!data || typeof data !== "object" || !("pages" in (data as any)))
      return;

    const inf = data as InfiniteData<VendorsPage>;
    const pages = inf.pages.map((page) => ({
      ...page,
      data: page.data.map((v) => (v.id === updated.id ? updated : v)),
    }));

    queryClient.setQueryData(key, { ...inf, pages });
  });

  queryClient.setQueryData<Vendor[]>(["vendors"], (old = []) => {
    const idx = old.findIndex((v) => v.id === updated.id);
    if (idx === -1) return [updated, ...old];
    const copy = old.slice();
    copy[idx] = updated;
    return copy;
  });
}

function getAllCachedVendors(queryClient: QueryClient): Vendor[] {
  const cached = queryClient.getQueryData<any>(["vendors"]);

  if (!cached) return [];

  if (cached.pages && Array.isArray(cached.pages)) {
    try {
      return cached.pages.flatMap((p: any) =>
        Array.isArray(p.data) ? p.data : []
      );
    } catch (e) {
      console.error("getAllCachedVendors: failed to flatten pages", e);
      return [];
    }
  }

  if (Array.isArray(cached)) {
    return cached as Vendor[];
  }

  return [];
}

export function useAllVendors() {
  return useQuery<Vendor[]>({
    queryKey: ["vendors", "all"],
    queryFn: rejectEmptyOrNull(async () => {
      const res = await fetchAllVendors();
      const data = res.data ?? [];
      return Array.isArray(data) ? data : Object.values(data ?? {});
    }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export type Vendor = {
  id: string;
  name: string;
  phone: string;
  address: string;
  alias: string;
  state: { name: string; isoCode: string };
  city: string;
  zipcode: string;
  materials: string[];
  orders: VendorOrder[];
};

export type VendorsPage = {
  data: Vendor[];
  nextOffset?: number;
};

const LIMIT = 10;
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function safeStringifyDate(d: unknown) {
  if (d == null) return undefined;
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  return String(d);
}

function normalizeVendorForCache(v: any): Vendor {
  const state = {
    name:
      v?.state?.name ?? (typeof v?.state === "string" ? v.state : "Unknown"),
    isoCode:
      v?.state?.isoCode ??
      (typeof v?.state === "object" && v?.state?.isoCode
        ? v.state.isoCode
        : ""),
  };

  return {
    id: String(v?.id ?? ""),
    name: v?.name ?? "",
    phone: v?.phone ?? "",
    address: v?.address ?? "",
    alias: v?.alias ?? "",
    state,
    city: v?.city ?? "",
    zipcode: v?.zipcode ?? "",
    materials: Array.isArray(v?.materials) ? v.materials : [],
    orders: (v?.orders ?? []) as VendorOrder[],
  } as Vendor;
}

function toUIUnparsedVendor(v: Vendor): UnparsedVendor {
  return {
    ...v,
    state:
      typeof v.state === "object"
        ? String(v.state.name ?? "")
        : String(v.state ?? ""),
    orders: (v.orders ?? []).map((o: any) => ({
      ...o,
      order_date: safeStringifyDate(o.order_date) ?? null,
      arrival_date: safeStringifyDate(o.arrival_date) ?? null,
      est_arrival_date: safeStringifyDate(o.est_arrival_date) ?? null,
    })),
  } as UnparsedVendor;
}

export function useVendors(searchText: string) {
  const queryClient = useQueryClient();
  const { socket, connected } = useSocket();

  const debouncedSearch = useDebouncedValue(searchText, 350);

  useEffect(() => {
    if (!socket || !connected) return;

    const addHandler = (payload: any) => {
      try {
        const newVendor = normalizeVendorForCache(payload);

        queryClient.setQueryData<InfiniteData<VendorsPage> | undefined>(
          ["vendors"],
          (old) => {
            const current: InfiniteData<VendorsPage> = old ?? {
              pages: [{ data: [newVendor], nextOffset: undefined }],
              pageParams: [0],
            };

            const exists = current.pages.some((page) =>
              page.data.some((v) => v.id === newVendor.id)
            );
            if (exists) return current;

            const newPages = current.pages.map((p, idx) =>
              idx === 0 ? { ...p, data: [newVendor, ...p.data] } : p
            );

            return { ...current, pages: newPages };
          }
        );
      } catch (err) {
        console.error("socket vendor:created handler error", err);
      }
    };

    const updateHandler = (payload: any) => {
      try {
        const updated = normalizeVendorForCache(payload);
        queryClient.setQueryData<InfiniteData<VendorsPage> | undefined>(
          ["vendors"],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              data: page.data.map((v) => (v.id === updated.id ? updated : v)),
            }));
            return { ...old, pages };
          }
        );
      } catch (err) {
        console.error("socket vendor:updated handler error", err);
      }
    };

    const deleteHandler = (payload: any) => {
      try {
        const idToRemove = payload?.id ?? payload;
        if (!idToRemove) return;
        queryClient.setQueryData<InfiniteData<VendorsPage> | undefined>(
          ["vendors"],
          (old) => {
            if (!old) return old;
            const pages = old.pages.map((page) => ({
              ...page,
              data: page.data.filter((v) => v.id !== idToRemove),
            }));
            return { ...old, pages };
          }
        );
      } catch (err) {
        console.error("socket vendor:deleted handler error", err);
      }
    };

    const unsubAdd = socket.on("vendor:created", addHandler);
    const unsubUpdate = socket.on("vendor:updated", updateHandler);
    const unsubDelete = socket.on("vendor:deleted", deleteHandler);

    return () => {
      socket.off("vendor:created", addHandler);
      socket.off("vendor:updated", updateHandler);
      socket.off("vendor:deleted", deleteHandler);
    };
  }, [socket, connected, queryClient]);

  const infiniteQuery = useInfiniteQuery<VendorsPage, Error>({
    queryKey: ["vendors"],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const res = await fetchVendors({ limit: LIMIT, offset });
      return {
        data: (res.data ?? []).map(normalizeVendorForCache),
        nextOffset:
          (res.data?.length ?? 0) === LIMIT ? offset + LIMIT : undefined,
      } as VendorsPage;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 5 * 60 * 1000,
    // @ts-ignore
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const cachedVendors: Vendor[] = useMemo(() => {
    const inf = infiniteQuery.data as InfiniteData<VendorsPage> | undefined;
    const pages = inf?.pages ?? [];
    return pages.flatMap((p) => p.data ?? []) as Vendor[];
  }, [infiniteQuery.data]);

  const parsedFromCache = useMemo(() => {
    try {
      if (typeof parseVendorsWithDates === "function") {
        const unparsed = cachedVendors.map(toUIUnparsedVendor);
        return parseVendorsWithDates(unparsed);
      }
      return cachedVendors;
    } catch (e) {
      console.error("parseVendorsWithDates error:", e);
      return cachedVendors;
    }
  }, [cachedVendors]);

  const cachedMatches = useMemo(() => {
    const s = debouncedSearch?.trim().toLowerCase();
    if (!s) return [] as typeof parsedFromCache;
    return parsedFromCache.filter((v) =>
      (v.name ?? "").toLowerCase().startsWith(s)
    );
  }, [parsedFromCache, debouncedSearch]);

  const [serverSearchResults, setServerSearchResults] = useState<
    Vendor[] | null
  >(null);
  const [serverSearchLoading, setServerSearchLoading] = useState(false);
  const [serverSearchError, setServerSearchError] = useState<Error | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const s = debouncedSearch?.trim();
      if (!s) {
        setServerSearchResults(null);
        setServerSearchError(null);
        setServerSearchLoading(false);
        return;
      }

      if ((cachedMatches?.length ?? 0) > 0) {
        setServerSearchResults(null);
        setServerSearchError(null);
        setServerSearchLoading(false);
        return;
      }

      try {
        setServerSearchLoading(true);
        setServerSearchError(null);
        const res = await fetchVendors({ limit: LIMIT, offset: 0, search: s });
        if (cancelled) return;
        const normalized = (res.data ?? []).map(normalizeVendorForCache);

        const parsed =
          typeof parseVendorsWithDates === "function"
            ? parseVendorsWithDates(normalized.map(toUIUnparsedVendor))
            : normalized;

        setServerSearchResults(normalized);
        setServerSearchLoading(false);
      } catch (err: any) {
        if (cancelled) return;
        setServerSearchError(err);
        setServerSearchLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, cachedMatches]);

  const finalParsedVendors = useMemo(() => {
    if (debouncedSearch?.trim()) {
      if ((cachedMatches?.length ?? 0) > 0) {
        return cachedMatches;
      }
      if (serverSearchResults && serverSearchResults.length > 0) {
        try {
          if (typeof parseVendorsWithDates === "function") {
            return parseVendorsWithDates(
              serverSearchResults.map(toUIUnparsedVendor)
            );
          }
          return serverSearchResults;
        } catch (e) {
          console.error("parseVendorsWithDates error on server results:", e);
          return serverSearchResults;
        }
      }
      return [];
    }
    return parsedFromCache;
  }, [debouncedSearch, cachedMatches, serverSearchResults, parsedFromCache]);

  const formattedVendor: UserProps[] = useMemo(
    () =>
      finalParsedVendors.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        username: vendor.id,
        extra_details: `+91 ${vendor.phone ?? ""}`,
        bottomConfig: {
          title: "Address",
          description: vendor.address ?? "",
        },
        icon: PencilIcon,
        href: "vendor-create",
        cardref: "vendor-orders",
        disabled: false,
        color: "green",
      })),
    [finalParsedVendors]
  );
  return {
    _vendors: finalParsedVendors,
    vendors: formattedVendor,
    isServerSearching: serverSearchLoading,
    serverSearchError,

    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading || serverSearchLoading,
    refetch: infiniteQuery.refetch,
    _raw: infiniteQuery.data,
    isFetching: infiniteQuery.isFetching,
    fetchStatus: infiniteQuery.fetchStatus,
    queryClient,
  };
}

// export function useVendors(searchText: string) {
//   const queryClient = useQueryClient();
//   const socket = useSocket();

//   // const searchTextRef = useRef(searchText);
//   // useEffect(() => { searchTextRef.current = searchText; }, [searchText]);

//   // useEffect(() => {
//   //   if (!socket || !socket.connected) return;

//   //   const handleVendorCreated = (payload: Vendor) => {
//   //     const item = payload;
//   //     const currentSearch = searchTextRef.current ?? "";
//   //     console.log("vendor:created payload", item, "currentSearch:", currentSearch);

//   //     queryClient.setQueryData<InfiniteData<VendorsPage>>(
//   //       ["vendors", currentSearch],
//   //       (old) => {
//   //         if (!old) {
//   //           const matches =
//   //             !currentSearch ||
//   //             item.name.toLowerCase().includes(currentSearch.toLowerCase());
//   //           if (!matches) return old;
//   //           return {
//   //             pages: [{ data: [item], nextOffset: undefined }],
//   //             pageParams: [0],
//   //           };
//   //         }

//   //         const alreadyExists = old.pages.some((p) =>
//   //           p.data.some((v) => String(v.id) === String(item.id))
//   //         );
//   //         if (alreadyExists) return old;

//   //         const matches =
//   //           !currentSearch ||
//   //           item.name.toLowerCase().includes(currentSearch.toLowerCase());
//   //         if (!matches) return old;

//   //         const first = old.pages[0] ?? { data: [], nextOffset: undefined };
//   //         const newFirst = { ...first, data: [item, ...first.data] };

//   //         return {
//   //           ...old,
//   //           pages: [newFirst, ...old.pages.slice(1)],
//   //           pageParams: old.pageParams,
//   //         };
//   //       }
//   //     );

//   //     queryClient.setQueryData<Vendor[]>(["vendors"], (old = []) => {
//   //       if (old.some((v) => String(v.id) === String(item.id))) return old;
//   //       return [item, ...old];
//   //     });
//   //   };

//   //   const unsubscribe = socket.on("vendor:created", handleVendorCreated);
//   //   return () => {
//   //     unsubscribe?.();
//   //     try {
//   //       socket.off?.("vendor:created", handleVendorCreated);
//   //     } catch (e) {}
//   //   };
//   // }, [queryClient, socket]);

//   // return useInfiniteQuery<VendorsPage, Error>({
//   //   queryKey: ["vendors", searchText],
//   //   queryFn: rejectEmptyOrNull(async (context) => {
//   //     const { pageParam = 0 } = context;
//   //     const offset = typeof pageParam === "number" ? pageParam : 0;
//   //     const res = await fetchVendors({
//   //       search: searchText,
//   //       limit: 10,
//   //       offset,
//   //     });

//   //     return {
//   //       data: res.data ?? [],
//   //       nextOffset: (res.data?.length ?? 0) === 10 ? offset + 10 : undefined,
//   //     };
//   //   }),
//   //   initialPageParam: 0,
//   //   getNextPageParam: (lastPage) => lastPage.nextOffset,
//   //   staleTime: 5 * 60 * 1000,
//   //   // @ts-ignore
//   //   keepPreviousData: true,
//   //   refetchOnWindowFocus: false,
//   //   refetchOnMount: false,
//   // });
// }

export function useVendorById(id: string | null) {
  const queryClient = useQueryClient();
  const socket = useSocket();

  const cachedVendor = id ? getAllCachedVendors(queryClient).find((v) => v.id === id) : undefined;

  useEffect(() => {
    if (!id || !socket) return;

    const handleVendorUpdated = (payload: any) => {
      const vendor: Vendor | undefined = payload?.vendor ?? payload;

      if (!vendor) return;
      if (!vendor.id) return;
      if (vendor.id !== id) return;

      queryClient.setQueryData(["vendor-by-id", id], vendor);
      updateAllVendorLists(queryClient, vendor);
    };

    socket.on("vendor:updated", handleVendorUpdated);
    return () => {
      socket.off("vendor:updated", handleVendorUpdated);
    };
  }, [id, queryClient, socket]);

  return useQuery<Vendor | null>({
    queryKey: ["vendor-by-id", id],
    queryFn: rejectEmptyOrNull(async () => {
      if (!id) return null;

      const lists = queryClient.getQueriesData<unknown>({ queryKey: ["vendors"] });
      for (const [, data] of lists) {
        if (!data || typeof data !== "object" || !("pages" in (data as any))) continue;
        const inf = data as InfiniteData<VendorsPage>;
        for (const page of inf.pages) {
          const hit = page.data.find((v) => v.id === id);
          if (hit) return hit;
        }
      }

      const response = await fetchVendorById(id);
      return response.data ?? null;
    }),
    enabled: !!id,
    initialData: cachedVendor,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useVendorByName(name: string | null) {
  const queryClient = useQueryClient();
  const normalize = (str: string) => str.toLowerCase().trim();

  const cachedVendor = name
    ? getAllCachedVendors(queryClient).find(
        (vendor) => normalize(vendor.name) === normalize(name)
      )
    : undefined;

  return useQuery({
    queryKey: ["vendor-name", name],
    queryFn: rejectEmptyOrNull(async () => {
      const res = await fetchVendorByName(name!);
      return res.data ?? null;
    }),
    enabled: !!name,
    initialData: cachedVendor,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vendor> }) => {
      const response = await updateVendor(id, data);
      return response.data;
    },
    onSuccess: (updatedVendor, { id }) => {
      queryClient.setQueryData(["vendor-by-id", id], updatedVendor);
      updateAllVendorLists(queryClient, updatedVendor);
      queryClient.setQueryData<Vendor[]>(["vendors"], (old = []) => {
        const idx = old.findIndex((v) => v.id === updatedVendor.id);
        if (idx === -1) return [updatedVendor, ...old];
        const copy = old.slice();
        copy[idx] = updatedVendor;
        return copy;
      });
    },
    onError: (error) => {
      console.error("Error updating vendor:", error);
    },
  });
}

type DeleteVarsVendor = { id: string };

type DeleteOnMutateContextVendor = {
  previousVendors?: Vendor[] | undefined;
  previousInfinite?: Array<[string, unknown]> | undefined; // snapshot of queries (optional)
  previousById?: Vendor | null | undefined;
  previousByName?: Vendor | null | undefined;
  maybeName?: string | undefined;
};

function removeVendorFromInfinitePages(
  queryClient: ReturnType<typeof useQueryClient>,
  idToRemove: string
) {
  const lists = queryClient.getQueriesData<unknown>({ queryKey: ["vendors"] });
  lists.forEach(([key, data]) => {
    if (!data || typeof data !== "object" || !("pages" in (data as any)))
      return;

    const inf = data as InfiniteData<VendorsPage>;
    const pages = inf.pages.map((page) => ({
      ...page,
      data: page.data.filter((v) => v.id !== idToRemove),
    }));
    queryClient.setQueryData(key, { ...inf, pages });
  });
}

export function useDeleteVendor() {
  const qc = useQueryClient();

  return useMutation<
    void,
    AxiosError | Error,
    DeleteVarsVendor,
    DeleteOnMutateContextVendor
  >({
    mutationFn: async ({ id }: DeleteVarsVendor) => {
      await removeVendor(id);
    },

    onMutate: async ({ id }: DeleteVarsVendor) => {
      await qc.cancelQueries({ queryKey: ["vendors"] });
      await qc.cancelQueries({ queryKey: ["vendor-by-id", id] });

      const previousVendors = qc.getQueryData<Vendor[]>(["vendors"]);

      const previousById = qc.getQueryData<Vendor | null>(["vendor-by-id", id]);

      let maybeName: string | undefined;
      if (previousById && previousById.name) maybeName = previousById.name;
      else if (previousVendors) {
        const hit = previousVendors.find((v) => v.id === id);
        if (hit && hit.name) maybeName = hit.name;
      }

      const previousByName =
        maybeName !== undefined
          ? qc.getQueryData<Vendor | null>(["vendor-name", maybeName])
          : undefined;

      if (previousVendors) {
        qc.setQueryData<Vendor[] | undefined>(["vendors"], (old = []) =>
          old.filter((v) => v.id !== id)
        );
      }

      try {
        removeVendorFromInfinitePages(qc, id);
      } catch (err) {
        console.error("optimistic removal from infinite pages failed", err);
      }

      qc.removeQueries({ queryKey: ["vendor-by-id", id], exact: true });
      if (maybeName)
        qc.removeQueries({ queryKey: ["vendor-name", maybeName], exact: true });

      return { previousVendors, previousById, previousByName, maybeName };
    },

    onError: (err, variables, context) => {
      if (context?.previousVendors) {
        qc.setQueryData<Vendor[] | undefined>(
          ["vendors"],
          context.previousVendors
        );
      }

      if (context?.previousById) {
        qc.setQueryData<Vendor | null>(
          ["vendor-by-id", variables.id],
          context.previousById
        );
      }

      if (context?.maybeName && context.previousByName) {
        qc.setQueryData<Vendor | null>(
          ["vendor-name", context.maybeName],
          context.previousByName
        );
      }
    },

    onSuccess: (_data, variables, _context) => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
    },

    onSettled: (_data, _error, variables, context) => {
      qc.invalidateQueries({ queryKey: ["vendors"] });
      qc.invalidateQueries({ queryKey: ["vendor-by-id", variables.id] });
      if (context?.maybeName)
        qc.invalidateQueries({ queryKey: ["vendor-name", context.maybeName] });
    },
  });
}
