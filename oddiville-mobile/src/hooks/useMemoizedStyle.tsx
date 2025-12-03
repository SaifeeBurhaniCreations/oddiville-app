import { useMemo } from "react";
import {
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";

type RNStyle = ViewStyle | TextStyle | ImageStyle;

export function useMemoizedStyle<T extends RNStyle>(
  style: StyleProp<T>,
  deps: any[] = []
): StyleProp<T> {
  return useMemo(() => {
    return style ?? undefined; 
  }, deps);
}
