import ChamberFilters from "../components/ui/export-filters/ChamberFilters";
import DashboardFilters from "../components/ui/export-filters/DashboardFilters";
import DispatchFilters from "../components/ui/export-filters/DispatchFilters";
import ProductionFilters from "../components/ui/export-filters/ProductionFilters";
import RawFilters from "../components/ui/export-filters/RawFilters";
import { FilterComponentProps } from "../types/export/types";

export const FILTER_COMPONENTS: Record<
  ExportType,
  React.ComponentType<FilterComponentProps>
> = {
  dashboard: DashboardFilters,
  chamber: ChamberFilters,
  production: ProductionFilters,
  raw: RawFilters,
  dispatch: DispatchFilters,
};

export const EXPORT_TYPES = {
  DASHBOARD: "dashboard",
  CHAMBER: "chamber",
  PRODUCTION: "production",
  RAW: "raw",
  DISPATCH: "dispatch",
} as const;

export const EXPORT_LABEL_MAP: Record<string, ExportType> = {
  Dashboard: "dashboard",
  Chamber: "chamber",
  Production: "production",
  "Raw Material": "raw",
  Dispatch: "dispatch",
};


export type ExportType = (typeof EXPORT_TYPES)[keyof typeof EXPORT_TYPES];

export const EXPORT_TYPE_OPTIONS = Object.entries(EXPORT_TYPES).map(
  ([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase(),
    value,
  }),
);