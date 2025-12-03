import React, { memo, useState, useEffect } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckboxProps } from '@/src/types';
import { getColor } from '@/src/constants/colors';
import MinusIcon from '../icons/common/MinusIcon';

const CustomCheckbox = ({
  children,
  checked = false,
  onChange,
  shouldBePending,
}: CheckboxProps) => {
  const [pendingOverridden, setPendingOverridden] = useState(false);

  const isConditionPending = shouldBePending?.() ?? false;

  useEffect(() => {
    if (!isConditionPending) {
      setPendingOverridden(false);
    }
  }, [isConditionPending]);

  const isPending = isConditionPending && !pendingOverridden;

  const toggleCheckbox = () => {
    if (isPending) {
      setPendingOverridden(true);
      onChange?.("unchecked");
      return;
    }

    onChange?.(checked ? "unchecked" : "checked");
  };

  const displayStatus: "checked" | "unchecked" | "pending" =
    isPending ? "pending" : checked ? "checked" : "unchecked";

  return (
    <Pressable style={children ? styles.container : undefined} onPress={toggleCheckbox}>
      <View
        style={[
          styles.checkbox,
          (displayStatus === "checked" || displayStatus === "pending") && styles.checked,
        ]}
      >
        {displayStatus === "checked" && (
          <MaterialIcons name="check" size={16} color={getColor("light")} />
        )}
        {displayStatus === "pending" && (
          <MinusIcon color={getColor("light")} />
        )}
      </View>
      {children && <Text style={styles.label}>{children}</Text>}
    </Pressable>
  );
};


export default memo(CustomCheckbox);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: getColor("green", 100),
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: getColor("green"),
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});
