export function maskCurrency(value?: number | string) {
  if (!value) return "--";
  return "****";
}
