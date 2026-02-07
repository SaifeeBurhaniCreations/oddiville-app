import { StyleSheet, View } from "react-native";
import { ChipGroupProps } from "@/src/types/ui";
import { B4, B5, C1, H4 } from "../typography/Typography";
import Chip from "./Chip";
import { useState } from "react";
import RadioChip from "./RadioChip";
import { getColor } from "@/src/constants/colors";

const ChipGroup = ({
  data,
  size = "md",
  isMultiple = false,
  children,
  dismisible = false,
  onDismiss,
  type = "default",
  isClickable = true,
  style,
  activeValue,
  onChange,
  disabledValues = [],
  blockSelection,
  ...props
}: ChipGroupProps & {
  activeValue?: any;
  onChange?: (val: any) => void;
  disabledValues?: any[];
}) => {
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  if (!data) return <B4 style={style}>Nothing to show!</B4>;

  const handleChipPress = (index: number) => {
    if (type === "radio" && onChange) {
      onChange(data[index].value ?? data[index]);
    } else {
      setActiveIndices((prev) => {
        if (isMultiple) {
          if (prev.includes(index)) {
            return prev.filter((i) => i !== index);
          } else {
            return [...prev, index];
          }
        } else {
          return prev.includes(index) ? [] : [index];
        }
      });
    }
  };

  const ChipComponent = type === "radio" ? RadioChip : Chip;
  const isSm = size === "sm";
  return (
    <View
      style={[styles.chipContainer, isSm ? styles.gap8 : styles.gap12]}
      {...props}
    >
      {children && (isSm ? <B5>{children}</B5> : <H4>{children}</H4>)}
      <View style={[styles.container, style]}>
        {data?.map((item, index) => {
          const value = item.value ?? item;
          const isActive =
            !blockSelection &&
            (type === "radio"
              ? activeValue === value
              : isClickable && activeIndices.includes(index));

          const isDisabled = disabledValues.includes(value);

          const commonProps = {
            isActive,
            onPress:
              blockSelection || isDisabled
                ? undefined
                : () => handleChipPress(index),
            disabled: blockSelection || isDisabled,
          };

          const extraProps =
            type === "radio"
              ? {}
              : {
                  dismisible,
                  textSize: size,
                  size,
                  isClickable,
                  onDismiss,
                  index,
                };

          return (
            <ChipComponent key={index} {...commonProps} {...extraProps}>
              {item?.icon ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  {item.icon}
                  {isSm ? (
                    <C1 color={getColor("green", 700)}>
                      {item.label ?? item.title ?? item.name ?? item}
                    </C1>
                  ) : (
                    <B4>{item.label ?? item.title ?? item.name ?? item}</B4>
                  )}
                </View>
              ) : (
                item.label ?? item.title ?? item.name ?? item
              )}
            </ChipComponent>
          );
        })}
      </View>
    </View>
  );
};

export default ChipGroup;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipContainer: {
    flexDirection: "column",
  },
  gap12: {
    gap: 12,
  },
  gap8: {
    gap: 8,
  },
});