import { ButtonProps } from "@/src/types";
import { B2, B4 } from "@/src/components/typography/Typography";
import { Pressable, StyleSheet, View } from "react-native";
import { getColor } from "@/src/constants/colors";
import { findBtnPadding } from "@/src/utils/common";
import { useState } from "react";
import Loader from "../Loader";
import { variantStylesMap, Variant, VariantStyleArgs } from "../../../lookups/variantStyles";

const Button = ({
  variant = "fill",
  color = "green",
  children,
  full = false,
  half = false,
  style,
  size = "md",
  disabled = false,
  preIcon,
  postIcon,
  onPress,
  onPressIn,
  onPressOut,
  loading,
}: ButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const { paddingHorizontal, paddingVertical } = findBtnPadding(size);


  function isValidVariant(variant: string): variant is Variant {
    return variant === "outline" || variant === "ghost" || variant === "fill";
  }

  if (!isValidVariant(variant)) {
    return <B4>Invalid Props!</B4>;
  }

  const safeVariant: Variant = variant;

  const getVariantStyles = () => {
    const baseStyles = {
      paddingHorizontal,
      paddingVertical,
      ...(full ? { alignSelf: "stretch" } : {}),
      ...(half ? { flex: 1 } : {}),
    };

    const styleArgs: VariantStyleArgs = {
      baseStyles,
      style,
      color,
      isPressed,
      disabled,
      full,
      half,
    };

    return variantStylesMap[safeVariant](styleArgs);
  };


  const { container, textColor } = getVariantStyles();

  const handlePressIn = () => {
    setIsPressed(true);
    onPressIn?.();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    onPressOut?.();
  };

  const renderContent = () => (
    <View style={styles.contentRow}>
      {preIcon && <View style={styles.iconContainer}>{preIcon}</View>}
      <B2
        numberOfLines={1}
        ellipsizeMode="tail"
        color={disabled ? getColor(color, 200) : textColor}
        style={{ textAlign: "center", flexShrink: 1 }}
      >
        {children}
      </B2>
      {postIcon && <View style={styles.iconContainer}>{postIcon}</View>}
      {loading && <Loader />}
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={container}
      disabled={disabled}
    >
      {renderContent()}
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  btnOutline: {
    borderWidth: 1,
    borderRadius: 8,
  },
  btnFill: {
    borderRadius: 8,
  },
  btnGhost: {
    borderRadius: 8,
  },
  lightButtonShadow: {
    shadowColor: "rgba(7, 3, 25, 0.08)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 11,
    elevation: 8,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
