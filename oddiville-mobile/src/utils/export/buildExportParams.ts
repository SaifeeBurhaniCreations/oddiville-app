import { ExportType } from "@/src/constants/exportFilterComponents";
import { ExportFiltersState } from "@/src/types/export/types";

export const buildExportParams = (
  type: ExportType,
  filters: ExportFiltersState
) => {
  const params = new URLSearchParams();

  params.append("type", type);
  params.append("range", filters.range);

  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);

  if (filters.chamberIds.length) {
    params.append("chamberIds", filters.chamberIds.join(","));
  }

  if (filters.laneIds.length) {
    params.append("laneIds", filters.laneIds.join(","));
  }

  if (filters.status.length) {
    params.append("status", filters.status.join(","));
  }

  if (filters.vendors.length) {
    params.append("vendors", filters.vendors.join(","));
  }

  if (filters.materials.length) {
    params.append("materials", filters.materials.join(","));
  }

  if (filters.products.length) {
    params.append("products", filters.products.join(","));
  }

  return params;
};