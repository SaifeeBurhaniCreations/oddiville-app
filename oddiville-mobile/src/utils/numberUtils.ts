export const getFillColorByPercent = (percent: number): "red" | "blue" | "green" | "yellow" => {
    if (percent <= 30) return 'green';
    if (percent <= 60) return 'blue';
    if (percent <= 80) return 'yellow';
    return 'red';
};

const unitMultipliers: Record<string, number> = {
    gm: 1,
    kg: 1000,
    qn: 100000,
    ton: 1000000,
};

function parseWeight(weightStr: string): number {
    const match = weightStr.trim().toLowerCase().match(/^([\d.]+)\s*(gm|kg|qn|ton)$/);
    if (!match) return NaN;
    const [, num, unit] = match;
    return parseFloat(num) * (unitMultipliers[unit] || 1);
}

export function sortBy<T extends Record<string, any>>(arr: T[], key: keyof T, isName: boolean = false): T[] {
    if (isName) {
        return [...arr].sort((a, b) => String(a[key]).localeCompare(String(b[key])));
    } else {
        return [...arr].sort((a, b) => parseWeight(String(a[key])) - parseWeight(String(b[key])));
    }
}

export function sortByNumber<T>(arr: T[], key: keyof T): T[] {
  return [...arr].sort((a, b) => Number(a[key]) - Number(b[key]));
}
