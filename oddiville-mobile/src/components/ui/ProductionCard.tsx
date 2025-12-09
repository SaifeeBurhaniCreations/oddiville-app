import React, { useState, useCallback } from "react";
import {
  ImageBackground,
  Image,
  StyleSheet,
  View,
  Platform,
  LayoutChangeEvent,
} from "react-native";
import { getColor } from "@/src/constants/colors";
import { ProductionCardProps } from "@/src/types";
import { B4, H2 } from "../typography/Typography";
import Tag from "./Tag";
import Lane1 from "@/src/assets/images/lane-bg/lane-1-bg.jpeg";

const BLUR_RADIUS_ANDROID = 8;
const BLUR_RADIUS_IOS = 18;

function resolveImageSource(image: any) {
  if (!image) return Lane1;
  if (typeof image === "number") return image;
  if (typeof image === "string") return { uri: image };
  if (typeof image === "object") {
    if (image.uri) return { uri: image.uri };
    if (image.url) return { uri: image.url };
    return image;
  }
  return Lane1;
}

export default function ProductionCard({
  productName,
  description,
  badgeText,
  laneName,
  image,
}: ProductionCardProps) {
  const isOccupied = badgeText === "Occupied";

  const BLUR_HEIGHT = isOccupied ? 220 : 96;

  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    setCardHeight(h);
  }, []);

  const blurRadius =
    Platform.OS === "android" ? BLUR_RADIUS_ANDROID : BLUR_RADIUS_IOS;
  const topOffset = cardHeight ? -(cardHeight - BLUR_HEIGHT) : undefined;

  const bgSource = resolveImageSource(image);

  return (
    <ImageBackground
      source={bgSource}
      style={styles.card}
      imageStyle={styles.cardBgImage}
      onLayout={onLayout}
      resizeMode="cover"
    >
      <View style={styles.cardHeader}>
        <Tag color={isOccupied ? "yellow" : "red"} size="lg">
          {badgeText}
        </Tag>
      </View>

      <View
        style={[
          styles.blurStripContainer,
          {
            height: BLUR_HEIGHT,
            zIndex: 5,
            elevation: 5,
          },
        ]}
        pointerEvents="none"
      >
        {typeof topOffset !== "undefined" && (
          <Image
            source={bgSource}
            style={[styles.blurImageAligned, { top: topOffset }]}
            blurRadius={blurRadius}
            resizeMode="cover"
          />
        )}

        <View
          style={[
            styles.blurDim,
            {
              backgroundColor: isOccupied
                ? "rgba(0,0,0,0.6)"
                : "rgba(0,0,0,0.30)",
            },
          ]}
        />

        <View style={styles.textOnBlur}>
          <H2 color={getColor("light")}>{productName}</H2>
          <B4 color={getColor("light")}>{laneName}</B4>
          <B4 color={getColor("light")}>{description}</B4>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    position: "relative",
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    paddingBottom: 12,
    minHeight: 220,
  },
  cardBgImage: {
    borderRadius: 16,
    resizeMode: "cover",
  },

  cardHeader: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 20,
    elevation: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  blurStripContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    backgroundColor: "transparent",
  },

  blurImageAligned: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    height: "100%",
  },

  blurDim: {
    ...StyleSheet.absoluteFillObject,
  },

  textOnBlur: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "column",
  },
});