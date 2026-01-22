import { BottomSheetConfig } from "@/src/types";

export type AllowedMainSelection =
      | "chamber:detailed"
      | "order:upcoming"
      | "order:inprogress"
      | "order:completed"
      | "raw-material:overview"
      | "raw-material:detailed"
      | "vendor:order"
      | "vendor:overview"
      | "user:overview";

export type BottomSheetMeta = {
  id?: string;
  type?: any;
  mode?: string;
  mainSelection?: string;
  subSelection?: string;
  data?: Record<string, any>;
};

export interface BottomSheetState {
  isVisible: boolean;
  config: BottomSheetConfig | null;
  meta?: BottomSheetMeta;
}

export interface FilterState {
  isVisible: boolean;
}

export interface productProps {
  name: string;
  description: string;
}