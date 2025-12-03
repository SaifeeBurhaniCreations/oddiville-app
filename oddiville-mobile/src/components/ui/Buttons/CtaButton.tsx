import { Dimensions, StyleSheet, TouchableOpacity } from "react-native"
import { CtaButtonProps } from "@/src/types";
import { getColor } from "@/src/constants/colors"
import { H6 } from "@/src/components/typography/Typography"
import ForwardArrow from "@/src/components/icons/navigation/ForwardArrow"

const CtaButton = ({ children, color = "green", full, onPress, disabled, ...rest }: CtaButtonProps) => {
  const { width } = Dimensions.get("window")
  return (
    <TouchableOpacity
      activeOpacity={0.1}
      style={[
        styles.CtaButtonWrapper,
        { borderColor: getColor(color, 500), width: full ? width - 16 : null },
      ]}
      onPress={() => !disabled && onPress && onPress()}
      {...rest}
    >
      <H6 color={getColor(color, 500, disabled ? 0.5 : 1)}>{children}</H6>
      <ForwardArrow color={getColor(color, 500, disabled ? 0.5 : 1)} />
    </TouchableOpacity>
  );
}

export default CtaButton

const styles = StyleSheet.create({
  CtaButtonWrapper: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center"
  }
})