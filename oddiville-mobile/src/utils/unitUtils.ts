const allowedUnits = ["unit", "kg", "gm", "qn"] as const;

type AllowedUnit = typeof allowedUnits[number];

export const isAllowedUnit = (value: string): value is AllowedUnit => {
  return allowedUnits.includes(value as AllowedUnit);
};