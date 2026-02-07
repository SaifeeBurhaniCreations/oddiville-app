import { StyleSheet } from "react-native";
import React from "react";
import { FilterComponentProps } from "@/src/types/export/types";
import ChipGroup from "../../ChipGroup";

const RANGE_OPTIONS: { label: string; value: string }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "Last Week", value: "last_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Custom", value: "custom" },
];

const TimeRange = ({ state, setState }: FilterComponentProps) => {
  
  return (
    <ChipGroup
      type="radio"
      data={RANGE_OPTIONS}
      activeValue={state.range}
      onChange={(range) =>
        setState(prev => ({
          ...prev,
          range,

          ...(range !== "custom" && {
            from: null,
            to: null,
          }),
        }))
      }
    >
      Time Range
    </ChipGroup>
  );
};

export default TimeRange;

const styles = StyleSheet.create({});
