import { IconProps } from "@/src/types";
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HomeActiveIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {

  const aspectRatio = 20 / 17;
  const height =  size / aspectRatio;

  return (
    <Svg
      width={size}
      height={height}
      viewBox="0 0 20 17"
      style={style}
      fill="none"
      {...props}
    >
      <Path
        d="M5.118 15.857h9.264c.98 0 1.815-.677 1.964-1.594.237-1.457.292-2.935.165-4.402h1.791c.578 0 .928-.603.619-1.065l-.31-.462a28.362 28.362 0 00-7.009-7.214l-.966-.695a1.53 1.53 0 00-1.772 0l-.966.695A28.363 28.363 0 00.89 8.334l-.31.462c-.31.462.04 1.065.618 1.065H2.99a17.809 17.809 0 00.164 4.402c.15.917.983 1.594 1.964 1.594z"
        fill="#3D874C"
      />
      <Path
        d="M9.75 9.132a2.382 2.382 0 012.382 2.383v4.342H7.368v-4.342A2.382 2.382 0 019.75 9.132z"
        fill="#0A493B"
        stroke="#CCD6D1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default HomeActiveIcon
