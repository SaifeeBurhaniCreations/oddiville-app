import { StyleSheet, View } from "react-native";
import React from "react";
import { PackageSummaryMetricsProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { B3, B4, H5 } from "@/src/components/typography/Typography";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import StarIcon from "@/src/components/icons/page/StarIcon";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";

const iconMap = {
  box: BoxIcon,
  roll: PaperRollIcon,
  clock: StarIcon,
};

const PackageSummaryMetricsComponent = ({ data }: PackageSummaryMetricsProps) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View>
        <B3 color={getColor("yellow", 700)} style={styles.headerText}>
          {data.title}
        </B3>

        <View style={styles.ratingRow}>
          <StarIcon color={getColor("green", 700)} size={16} />
          <B4>Events: {data.rating}</B4>
        </View>
      </View>

      {data.metrics.map((metric) => {
        const Icon = metric.icon ? iconMap[metric.icon] : BoxIcon;

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
      })}
    </View>
  );
};

export default PackageSummaryMetricsComponent;

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

  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  longValueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  longValueText: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  valueWrap: {
    flexWrap: "wrap",
    flexShrink: 1,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  kvRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    flexShrink: 1,
  },

  valueText: {
    flexShrink: 1,
    flexWrap: "wrap",
  },

  longValue: {
    maxWidth: "85%",
  },

  detailItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  fullWidth: {
    width: "100%",
  },

  ratingRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
},

});