import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  fetchNotificationsActionable,
  fetchNotificationsInformative,
  fetchNotificationsTodays,
  updateNotificationService,
} from "@/src/services/notification.service";
import { socket } from "@/src/lib/notificationSocket";

/* ---------- Types (same as you had) ---------- */
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

export type UseNotificationsInformativeResult = UseInfiniteQueryResult<
  InfiniteData<NotificationsPage, unknown>,
  Error
> & { id: string | null };

export type UseNotificationsTodaysResult = UseInfiniteQueryResult<
  InfiniteData<NotificationsPage, unknown>,
  Error
> & { id: string | null };

export type UseNotificationsActionableResult = UseInfiniteQueryResult<
  InfiniteData<NotificationsPage, unknown>,
  Error
>;

/* ---------- Module-level singleton flags (one per category) ---------- */
let __NOTIF_INFORMATIVE_REGISTERED = false;
let __NOTIF_ACTIONABLE_REGISTERED = false;
let __NOTIF_TODAY_REGISTERED = false;

/* ---------- Utility: mergePages (keeps old pages + fresh without dupes) ---------- */
function mergePages(
  fresh: InfiniteData<NotificationsPage>,
  old?: InfiniteData<NotificationsPage>
): InfiniteData<NotificationsPage> {
  if (!old) return fresh;
  const oldFirst = old.pages[0] ?? { data: [], nextOffset: null };
  const freshFirst = fresh.pages[0] ?? { data: [], nextOffset: null };

  const seen = new Set(oldFirst.data.map((n) => n.id));
  const mergedFirst = {
    ...freshFirst,
    data: [...oldFirst.data, ...freshFirst.data.filter((n) => !seen.has(n.id))],
  };

  return {
    ...fresh,
    pages: [mergedFirst, ...fresh.pages.slice(1)],
    pageParams: fresh.pageParams,
  };
}

/* ---------- Hook: Informative (supports username) ---------- */
export function useNotificationsInformative(
  username: string | null
): UseNotificationsInformativeResult {
  const queryClient = useQueryClient();
  const latestQueryClientRef = useRef(queryClient);
  latestQueryClientRef.current = queryClient;

  const latestUsernameRef = useRef<string | null>(username);
  latestUsernameRef.current = username;

  const handlerRef = useRef<((n: Notification) => void) | undefined>(undefined);
  const anyHandlerRef = useRef<((event: string, data: any) => void) | undefined>(undefined);

  useEffect(() => {
    if (__NOTIF_INFORMATIVE_REGISTERED) return;
    __NOTIF_INFORMATIVE_REGISTERED = true;

    handlerRef.current = (notification: Notification) => {
      try {
        const curUser = latestUsernameRef.current;
        const key = curUser ? ["notifications-informative", curUser] : ["notifications-informative", "anon"];

        latestQueryClientRef.current.setQueryData<InfiniteData<NotificationsPage>>(key, (old) => {
          const item = notification;
          if (!old) {
            return { pages: [{ data: [item], nextOffset: null }], pageParams: [0] };
          }
          const first = old.pages[0] ?? { data: [], nextOffset: null };
          if (first.data.some((n) => n.id === item.id)) return old;
          const newFirst = { ...first, data: [item, ...first.data] };
          return { ...old, pages: [newFirst, ...old.pages.slice(1)] };
        });
      } catch (e) {
        console.error("informative notification handler error:", e);
      }
    };

    anyHandlerRef.current = (event: string, data: any) => {
      // optional global logger
      // console.log("SOCKET ANY (informative):", event, data);
    };

    const handler = handlerRef.current!;
    const anyHandler = anyHandlerRef.current!;

    if (!socket) return;

    // Attach single handler and rebind on connect (socket library may reconnect)
    socket.off("notification-informative:new", handler);
    socket.on("notification-informative:new", handler);

    socket.offAny(anyHandler);
    socket.onAny(anyHandler);

    const onConnect = () => {
      socket.off("notification-informative:new", handler);
      socket.on("notification-informative:new", handler);
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("notification-informative:new", handler);
      socket.offAny(anyHandler);
      socket.off("connect", onConnect);
      __NOTIF_INFORMATIVE_REGISTERED = false;
    };
  }, []); // run once (singleton)

  // Query for informative (uses username in key)
  const queryResult = useInfiniteQuery<NotificationsPage, Error>({
    queryKey: ["notifications-informative", username],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetchNotificationsInformative({ limit: 10, offset: pageParam as number });
      return {
        data: res.data ?? [],
        nextOffset: res.data?.length === 10 ? (pageParam as number) + 10 : null,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset,
    enabled: !!username,
    staleTime: Infinity,
    // @ts-ignore
    keepPreviousData: true,
    onSuccess: (fresh: any) => {
      queryClient.setQueryData<InfiniteData<NotificationsPage>>(["notifications-informative", username], (old) =>
        mergePages(fresh, old)
      );
    },
  });

  const id =
    (queryResult.data as InfiniteData<NotificationsPage> | undefined)?.pages?.[0]?.data?.[0]?.id ?? null;

  return { ...(queryResult as any), id } as UseNotificationsInformativeResult;
}

/* ---------- Hook: Actionable (supports username) ---------- */
export function useNotificationsActionable(username: string | null): UseNotificationsActionableResult {
  const queryClient = useQueryClient();
  const latestQueryClientRef = useRef(queryClient);
  latestQueryClientRef.current = queryClient;

  const latestUsernameRef = useRef<string | null>(username);
  latestUsernameRef.current = username;

  const handlerRef = useRef<((n: Notification) => void) | undefined>(undefined);
  const anyHandlerRef = useRef<((event: string, data: any) => void) | undefined>(undefined);

  useEffect(() => {
    if (__NOTIF_ACTIONABLE_REGISTERED) return;
    __NOTIF_ACTIONABLE_REGISTERED = true;

    handlerRef.current = (notification: Notification) => {
      try {
        const curUser = latestUsernameRef.current;
        const key = curUser ? ["notifications-actionable", curUser] : ["notifications-actionable", "anon"];

        latestQueryClientRef.current.setQueryData<InfiniteData<NotificationsPage>>(key, (old) => {
          const item = notification;
          if (!old) {
            return { pages: [{ data: [item], nextOffset: null }], pageParams: [0] };
          }
          const first = old.pages[0] ?? { data: [], nextOffset: null };
          if (first.data.some((n) => n.id === item.id)) return old;
          const newFirst = { ...first, data: [item, ...first.data] };
          return { ...old, pages: [newFirst, ...old.pages.slice(1)], pageParams: old.pageParams };
        });
      } catch (e) {
        console.error("actionable notification handler error:", e);
      }
    };

    anyHandlerRef.current = (event: string, data: any) => {
      // optional logger
    };

    const handler = handlerRef.current!;
    const anyHandler = anyHandlerRef.current!;

    if (!socket) return;

    socket.off("notification-actionable:new", handler);
    socket.on("notification-actionable:new", handler);

    socket.offAny(anyHandler);
    socket.onAny(anyHandler);

    const onConnect = () => {
      socket.off("notification-actionable:new", handler);
      socket.on("notification-actionable:new", handler);
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("notification-actionable:new", handler);
      socket.offAny(anyHandler);
      socket.off("connect", onConnect);
      __NOTIF_ACTIONABLE_REGISTERED = false;
    };
  }, []);

  return useInfiniteQuery<NotificationsPage, Error>({
    queryKey: ["notifications-actionable", username],
    queryFn: async (context) => {
      const { pageParam = 0 } = context;
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const res = await fetchNotificationsActionable({ limit: 10, offset });
      return { data: res.data ?? [], nextOffset: res.data?.length === 10 ? offset + 10 : null };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
    // @ts-ignore
    keepPreviousData: true,
  }) as UseNotificationsActionableResult;
}

/* ---------- Hook: Todays (supports username) ---------- */
export function useNotificationsTodays(username: string | null): UseNotificationsTodaysResult {
  const queryClient = useQueryClient();
  const latestQueryClientRef = useRef(queryClient);
  latestQueryClientRef.current = queryClient;

  const latestUsernameRef = useRef<string | null>(username);
  latestUsernameRef.current = username;

  const handlerRef = useRef<((n: Notification) => void) | undefined>(undefined);
  const anyHandlerRef = useRef<((event: string, data: any) => void) | undefined>(undefined);

  useEffect(() => {
    if (__NOTIF_TODAY_REGISTERED) return;
    __NOTIF_TODAY_REGISTERED = true;

    handlerRef.current = (notification: Notification) => {
      try {
        const curUser = latestUsernameRef.current;
        const key = curUser ? ["notifications-today", curUser] : ["notifications-today", "anon"];

        latestQueryClientRef.current.setQueryData<InfiniteData<NotificationsPage> & { id?: string }>(key, (old) => {
          const item = notification;
          if (!old) {
            return { pages: [{ data: [item], nextOffset: null }], pageParams: [0], id: item.id };
          }
          const first = old.pages[0] ?? { data: [], nextOffset: null };
          if (first.data.some((n) => n.id === item.id)) return old;
          const newFirst = { ...first, data: [item, ...first.data] };
          return { ...old, pages: [newFirst, ...old.pages.slice(1)], pageParams: old.pageParams, id: item.id };
        });
      } catch (e) {
        console.error("today notification handler error:", e);
      }
    };

    anyHandlerRef.current = (event: string, data: any) => {
      // optional
    };

    const handler = handlerRef.current!;
    const anyHandler = anyHandlerRef.current!;

    if (!socket) return;

    socket.off("notification-today:new", handler);
    socket.on("notification-today:new", handler);

    socket.offAny(anyHandler);
    socket.onAny(anyHandler);

    const onConnect = () => {
      socket.off("notification-today:new", handler);
      socket.on("notification-today:new", handler);
    };
    socket.on("connect", onConnect);

    return () => {
      socket.off("notification-today:new", handler);
      socket.offAny(anyHandler);
      socket.off("connect", onConnect);
      __NOTIF_TODAY_REGISTERED = false;
    };
  }, []);

  const queryResult = useInfiniteQuery<NotificationsPage, Error>({
    queryKey: ["notifications-today", username],
    queryFn: async (context) => {
      const { pageParam = 0 } = context;
      const offset = typeof pageParam === "number" ? pageParam : 0;
      const res = await fetchNotificationsTodays({ limit: 10, offset });
      return { data: res.data ?? [], nextOffset: res.data?.length === 10 ? offset + 10 : null };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!username,
    staleTime: Infinity,
    // @ts-ignore
    keepPreviousData: true,
  });

  const id =
    (queryResult.data as InfiniteData<NotificationsPage> | undefined)?.pages?.[0]?.data?.[0]?.id ?? null;

  return { ...(queryResult as any), id } as UseNotificationsTodaysResult;
}

/* ---------- Helper mutation to mark notification read (unchanged) ---------- */
export function useMarkNotificationRead(
  username: string | null,
  key:
    | "notifications-informative"
    | "notifications-actionable"
    | "notifications-today" = "notifications-informative"
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, update }: { id: string; update: { read: boolean } }) => {
      return updateNotificationService(id, update);
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [key, username] });
      const prevData = queryClient.getQueryData([key, username]);
      queryClient.setQueryData([key, username], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: NotificationsPage) => ({
            ...page,
            data: page.data.map((n: Notification) => (n.id === id ? { ...n, read: true } : n)),
          })),
        };
      });
      return { prevData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData([key, username], context?.prevData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [key, username] });
    },
  });
}