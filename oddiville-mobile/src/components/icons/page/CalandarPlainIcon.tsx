import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const CalandarPlainIcon: React.FC<IconProps> = ({ color = "#548076", size = 16, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M13 2h-1.5v-.5a.5.5 0 00-1 0V2h-5v-.5a.5.5 0 10-1 0V2H3a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1zM4.5 3v.5a.5.5 0 101 0V3h5v.5a.5.5 0 001 0V3H13v2H3V3h1.5zM13 13H3V6h10v7z"
      fill={color}
    />
  </Svg>
  )
}

export default CalandarPlainIcon
