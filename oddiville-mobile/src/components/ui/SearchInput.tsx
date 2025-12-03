import { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import MagnifyingGlassIcon from "@/src/components/icons/page/MagnifyingGlassIcon";
import CrossIcon from "../icons/page/CrossIcon";
import { getColor } from "@/src/constants/colors";
import { SearchInputProps } from "@/src/types";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";
import { B4 } from "../typography/Typography";

const { width } = Dimensions.get("window");

const SearchInput = ({
  style,
  onChangeText,
  value,
  onSubmitEditing,
  returnKeyType,
  border,
  cross,
  w,
  defaultValue,
  placeholder = "Search something...",
  variant = "default",
  onClear,

}: SearchInputProps) => {
  const [searchValue, setSearchValue] = useState(defaultValue ?? "");

  useEffect(() => {
    if (defaultValue !== undefined) {
      setSearchValue(defaultValue);
    }
  }, [defaultValue]);

  const handleChange = (text: string) => {
    setSearchValue(text);
    onChangeText?.(text);
  };

  const clearSearch = () => {
    setSearchValue("");
    onChangeText?.("");
    onClear?.();
  };
  
  const containerStyle = useMemoizedStyle(
    {
      borderColor: getColor("green", 100),
      borderWidth: border ? 1 : 0,
      ...(w ? { width: width * w, flex: 0 } : { flex: 1 }),
    },
    [border, w]
  );

  if(variant === "default") {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <MagnifyingGlassIcon />
        <TextInput
          style={styles.input}
          value={value !== undefined ? value : searchValue} 
          placeholder={placeholder}
          onChangeText={handleChange}
          placeholderTextColor={getColor("green", 700, 0.7)}
          multiline={false}
          numberOfLines={1}
          textAlignVertical="center"
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        {cross && searchValue?.length > 0 && (
          <TouchableOpacity activeOpacity={0.7} onPress={clearSearch}>
            <CrossIcon color={getColor("green", 500)} />
          </TouchableOpacity>
        )}
      </View>
    );
  } else if(variant === "bordered") {
    return (
      <View style={[styles.borderedContainer, containerStyle, style]}>
    <MagnifyingGlassIcon />
    <TextInput
      style={styles.input}
      value={searchValue}
      placeholder={placeholder}
      onChangeText={handleChange}
      placeholderTextColor={getColor("green", 700, 0.7)}
      multiline={false}
      numberOfLines={1}
      textAlignVertical="center"
      onSubmitEditing={onSubmitEditing}
      returnKeyType={returnKeyType}
    />
        {cross && searchValue?.length > 0 && (
      <TouchableOpacity activeOpacity={0.7} onPress={clearSearch}>
        <CrossIcon color={getColor("green", 500)} />
      </TouchableOpacity>
    )}
  </View>
    )
  } else {
    return (
      <B4 color={getColor("red", 700)}>Invalid variant!</B4>
    )
  }

};

export default SearchInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: getColor("light", 500),
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    height: 44, 
},
  borderedContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: getColor("light", 500),
    borderColor: getColor("light", 500),
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    height: 44, 
},
  input: {
    flex: 1,
    color: getColor("green", 700),
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "FunnelSans-Regular",
    height: "100%",
  },
});
