import { getColor } from '@/src/constants/colors';
import { ChipsProps } from '@/src/types';
import { Pressable, StyleSheet, View } from 'react-native';
import { B4 } from '../typography/Typography';
import { findPadding } from '@/src/utils/common';

const RadioChip = ({ children, size = "lg", isActive = false, onPress, disabled = false }: ChipsProps) => {
  const { paddingHorizontal, paddingVertical } = findPadding(size);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={[
        styles.chip,
        {
          paddingHorizontal,
          paddingVertical,
          backgroundColor: getColor(isActive ? "green" : "light"),
          opacity: disabled ? 0.4 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
      ]}
    >
      {/* Radio Icon */}
      <View style={styles.radioOuter}>
        {isActive && <View style={styles.radioInner} />}
      </View>

      {/* Label */}
      <B4 color={isActive ? getColor("light") : getColor("green", 700)}>
        {children}
      </B4>
    </Pressable>
  );
};

export default RadioChip;

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: getColor("green", 100),
    borderRadius: 8,
  },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: getColor("green", 100),
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: getColor("light"),
  },
});
