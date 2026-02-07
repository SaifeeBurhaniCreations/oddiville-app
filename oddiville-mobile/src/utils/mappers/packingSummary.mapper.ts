/* ---------- EVENT VIEW ---------- */
export function mapEvents(items: any[]) {
  return items.map((item) => ({
    id: item.summary_id,
    product: item.product_name,
    sku: item.sku_label,
    bags: item.totalBags,
    packets: item.totalPackets,
    createdAt: item.createdAt,
    chambers: [],
  }));
}

/* ---------- SKU VIEW ---------- */
export function mapBySku(items: any[]) {
  const map = new Map<string, any>();

  items.forEach((item) => {
    const key = `${item.product_name}-${item.sku_label}`;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        product: item.product_name,
        sku: item.sku_label,
        bags: 0,
        packets: 0,
        events: 0,
      });
    }

    const acc = map.get(key);
    acc.bags += item.totalBags;
    acc.packets += item.totalPackets;
    acc.events += item.events;
  });

  return Array.from(map.values());
}

/* ---------- PRODUCT VIEW ---------- */
export function mapByProduct(items: any[]) {
  const map = new Map<string, any>();

  items.forEach((item) => {
    const key = item.product_name;

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        product: item.product_name,
        bags: 0,
        packets: 0,
        events: 0,
      });
    }


    const acc = map.get(key);
    acc.bags += item.totalBags;
    acc.packets += item.totalPackets;
    acc.events += item.events;
  });

  return Array.from(map.values());
}