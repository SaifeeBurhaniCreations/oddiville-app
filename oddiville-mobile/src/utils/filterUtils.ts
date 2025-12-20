import { FilterNode } from "../redux/slices/bottomsheet/filters.slice";

export function filterItems<T>(
    items: T[],
    filters: Record<string, string[]>,
    filterHandlers: Record<string, (item: T, subKey: string, selected: string[]) => boolean>
): T[] {
    
    return items.filter(item =>
        Object.entries(filters).every(([compositeKey, selectedArr]) => {
            const lastColon = compositeKey.lastIndexOf(":");
            const mainKey = lastColon !== -1 ? compositeKey.substring(0, lastColon) : compositeKey;
            const subKey = lastColon !== -1 ? compositeKey.substring(lastColon + 1) : "";
            
            const handler = filterHandlers[mainKey];
            if (handler) {
                return handler(item, subKey, selectedArr);
            }
            return true;
        })
    );
}

export function flattenFilters(
    node: Record<string, FilterNode>,
    parentKey: string = "",
    result: Record<string, string[]> = {}
): Record<string, string[]> {
    Object.entries(node).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}:${key}` : key;
        if (value.value) {
            if (!result[fullKey]) result[fullKey] = [];
            result[fullKey].push(value.value);
        }
        if (value.children) {
            flattenFilters(value.children, fullKey, result);
        }
    });
    return result;
}
