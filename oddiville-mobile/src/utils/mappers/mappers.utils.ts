import { PackingTodayRow } from "@/src/hooks/packing/useGetPackedItemsToday";
import { ItemCardData } from "@/src/types";

export const mapPackingSummaryToItemCards = (
  rows: PackingTodayRow[],
): ItemCardData[] =>
  rows.map((row, i) => ({
    id: `${row.product_name}-${row.sku_label}-${i}`, 
    name: `${row.product_name} ${row.sku_label}`,
    weight: `${row.totalBags} bags / ${row.totalPackets} packets`,
    rating: `${row.events} events`,
    mode: "packing",
    meta: {
      product: row.product_name,
      sku: row.sku_label,
    },
  }));

export const mapProductionToItemCards = (items: any[]): ItemCardData[] =>
  items.map((item) => ({
    id: item.id,
    name: item.product_name,
    weight: `${item.quantity} ${item.unit || "kg"}`,
    rating: item.rating || "0",
    lane: item.laneName ?? null,
    isActive: item.status === "in-queue",
    mode:
      item.status === "completed"
        ? "production-completed"
        : item.status === "in-progress"
          ? "production"
          : "default",
  }));
