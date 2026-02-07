import { NormalMetric, PackageSummaryMetric, SkuSummaryMetric } from "@/src/types";

export const isSkuSummaryMetric = (
  metric: PackageSummaryMetric,
): metric is SkuSummaryMetric =>
  "type" in metric && metric.type === "sku-summary";

export const isNormalMetric = (metric: PackageSummaryMetric): metric is NormalMetric =>
  "value" in metric;
