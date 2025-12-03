import { IconProps } from "@/src/types"
import React from "react"
import Svg, { Path } from "react-native-svg"

const HomeIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  const aspectRatio = 21 / 18;
  const height =  size / aspectRatio;

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 21 18"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M10.75 10.132a2.382 2.382 0 012.382 2.383v4.342H8.367v-4.342a2.382 2.382 0 012.382-2.383z"
        fill="#CCD6D1"
        stroke="#0A493B"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.117 16.857h9.265c.98 0 1.814-.677 1.963-1.594.238-1.457.292-2.935.165-4.402h1.792c.577 0 .928-.603.618-1.065l-.31-.462a28.36 28.36 0 00-7.008-7.214l-.966-.695a1.53 1.53 0 00-1.772 0l-.967.695A28.363 28.363 0 001.89 9.334l-.31.462c-.31.462.04 1.065.618 1.065H3.99a17.81 17.81 0 00.165 4.402c.15.917.983 1.594 1.963 1.594z"
        stroke="#3D874C"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default HomeIcon
