import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Text } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B4, C1, H4 } from '../typography/Typography';
import DownChevron from '../icons/navigation/DownChevron';
import { SelectProps } from '@/src/types';
const Select = ({
  value,
  options = ["option_1", "option_2", "option_3"],
  children,
  onPress,
  showOptions = true,
  isVirtualised,
  defaultDropdown = false,
  style,
  selectStyle,
  error,
  disabled = false,
  onSelect,
  preIcon: PreIcon,
  ...props
}: SelectProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handlePress = () => {
    showOptions && toggleDropdown();
    onPress && onPress();
  };

  const displayValue = value ?? options[0];

  const SelectedElement = (
    <View style={selectStyle}>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.7}
        style={[
          styles.selectContainer,
          error && { borderColor: getColor("red", 500) },
          disabled && { backgroundColor: getColor("green", 100) }
        ]}
        onPress={() => !disabled && handlePress()}
      >
        <View style={{flexDirection: "row", alignItems: "center", gap: 8 }}>
        {PreIcon && <PreIcon />}
        
        <B4 color={getColor("green", disabled ? 200 : 700)}>{displayValue}</B4>
        </View>
        {!disabled && <DownChevron size={16} color={getColor("green", 700)} />}
      </TouchableOpacity>

      {isDropdownOpen && defaultDropdown && (
        isVirtualised ? (
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                setIsDropdownOpen(false);
                onPress?.();
              }}
                style={styles.option}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.dropdown}
          />
        ) : (
          <View style={styles.dropdown}>
            {options.map((item) => (
              <TouchableOpacity key={item} onPress={() => {
                setIsDropdownOpen(false);
                onPress?.();
              }}
                style={styles.option}>
                <Text style={styles.optionText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )
      )}

      {error && <C1 style={styles.errorText}>{error}</C1>}
    </View>
  );

  return children ? (
    <View style={[styles.labelContainer, style]} {...props}>
      <H4>{children}</H4>
      {SelectedElement}
    </View>
  ) : (
    SelectedElement
  );
};

export default Select;

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "column",
    gap: 8,
  },
  selectContainer: {
    backgroundColor: getColor("light"),
    borderWidth: 1,
    borderColor: getColor("green", 100),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  dropdown: {
    backgroundColor: getColor("light", 200),
    borderWidth: 1,
    borderColor: getColor("green", 100),
    marginTop: 8,
    borderRadius: 12,
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionText: {
    color: getColor("green", 700),
    fontSize: 16,
  },
  errorText: {
    color: getColor("red"),
    marginTop: 4,
  },

});

