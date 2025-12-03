import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const DoubleBackIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 21, style, ...props }) => {
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
      d="M10.683 10.442l6.25 6.25a.625.625 0 10.884-.884L12.01 10l5.808-5.808a.625.625 0 10-.884-.884l-6.25 6.25a.623.623 0 000 .884zm-6.25-.884l6.25-6.25a.625.625 0 11.884.884L5.76 10l5.808 5.808a.625.625 0 11-.884.884l-6.25-6.25a.625.625 0 010-.884z"
      fill={color}
    />
  </Svg>
  )
}

export default DoubleBackIcon
