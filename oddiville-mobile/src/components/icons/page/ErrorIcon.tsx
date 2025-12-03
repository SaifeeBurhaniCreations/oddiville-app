import * as React from "react"
import Svg, { Path, G, Defs, ClipPath } from "react-native-svg"
import { IconProps } from "@/src/types"

const ErrorIcon: React.FC<IconProps> = ({ color = "#F55747", size = 17, style, ...props }) => {
  const aspectRatio = 17 / 16;
  const height = size / aspectRatio;
  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 17 16"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M8.5 1.5A6.5 6.5 0 1015 8a6.507 6.507 0 00-6.5-6.5zm0 12A5.5 5.5 0 1114 8a5.506 5.506 0 01-5.5 5.5zm-.5-5V5a.5.5 0 111 0v3.5a.5.5 0 11-1 0zm1.25 2.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      fill={color}
    />
  </Svg>
    )
}

export default ErrorIcon
