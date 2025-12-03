import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ChamberIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M15.625 3.125H4.375a1.25 1.25 0 00-1.25 1.25v11.25a1.25 1.25 0 001.25 1.25h11.25a1.25 1.25 0 001.25-1.25V4.375a1.25 1.25 0 00-1.25-1.25zm0 1.25v5H4.375v-5h11.25zm-7.5 6.25v5h-1.25v-5h1.25zm1.25 0h1.25v5h-1.25v-5zm2.5 0h1.25v5h-1.25v-5zm-7.5 0h1.25v5h-1.25v-5zm11.25 5h-1.25v-5h1.25v5z"
      fill={color}
    />
  </Svg>
  )
}

export default ChamberIcon
