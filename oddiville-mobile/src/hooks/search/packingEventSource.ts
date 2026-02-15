import { useMemo } from "react";
import { usePackedItems } from "@/src/hooks/packing/getPackedItemsEvent";
import type { DomainSourceHook } from "@/src/types/search/sources";
import type { SearchActivityProps } from "@/src/types";

function normalizePackingEvent(event: any): SearchActivityProps {
  return {
    id: `packing-${event.id}`,
    itemId: event.id,
    title: event.product_name,
    type: "PACKING COMPLETED",
    badgeText: `${event.bagsProduced} bags`,
    read: true,
    createdAt: new Date(event.createdAt),
    extra_details: [
      event.skuLabel,
      `${event.totalPacketsProduced} packets`,
      `rating ${event.rating ?? 5}`,
    ],
    domain: "packing-event",
    action: { type: "navigate", screen: "package" }
  };
}

export const usePackingEventDomainSource: DomainSourceHook = () => {
  const { data = [], isLoading } = usePackedItems();

  const activities = useMemo(
    () => (data ?? []).map(normalizePackingEvent),
    [data]
  );

  return {
    domain: "packing-event",
    activities,
    isLoading,
  };
};