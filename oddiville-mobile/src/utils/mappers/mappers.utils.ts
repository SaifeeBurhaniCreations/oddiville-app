import { ItemCardData } from "@/src/types";

  const mapPackingEventRows = (rows: any[], product: string): ItemCardData[] =>
    rows.map((row, i) => ({
      id: `${product}-event-${i}`,
      name: product,
      weight: `${row.bags} bags / ${row.packets} packets`,
      rating: row.events ? `${row.events} events` : undefined,
      mode: "packing",
      meta: {
        product,
        sku: row.sku,
        mode: "event",
      },
    }));

    const mapPackingSkuRows = (
      rows: any[],
      product: string,
    ): ItemCardData[] =>
      rows.map((row, i) => ({
        id: `${product}-${row.sku}-${i}`,
        name: product,
        weight: `${row.totalBags} bags / ${row.totalPackets} packets`,
        mode: "packing",
        meta: {
          product,
          sku: row.sku,
          mode: "sku",
        },
      }));

const mapPackingProductRows = (rows: any[], product: string): ItemCardData[] =>
  rows.map((row, i) => ({
    id: `${product}-product-${i}`,
    name: product,

    meta: {
      product,
      sku: "ALL",
      mode: "product",
      totalBags: row.totalBags,
      totalPackets: row.totalPackets,
      events: row.eventsCount,
    },

    mode: "packing",
  }));

        export const mapPackingRows = (
          rows: any[],
          product: string,
          mode: "sku" | "product" | "event",
        ): ItemCardData[] => {
          switch (mode) {
            case "sku":
              return mapPackingSkuRows(rows, product);
            case "product":
              return mapPackingProductRows(rows, product);
            case "event":
            default:
              return mapPackingEventRows(rows, product);
          }
        };


export const mapProductionToItemCards = (
  items: any[],
  lanes: any[]
): ItemCardData[] => {
  return items.map((item) => {
    const laneObj = lanes.find(l => l.id === item.lane);

    return {
      id: item.id,
      name: item.product_name,
      weight: `${item.status !== "completed" ? item.quantity : item.recovery} ${item.unit || "kg"}`,
      rating: item.rating ? String(item.rating) : undefined,
      lane: laneObj?.name ?? null,  
      mode:
        item.status === "completed"
          ? "production-completed"
          : item.status === "in-progress"
          ? "production"
          : "default",
    };
  });
};
