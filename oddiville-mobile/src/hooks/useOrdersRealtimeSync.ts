import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useSocket from "@/src/hooks/useSocketFromContext";
import { RawMaterialOrderProps } from "../types";
import type { InfiniteData } from "@tanstack/react-query";
import { PENDING_KEY, ALL_KEY } from "./useRawMaterialOrders";

export const COMPLETED_KEY = ["raw-material-orders", "completed"] as const;

type CompletedOrdersPage = {
    data: RawMaterialOrderProps[];
    nextOffset: number | null;
};

type CompletedInfinite = InfiniteData<CompletedOrdersPage>;

export default function useOrdersRealtimeSync() {
    const queryClient = useQueryClient();
    const socket = useSocket();

    useEffect(() => {
        if (!socket) return;

        const syncOrder = (updated: RawMaterialOrderProps) => {
            if (!updated?.id) return;

            // single order cache
            queryClient.setQueryData(
                ["raw-material-order-by-id", updated.id],
                updated,
            );

            // -------------------------
            // PENDING LIST
            // -------------------------
            queryClient.setQueryData<RawMaterialOrderProps[]>(
                PENDING_KEY,
                (old = []) => {
                    const isPending = updated.status === "pending";

                    if (!isPending) return old.filter((o) => o.id !== updated.id);

                    const idx = old.findIndex((o) => o.id === updated.id);
                    if (idx === -1) return [updated, ...old];

                    const copy = old.slice();
                    copy[idx] = updated;
                    return copy;
                },
            );

            // -------------------------
            // COMPLETED LIST (infinite)
            // -------------------------
            queryClient.setQueryData<CompletedInfinite>(COMPLETED_KEY, (old) => {
                if (!old) return old;

                const isCompleted =
                    updated.status === "completed" || !!updated.arrival_date;

                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        data: isCompleted
                            ? [updated, ...page.data.filter((o) => o.id !== updated.id)]
                            : page.data.filter((o) => o.id !== updated.id),
                    })),
                };
            });

            // -------------------------
            // ALL LIST
            // -------------------------
            queryClient.setQueryData<RawMaterialOrderProps[]>(ALL_KEY, (old = []) => {
                const idx = old.findIndex((o) => o.id === updated.id);
                if (idx === -1) return [updated, ...old];
                const copy = old.slice();
                copy[idx] = updated;
                return copy;
            });

            // safety refetch
            queryClient.invalidateQueries({ queryKey: PENDING_KEY });
            queryClient.invalidateQueries({ queryKey: COMPLETED_KEY });
        };

        const onCreated = (data: any) => syncOrder(data.materialDetails);
        const onChanged = (data: any) => syncOrder(data.materialDetails);

        socket.on("raw-material-order:created", onCreated);
        socket.on("raw-material-order:status-changed", onChanged);

        return () => {
            socket.off("raw-material-order:created", onCreated);
            socket.off("raw-material-order:status-changed", onChanged);
        };
    }, [queryClient, socket]);
}