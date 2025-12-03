import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const BoxIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 18, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    style={style}
    {...props}
    >
    <Path
      d="M15.727 4.65L9.54 1.264a1.117 1.117 0 00-1.08 0L2.272 4.651a1.125 1.125 0 00-.584.985v6.724a1.125 1.125 0 00.585.985l6.187 3.387a1.116 1.116 0 001.08 0l6.188-3.387a1.126 1.126 0 00.585-.985V5.636a1.124 1.124 0 00-.585-.986zM9 2.249l5.649 3.093-2.093 1.146-5.65-3.093L9 2.249zm0 6.187L3.351 5.342l2.384-1.305 5.649 3.094L9 8.436zm-6.188-2.11l5.626 3.079v6.032l-5.626-3.076V6.327zm12.376 6.032l-5.626 3.08v-6.03l2.25-1.231v2.51a.563.563 0 001.126 0V7.56l2.25-1.234V12.358z"
      fill={color}
    />
    </Svg>
  )
}

export default BoxIcon
