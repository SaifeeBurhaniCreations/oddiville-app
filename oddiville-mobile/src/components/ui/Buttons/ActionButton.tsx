import { getColor } from '@/src/constants/colors'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { B4 } from '../../typography/Typography'
import { ActionButtonProps } from '@/src/types'

const ActionButton = ({ children, icon: IconComponent, variant = "default", onPress, filled, btnSize, disabled = false, style, ...props }: ActionButtonProps) => {
  const buttonHeight = 32;
  const buttonWidth = 32;

  const isMdBtn = btnSize === "md";
  const btnPadding = isMdBtn ? 12 : 6;

  if (children) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.actionBtnContainer, { padding: btnPadding, height: buttonHeight, backgroundColor: filled ? getColor("green") : variant === "outline" ? getColor("light", 500) : getColor("green", 500, 0.1), borderColor: filled ? getColor("green") : getColor("green", 100), opacity: disabled ? 0.5 : 1 }, style]} {...props} disabled={disabled}>
        <IconComponent color={getColor("green")} size={isMdBtn ? 24 : 20} />
        {
          children && <B4 color={getColor("green", 700)}>{children}</B4>
        }
      </TouchableOpacity>
    )
  } else {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.actionBtnContainer, { padding: btnPadding, width: buttonWidth, height: buttonHeight, backgroundColor: filled ? getColor("green") : variant === "outline" ? getColor("light", 500) : getColor("green", 500, 0.1), borderColor: filled ? getColor("green") : getColor("green", 100) }, style]} {...props} disabled={disabled}>
        <IconComponent color={getColor("green")} size={24} />
      </TouchableOpacity>
    )
  }

}

export default ActionButton

const styles = StyleSheet.create({
  actionBtnContainer: {
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    minWidth: 36,
    height: 36,
  }
});
