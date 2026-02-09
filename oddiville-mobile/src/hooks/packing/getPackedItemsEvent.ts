import { getPackedItems } from "@/src/services/packing.service";
import {
  ApiPackedItem,
  PackagingStorage,
  PackedItemEvent,
  PackingEvent,
  UIPackingItem,
} from "@/src/types/domain/packing/packing.types";
import { useQuery } from "@tanstack/react-query";

const PACKING_KEY = ["packing"];

const normalizePackedItem = (apiItem: ApiPackedItem): PackedItemEvent => ({
  id: apiItem.id,
  product_name: apiItem.product_name,

  skuId: apiItem.sku_id,
  skuLabel: apiItem.sku_label,

  packet: apiItem.packet,

  bagsProduced: apiItem.bags_produced,
  totalPacketsProduced: apiItem.total_packets,

  storage: (apiItem.storage ?? []).filter(isValidStorage).map((s) => ({
    chamberId: s.chamberId,
    chamberName: s.chamberName ?? "",
    bagsStored: s.bagsStored,
  })),

  createdAt: apiItem.createdAt,
  updatedAt: apiItem.updatedAt,
});

const isValidStorage = (s: any): s is PackagingStorage =>
  typeof s?.chamberId === "string" && typeof s?.bagsStored === "number";

export function usePackedItems() {
    return useQuery<PackedItemEvent[]>({
        queryKey: PACKING_KEY,
        queryFn: async () => {
            const res = await getPackedItems();
            const items = res.data ?? [];
            return items.map(normalizePackedItem);
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}

export const normalizePackingEvents = (events: PackingEvent[]): UIPackingItem[] => {
  if (!Array.isArray(events)) return [];

  return events.flatMap((e) => {
    const packetKg =
      e.packet.unit === "gm"
        ? e.packet.size / 1000
        : e.packet.size;

    return (e.storage ?? []).map((s) => {
      const bags = Number(s.bagsStored || 0);
      const packets = bags * e.packet.packetsPerBag;

      const rating =
        Object.values(e.rm_consumption ?? {})[0]?.[s.chamberId]?.rating ?? 5;

      return {
        productName: e.product_name,
        size: e.packet.size,
        unit: e.packet.unit === "gm" ? "gm" : "kg", 
        chamberId: s.chamberId,

        bags,
        kg: packets * packetKg,
        rating,
      };
    });
  });
};

export function usePackedItemsData() {
    return useQuery<UIPackingItem[]>({
    queryKey: PACKING_KEY,
    queryFn: async () => {
      const res = await getPackedItems();
      const items = res.data ?? [];
      return normalizePackingEvents(items); 
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
