import { View, StyleSheet, ViewStyle } from "react-native";
import { VStackProps } from "@/src/types";
import { Children } from "react";


export const VStack: React.FC<VStackProps> = ({
    justify = "start",
    align = "center",
    gap = 0,
    w,
    maxW,
    children,
    style,
    ...props
}) => {
    const justifyStyles: Record<NonNullable<VStackProps["justify"]>, NonNullable<ViewStyle["justifyContent"]>> = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        between: "space-between",
        around: "space-around",
        evenly: "space-evenly",
    };

    const alignStyles: Record<NonNullable<VStackProps["align"]>,NonNullable< ViewStyle["alignItems"]>> = {
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
                styles.vstack,
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
              <View key={index} style={{ marginBottom: index !== childArray?.length - 1 ? gap : 0 }}>
                  {child}
              </View>
          ))}
      </View>
  );
};

const styles = StyleSheet.create({
    vstack: {
        flexDirection: "column",
    },
});
