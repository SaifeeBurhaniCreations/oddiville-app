import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import type { QueryKey, InfiniteData } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AdminNotification } from "@/src/types/notification";
import useSocket from "@/src/hooks/useSocketFromContext";
import { fetchNotificationsInformative, fetchNotificationsActionable, fetchNotificationsTodays, updateNotificationService } from "@/src/services/notification.service";

export type NotificationDetails = {
  id: string;
  identifier: string;
  type: string;
  title: string;
  badgeText: string;
  createdAt: string | Date;
  description: string | string[];
  category: string;
  read: boolean;
  extraData: any;
   color: "red" | "yellow" | "green" | null;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  type: string;
  details: NotificationDetails;
  description?: string[];
};

export type NotificationsPage = {
  data: Notification[];
  nextOffset: number | null;
};

export type FetchNotificationParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

const DEFAULT_PARAMS: FetchNotificationParams = { limit: 10, offset: 0 };

export function useInformativeNotifications(params: FetchNotificationParams = DEFAULT_PARAMS) {
  const qc = useQueryClient();
  const socket = useSocket();

  const queryKey: QueryKey = ["notifications", "informative", params];

  const initialInfiniteData =
    qc.getQueryData<InfiniteData<AdminNotification[]>>(queryKey) ?? undefined;

  const infiniteQuery = useInfiniteQuery<AdminNotification[], Error>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const offset = typeof pageParam === "number" ? pageParam : params.offset ?? 0;
      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      const res = await fetchNotificationsInformative({ ...params, limit, offset });
      return res.data as AdminNotification[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length === 0) return undefined;

      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      if (lastPage.length < limit) return undefined;

      return allPages.length * limit;
    },
    initialData: initialInfiniteData,
    initialPageParam: params.offset ?? 0,
    staleTime: 1000 * 60 * 5,
  });

  const flattenedData: AdminNotification[] = infiniteQuery.data?.pages?.flat() ?? [];

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handler = (payload: AdminNotification) => {
      if (!payload || !payload.id) return;

      qc.setQueryData<InfiniteData<AdminNotification[]>>(queryKey, (old) => {
        const current: InfiniteData<AdminNotification[]> = old ?? {
          pages: [[payload]],
          pageParams: [0],
        };

        const exists = current.pages.some((page) =>
          page.some((n) => n.id === payload.id)
        );
        if (exists) return current;

        const newPages = current.pages.map((p, idx) =>
          idx === 0 ? [payload, ...p] : p
        );

        return { ...current, pages: newPages };
      });
    };

    const unsubscribe = socket.on(
      "notification-informative:new",
      handler
    );

    return () => {
      unsubscribe?.();
    };
  }, [qc, socket, socket?.connected, JSON.stringify(params)]);
  
  return {
    data: flattenedData,
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    refetch: infiniteQuery.refetch,
    _raw: infiniteQuery.data,
    isFetching: infiniteQuery.isFetching,
    fetchStatus: infiniteQuery.fetchStatus,
  };
}

export function useActionableNotifications(params: FetchNotificationParams = DEFAULT_PARAMS) {
  const qc = useQueryClient();
  const socket = useSocket();

  const queryKey: QueryKey = ["notifications", "actionable", params];

  const initialInfiniteData =
    qc.getQueryData<InfiniteData<AdminNotification[]>>(queryKey) ?? undefined;

  const infiniteQuery = useInfiniteQuery<AdminNotification[], Error>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const offset = typeof pageParam === "number" ? pageParam : params.offset ?? 0;
      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      const res = await fetchNotificationsActionable({ ...params, limit, offset });
      return res.data as AdminNotification[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length === 0) return undefined;

      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      if (lastPage.length < limit) return undefined;

      return allPages.length * limit;
    },
    initialData: initialInfiniteData,
    initialPageParam: params.offset ?? 0,
    staleTime: 1000 * 60 * 5,
  });

  const flattenedData: AdminNotification[] = infiniteQuery.data?.pages?.flat() ?? [];

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handler = (payload: AdminNotification) => {
      if (!payload || !payload.id) return;

      qc.setQueryData<InfiniteData<AdminNotification[]>>(queryKey, (old) => {
        const current: InfiniteData<AdminNotification[]> = old ?? {
          pages: [[payload]],
          pageParams: [0],
        };

        const exists = current.pages.some((page) =>
          page.some((n) => n.id === payload.id)
        );
        if (exists) return current;

        const newPages = current.pages.map((p, idx) =>
          idx === 0 ? [payload, ...p] : p
        );

        return { ...current, pages: newPages };
      });
    };

    const unsubscribe = socket.on(
      "notification-actionable:new",
      handler
    );

    return () => {
      unsubscribe?.();
    };
  }, [qc, socket, socket?.connected, JSON.stringify(params)]);

  return {
    data: flattenedData,
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    refetch: infiniteQuery.refetch,
    _raw: infiniteQuery.data,
    isFetching: infiniteQuery.isFetching,
    fetchStatus: infiniteQuery.fetchStatus,
  };
}

export function useTodaysNotifications(params: FetchNotificationParams = DEFAULT_PARAMS) {
  const qc = useQueryClient();
  const socket = useSocket();

  const queryKey: QueryKey = ["notifications", "today", params];

  const initialInfiniteData =
    qc.getQueryData<InfiniteData<AdminNotification[]>>(queryKey) ?? undefined;

  const infiniteQuery = useInfiniteQuery<AdminNotification[], Error>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const offset = typeof pageParam === "number" ? pageParam : params.offset ?? 0;
      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      const res = await fetchNotificationsTodays({ ...params, limit, offset });
      return res.data as AdminNotification[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!Array.isArray(lastPage) || lastPage.length === 0) return undefined;

      const limit = params.limit ?? DEFAULT_PARAMS.limit!;
      if (lastPage.length < limit) return undefined;

      return allPages.length * limit;
    },
    initialData: initialInfiniteData,
    initialPageParam: params.offset ?? 0,
    staleTime: 1000 * 60 * 5,
  });

  const flattenedData: AdminNotification[] = infiniteQuery.data?.pages?.flat() ?? [];

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handler = (payload: AdminNotification) => {
      if (!payload || !payload.id) return;

      qc.setQueryData<InfiniteData<AdminNotification[]>>(queryKey, (old) => {
        const current: InfiniteData<AdminNotification[]> = old ?? {
          pages: [[payload]],
          pageParams: [0],
        };

        const exists = current.pages.some((page) =>
          page.some((n) => n.id === payload.id)
        );
        if (exists) return current;

        const newPages = current.pages.map((p, idx) =>
          idx === 0 ? [payload, ...p] : p
        );

        return { ...current, pages: newPages };
      });
    };

    const unsubscribe = socket.on(
      "notification-today:new",
      handler
    );

    return () => {
      unsubscribe?.();
    };
  }, [qc, socket, socket?.connected, JSON.stringify(params)]);

  return {
    data: flattenedData,
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    refetch: infiniteQuery.refetch,
    _raw: infiniteQuery.data,
    isFetching: infiniteQuery.isFetching,
    fetchStatus: infiniteQuery.fetchStatus,
  };
}


type MarkReadVars = {
  id: string;
  read: boolean;
  updateQueryKeys?: QueryKey[];
};

type Context = {
  previous: Array<{ key: QueryKey; data: unknown }>;
};

export function useMarkNotificationRead() {
  const qc = useQueryClient();

  return useMutation<any, Error, MarkReadVars, Context>({
    mutationFn: async ({ id, read }: MarkReadVars) => {
      return await updateNotificationService(id, { read });
    },

    onMutate: async ({ id, read, updateQueryKeys }: MarkReadVars) => {
      await qc.cancelQueries({
        predicate: (query) => {
          const k = query.queryKey;
          return Array.isArray(k) && k[0] === "notifications";
        },
      });

      const previous: Array<{ key: QueryKey; data: unknown }> = [];

      const allQueries = qc.getQueriesData({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "notifications",
      });

      const queriesToTouch = (allQueries as Array<[QueryKey, unknown]>).filter(
        ([key]) => {
          if (!Array.isArray(key)) return false;
          if (updateQueryKeys && updateQueryKeys.length > 0) {
            return updateQueryKeys.some((reqKey) => {
              if (!Array.isArray(reqKey)) return false;
              return reqKey.every((k, i) => key[i] === reqKey[i]);
            });
          }
          return key[0] === "notifications";
        }
      );

      for (const [key, data] of queriesToTouch) {
        previous.push({ key, data });

        qc.setQueryData(key, (old) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return (old as AdminNotification[]).map((n) =>
              n.id === id ? { ...n, read } : n
            );
          }

          const od = old as InfiniteData<AdminNotification[]>;
          if (od && Array.isArray(od.pages)) {
            const newPages = od.pages.map((page) =>
              page.map((n) =>
                n.id === id ? { ...n, read } : n
              )
            );
            return { ...od, pages: newPages };
          }

          return old;
        });
      }

      return { previous };
    },

    onError: (err, vars, context) => {
      if (context?.previous && Array.isArray(context.previous)) {
        for (const item of context.previous) {
          qc.setQueryData(item.key, item.data as any);
        }
      }
    },

    onSettled: () => {
      qc.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0] === "notifications",
      });
    },
  });
}


export function countUnreadFromPages(
  data: InfiniteData<NotificationsPage> | undefined
): number {
  if (!data) return 0;
  return data.pages.reduce((sum, page) => {
    return (
      sum +
      page.data.filter((n: Notification) => !n.read).length
    );
  }, 0);
}

export function useUnreadNotificationCount(params: FetchNotificationParams = DEFAULT_PARAMS) {
  const { data: informativeData } = useInformativeNotifications(params);
  const { data: actionableData } = useActionableNotifications(params);
  const { data: todaysData } = useTodaysNotifications(params);

  const informativeUnread = informativeData.filter((n) => !n.read).length;
  const actionableUnread = actionableData.filter((n) => !n.read).length;
  const todaysUnread = todaysData.filter((n) => !n.read).length;

  const total = informativeUnread + actionableUnread + todaysUnread;

  return {
    total,
    informativeUnread,
    actionableUnread,
    todaysUnread,
  };
}
