import React, { useState } from "react";
import {
  Image,
  View,
  StyleSheet,
  ImageSourcePropType,
  ImageResizeMode,
  StyleProp,
  ImageStyle,
} from "react-native";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";
import Loader from "./Loader";
import defaultFallbackImg from "@/src/assets/images/fallback/colourful/product.png";

export type CustomImageProps = {
  src?: ImageSourcePropType | string | null;
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ImageStyle>;
  borderRadius?: number;
  resizeMode?: ImageResizeMode;
  fallback?: ImageSourcePropType;
  loadingIndicator?: boolean;
};

const CustomImage: React.FC<CustomImageProps> = ({
  src,
  width = "100%",
  height = "100%",
  style = {},
  borderRadius,
  resizeMode = "cover",
  fallback = defaultFallbackImg,
  loadingIndicator = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  const source: ImageSourcePropType = (() => {
    if (imageError || !src) return fallback;

    if (typeof src === "string") {
      return { uri: src };
    }

    return src;
  })();

  const baseImageStyle: ImageStyle = {
    borderRadius: borderRadius ?? 16,
    width: width as any,
    height: height as any,
  };

  const imageStyle = useMemoizedStyle(
    [baseImageStyle, style],
    [width, height, borderRadius, style]
  );

  return (
    <View style={[styles.container, { width: width as any, height: height as any }]}>
      {loading && loadingIndicator && (
        <View style={styles.loader}>
          <Loader />
        </View>
      )}

      <Image
        source={source}
        style={imageStyle}
        resizeMode={resizeMode}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setImageError(true);
        }}
      />
    </View>
  );
};

export default CustomImage;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  loader: {
    position: "absolute",
    zIndex: 1,
  },
});
