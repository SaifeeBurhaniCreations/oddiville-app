import { getPackedItems } from "@/src/services/packing.service";
import {
  ApiPackedItem,
  PackagingStorage,
  PackedItemEvent,
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
