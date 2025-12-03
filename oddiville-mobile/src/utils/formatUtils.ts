
function toDate(x: any): Date | undefined {
    if (!x) return undefined;
    if (x instanceof Date) return x;
    const d = new Date(x);
    return isNaN(d.getTime()) ? undefined : d;
}

function coerceArray(x: any): string[] {
    if (Array.isArray(x)) return x.filter(Boolean);
    if (typeof x === "string") {
        try {
            const parsed = JSON.parse(x);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : x ? [x] : [];
        } catch {
            return x ? [x] : [];
        }
    }
    return [];
}

export function getCreatedAt(val: any): Date | undefined {
    return (
        toDate(val?.details?.createdAt) ??
        toDate(val?.created_at) ??
        toDate(val?.createdAt)
    );
}

export function getDescription(val: any): string[] {
    const fromDetails = val?.details?.description;
    if (fromDetails !== undefined) return coerceArray(fromDetails);
    return coerceArray(val?.description);
}
