export const calculateQuantityUsedKg = (
    bagsUsed: number,
    containerSize: { value: number; unit: "kg" | "gm" | "unit" }
): number => {
    if (containerSize.unit === "kg") {
        return bagsUsed * containerSize.value;
    }

    if (containerSize.unit === "gm") {
        return (bagsUsed * containerSize.value) / 1000;
    }

    // "unit"
    return 0;
};