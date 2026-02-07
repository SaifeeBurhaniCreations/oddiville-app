import { StyleSheet, View } from "react-native";
import React from "react";
import { PackageSummaryMetricsProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { B3, B4, H5 } from "@/src/components/typography/Typography";

import BoxIcon from "@/src/components/icons/common/BoxIcon";
import StarIcon from "@/src/components/icons/page/StarIcon";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import EventIcon from "../../icons/packaging/EventIcon";

// ---------------- ICON MAP ----------------

const iconMap = {
  box: BoxIcon,
  roll: PaperRollIcon,
  clock: StarIcon,
} satisfies Record<"box" | "roll" | "clock", React.FC<any>>;

// ---------------- TYPE GUARDS ----------------

type NormalMetric = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  icon?: "box" | "roll" | "clock";
};

type SkuSummaryMetric = {
  id: string;
  label: string;
  type: "sku-summary";
  bags: number;
  packets: number;
};

type PackageSummaryMetric = NormalMetric | SkuSummaryMetric;

const isSkuSummaryMetric = (
  metric: PackageSummaryMetric
): metric is SkuSummaryMetric =>
  "type" in metric && metric.type === "sku-summary";

const isNormalMetric = (
  metric: PackageSummaryMetric
): metric is NormalMetric =>
  "value" in metric;

// ---------------- COMPONENT ----------------

const PackageSummaryMetricsComponent = ({
  data,
}: PackageSummaryMetricsProps) => {
  const isEventMode = data.metrics.every(m => "value" in m);
  
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View>
        <B3 color={getColor("yellow", 700)} style={styles.headerText}>
          {data.title}
        </B3>

        <View style={styles.ratingRow}>
          {
            isEventMode ? <EventIcon color={getColor("green", 700)} size={16} /> : <StarIcon color={getColor("green", 700)} size={16} />
          }
          
          <B4>Events: {data.rating}</B4>
        </View>
      </View>

      {/* METRICS */}
      {data.metrics.map((metric) => {
        // -------- SKU SUMMARY CARD (PRODUCT MODE) --------
        if (isSkuSummaryMetric(metric)) {
          return (
            <View style={styles.card} key={metric.id}>
              <H5>{metric.label}</H5>
              <View style={styles.cardBody}>
              <View style={styles.kvRow}>
                <BoxIcon size={16} color={getColor("green", 700)} />
                <B3>Bags:</B3>
                  <View style={styles.kvRow}>
                    <B4>{metric.bags} bags</B4>
                  </View>
              </View>
                <View style={styles.kvRow}>
                    <PaperRollIcon size={16} color={getColor("green", 700)} />
                  <B3>Packets:</B3>
                  <View style={styles.kvRow}>
                    <B4>{metric.packets} packets</B4>
                  </View>
                </View>
              </View>
            </View>
          );
        }

        // -------- NORMAL METRIC CARD --------
        if (isNormalMetric(metric)) {
          const Icon = metric.icon
            ? iconMap[metric.icon]
            : BoxIcon;

          return (
            <View style={styles.card} key={metric.id}>
              <View style={styles.detailItem}>
                <Icon color={getColor("green", 700)} size={18} />
                <View style={styles.kvRow}>
                  <H5>{metric.label}</H5>
                  <B4>
                    {metric.value} {metric.unit ?? ""}
                  </B4>
                </View>
              </View>
            </View>
          );
        }

        return null;
      })}
    </View>
  );
};

export default PackageSummaryMetricsComponent;

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },

  headerText: {
    textTransform: "uppercase",
  },

  card: {
    backgroundColor: getColor("light"),
    borderWidth: 1,
    borderColor: getColor("green", 100),
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },

  kvRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  cardBody: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
});