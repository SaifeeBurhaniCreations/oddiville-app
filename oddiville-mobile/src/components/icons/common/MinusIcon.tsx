import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const MinusIcon: React.FC<IconProps> = ({ color = "#fff", size = 10, style, ...props }) => {
  const aspectRatio = 10 / 2;
  const height = size / aspectRatio;

  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 10 2"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M9.5 1.25c0 .199-.04.39-.11.53-.07.141-.166.22-.265.22H.875c-.1 0-.195-.079-.265-.22C.54 1.64.5 1.45.5 1.25S.54.86.61.72C.68.579.776.5.875.5h8.25c.1 0 .195.079.265.22.07.14.11.331.11.53z"
      fill={color}
    />
  </Svg>
  )
}

export default MinusIcon
