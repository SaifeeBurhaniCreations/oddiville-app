import { StyleSheet, View } from "react-native";
import React from "react";
import Loader from "./Loader";
import { getColor } from "@/src/constants/colors";

const OverlayLoader = () => {
  return (
    <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    </View>
  );
};

export default OverlayLoader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
