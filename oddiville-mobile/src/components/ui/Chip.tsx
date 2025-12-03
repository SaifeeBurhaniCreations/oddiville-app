import React, { useEffect, useState } from "react";
import { getColor } from "@/src/constants/colors";
import { ChipsProps } from "@/src/types";
import { Pressable, StyleSheet, View } from "react-native";
import { B4, C1 } from "../typography/Typography";
import { findBtnPadding } from "@/src/utils/common";
import CrossIcon from "../icons/page/CrossIcon";

const Chip = ({
  children,
  textSize = "md",
  icon,
  dismisible = false,
  onDismiss,
  index = 0,
  size = "md",
  isActive: initialActive = false,
  isClickable = true,
  onPress,
}: ChipsProps) => {
  const [activeState, setActiveState] = useState(initialActive);
  const { paddingHorizontal, paddingVertical } = findBtnPadding(size);

  useEffect(() => {
    setActiveState(initialActive);
  }, [initialActive]);

  const handleToggle = () => {
    if (!isClickable) return;
    setActiveState((s) => !s);
    onPress && onPress();
  };

  const renderLeftIcon = () => {
    if (!icon) return null;

    const tintColor = activeState ? getColor("light") : getColor("green", 700);

    if (React.isValidElement(icon)) {
      const element = icon as React.ReactElement<any>;
      const existingStyle = element.props?.style;
      try {
        return React.cloneElement(element, {
          ...(element.props as any),
          color: tintColor,
          style: [styles.leftIcon, existingStyle],
        } as any);
      } catch {
        return <View style={[styles.leftIcon]}>{icon}</View>;
      }
    }

    return <View style={styles.leftIcon}>{icon as any}</View>;
  };

  const isTextOnly =
    typeof children === "string" || typeof children === "number";
  const isColumn = isTextOnly && !dismisible;

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.chip,
        {
          paddingHorizontal,
          paddingVertical,
          backgroundColor: getColor(activeState ? "green" : "light"),
          flexDirection: "row",
          alignItems: "center",
          gap: isColumn ? 0 : 8,
        },
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: activeState }}
    >
      {renderLeftIcon()}

      {isTextOnly ? (
        textSize === "md" ? (
          <B4 color={activeState ? getColor("light") : getColor("green", 700)}>
            {children}
          </B4>
        ) : (
          <C1 color={activeState ? getColor("light") : getColor("green", 700)}>
            {children}
          </C1>
        )
      ) : (
        children
      )}

      {false && activeState && (
        <Pressable
          onPress={() => onDismiss?.(index)}
          style={styles.closeIcon}
          accessibilityLabel="Dismiss"
          accessibilityRole="button"
        >
          <CrossIcon
            color={activeState ? getColor("light") : getColor("green", 700)}
          />
        </Pressable>
      )}
    </Pressable>
  );
};

export default Chip;

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: getColor("green", 100),
    borderRadius: 8,
  },
  closeIcon: {
    marginLeft: 4,
  },
  leftIcon: {
    marginRight: 6,
    alignSelf: "center",
  },
});
