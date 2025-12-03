import { View, StyleSheet, ViewStyle } from "react-native";
import { HStackProps } from "@/src/types";
import { Children } from "react";

export const HStack: React.FC<HStackProps> = ({
  justify = "start",
  align = "center",
  gap = 0,
  w,
  maxW,
  children,
  style,
  ...props
}) => {
  const justifyStyles: Record<NonNullable<HStackProps["justify"]>, NonNullable<ViewStyle["justifyContent"]>> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };

  const alignStyles: Record<NonNullable<HStackProps["align"]>, NonNullable<ViewStyle["alignItems"]>> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };

  const childArray = Children.toArray(children);

  return (
    <View
      style={[
        styles.hstack,
        {
          justifyContent: justifyStyles[justify],
          alignItems: alignStyles[align],
          width: w,
          maxWidth: maxW,
        },
        style,
      ]}
      {...props}
    >
      {childArray.map((child, index) => (
        <View
          key={index}
          style={{ marginEnd: index !== childArray?.length - 1 ? gap : 0 }}
        >
          {child}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  hstack: {
    flexDirection: "row",
  },
});
