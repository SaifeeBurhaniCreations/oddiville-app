export const toKg = (qty: number, unit: "gm" | "kg") =>
  unit === "gm" ? qty / 1000 : qty;

export const safeNumber = (v: any) => (isNaN(Number(v)) ? 0 : Number(v));