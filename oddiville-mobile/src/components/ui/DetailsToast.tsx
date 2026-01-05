import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  type?: ToastType;
  message: string;
  visible: boolean;
  duration?: number; // ms, default 3000
  onHide?: () => void;
}

const DetailsToast: React.FC<ToastProps> = ({
  type = "info",
  message,
  visible,
  duration = 4000,
  onHide,
}) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => onHide && onHide());
        }, duration);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const backgroundColors = {
    success: "#3D874C",
    error: "#F55747",
    info: "#45B3F7",
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: backgroundColors[type], opacity },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

export default DetailsToast;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 80,
    right: 24,
    maxWidth: 300, 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    backgroundColor: "#000",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    flexWrap: "wrap", 
  },
});
