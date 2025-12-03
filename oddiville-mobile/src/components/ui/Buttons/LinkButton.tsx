import { LinkButtonProps } from "@/src/types";
import { StyleSheet, TouchableOpacity } from "react-native";
import { getColor } from "@/src/constants/colors";
import { findLinkButtonSize } from "@/src/utils/common";

const LinkButton = ({
  color = "green",
  children,
  style,
  size = "md",
  disabled,
  onPress,
}: LinkButtonProps) => {
  const { component: TypographyComponent } = findLinkButtonSize(size);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.linkButton, style]}
      disabled={disabled}
    >
      <TypographyComponent color={getColor("green")}>{children}</TypographyComponent>
    </TouchableOpacity>
  );
};

export default LinkButton;

const styles = StyleSheet.create({
  linkButton: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  }
});
