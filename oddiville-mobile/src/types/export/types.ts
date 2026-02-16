import React from "react";
import { ExportType } from "@/src/constants/exportFilterComponents";

export interface ExportFiltersState {
  type: ExportType | null;

  range: string;
  from: string | null;
  to: string | null;

  chamberIds: string[];

  laneIds: string[];

  selectAllLanes: boolean;

  status: string[];
  vendors: string[];
  materials: string[];
}

export interface FilterComponentProps {
    state: ExportFiltersState;
    setState: React.Dispatch<React.SetStateAction<ExportFiltersState>>;
}