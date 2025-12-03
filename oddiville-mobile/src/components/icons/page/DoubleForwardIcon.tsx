import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const DoubleForwardIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 21, style, ...props }) => {
    const aspectRatio = 21 / 20;
    const height = size / aspectRatio;
  
  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 21 20"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M11.567 10.442l-6.25 6.25a.625.625 0 01-.884-.884L10.24 10 4.433 4.192a.625.625 0 11.884-.884l6.25 6.25a.623.623 0 010 .884zm6.25-.884l-6.25-6.25a.625.625 0 10-.884.884L16.49 10l-5.808 5.808a.625.625 0 10.884.884l6.25-6.25a.623.623 0 000-.884z"
      fill={color}
    />
  </Svg>
  )
}

export default DoubleForwardIcon
