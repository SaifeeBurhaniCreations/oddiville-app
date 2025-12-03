import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { B2 } from '../typography/Typography'
import { getColor } from '@/src/constants/colors'
import { ReactNode } from 'react'

const Radio = ({
  children,
  isChecked = false,
  onPress,
}: {
  children: ReactNode,
  isChecked?: boolean,
  onPress?: () => void
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.radio}>
      <View style={styles.radioIcon}>
        {isChecked && <View style={styles.radioInner} />}
      </View>
      <B2 style={styles.label}>{children}</B2>
    </TouchableOpacity>
  )
}

export default Radio


const styles = StyleSheet.create({
  radio: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: getColor("green"),
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: getColor("green")
  },
  label: {
    color: getColor("green", 700),
  }
})
