import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { getColor } from "@/src/constants/colors";
import { SwitchProps } from "@/src/types";
import { B4 } from "../typography/Typography";

const CustomSwitch = ({ isChecked, setIsChecked, children, post }: SwitchProps) => {
  const offset = useRef(new Animated.Value(isChecked ? 20 : 2)).current;

  useEffect(() => {
    Animated.timing(offset, {
      toValue: isChecked ? 20 : 4,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isChecked]);

  return (
    <View style={styles.switchContainer}>
      {!post && children && <B4 style={styles.text}>{children}</B4>}
      <TouchableOpacity
        style={[
          styles.track,
          { backgroundColor: isChecked ? getColor("green") : getColor("green", 100) },
        ]}
        activeOpacity={0.8}
        onPress={() => setIsChecked(!isChecked)}
      >
        <Animated.View style={[styles.thumb, { left: offset }]} />
      </TouchableOpacity>
      {post && children && <B4 style={styles.text}>{children}</B4>}
    </View>
  );
};

export default CustomSwitch;

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  text: {
    fontSize: 14,
  },
  track: {
    width: 32,
    height: 20,
    borderRadius: 24,
    backgroundColor: "#ddd",
    padding: 2,
    justifyContent: "center",
  },
  thumb: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
    position: "absolute",
    top: 6,
  },
});
