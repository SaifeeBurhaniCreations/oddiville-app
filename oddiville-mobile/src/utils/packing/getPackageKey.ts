export const getPackageKey = (p: {size:number, unit:string|null}) =>
  `${p.size}-${p.unit}`;