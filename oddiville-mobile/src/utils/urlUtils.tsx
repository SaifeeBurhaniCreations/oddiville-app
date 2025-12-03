export function hasUrlField(val: unknown): val is { url: string } {
    if (
        !!val &&
        typeof val === "object" &&
        !Array.isArray(val) &&
        "url" in val &&
        typeof (val as any).url === "string"
    ) {
        if (
            "name" in val &&
            "size" in val &&
            "type" in val &&
            "lastModified" in val
        ) {
            return false;
        }
        return true;
    }
    return false;
}

export function isChallanObject(val: unknown): val is { url: string; key: string } {
    return (
        !!val &&
        typeof val === "object" &&
        "url" in val &&
        typeof (val as any).url === "string" &&
        "key" in val &&
        typeof (val as any).key === "string"
    );
}