import * as React from "react"
import Svg, { G, Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const RefreshIcon: React.FC<IconProps> = ({ color = "#fff", size = 28, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M26.25 6.126v5.25a.875.875 0 01-.875.875h-5.25a.875.875 0 110-1.75h2.997l-2.909-2.664-.027-.027a8.75 8.75 0 10-.183 12.554.876.876 0 011.203 1.272A10.439 10.439 0 0114 24.501h-.145A10.5 10.5 0 1121.41 6.563l3.09 2.822V6.126a.875.875 0 011.75 0z"
      fill={color}
    />
  </Svg>
  )
}

export default RefreshIcon
