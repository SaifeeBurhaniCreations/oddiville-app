import api from "@/src/lib/axios";
import { ExportType } from "@/src/constants/exportFilterComponents";
import { ExportFiltersState } from "@/src/types/export/types";
import * as FileSystem from "expo-file-system/legacy";
import { buildExportParams } from "../utils/export/buildExportParams";

export const downloadExportFile = async (
  type: ExportType,
  filters: ExportFiltersState,
): Promise<string> => {
const params = buildExportParams(type, filters);

const url = `${api.defaults.baseURL}/export?${params.toString()}`;

  const fileName = `${type}-report.xlsx`;
  const uri = FileSystem.cacheDirectory + fileName;

await FileSystem.downloadAsync(url, uri);

  return uri;
};

export const fetchExportRowsCount = async (
  type: ExportType,
  filters: ExportFiltersState,
): Promise<{ count: number }> => {
  const params = buildExportParams(type, filters);

  const res = await api.get(`/export/count?${params}`);

  return res.data;
};