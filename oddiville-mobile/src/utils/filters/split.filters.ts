export function splitFilters(filters: Record<string, string[]>) {
  const projectionFilters: Record<string, string[]> = {};
  const booleanFilters: Record<string, string[]> = {};

  for (const key in filters) {
    if (key.startsWith("packing:summary:")) {
      const [, , mode] = key.split(":");
      projectionFilters.mode = filters[key];
    } else {
      booleanFilters[key] = filters[key];
    }
  }

  return { projectionFilters, booleanFilters };
}
