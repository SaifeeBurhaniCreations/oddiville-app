import { getColor } from '@/src/constants/colors';
import { useMemoizedStyle } from '@/src/hooks/useMemoizedStyle';
import { loaderProps } from '@/src/types';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const Loader = ({ size = 50, strokeWidth = 8, color = "green", style }: loaderProps) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyle = useMemoizedStyle({
    justifyContent: 'center',
    alignItems: 'center',
  }, []);
  

  return (
    <View style={[containerStyle, style]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
              <Stop offset="100%" stopColor={getColor(color, 500)} stopOpacity="1" />
              <Stop offset="0%" stopColor={getColor(color, 500)} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="40"
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="200"
            strokeDashoffset="100"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default memo(Loader);

