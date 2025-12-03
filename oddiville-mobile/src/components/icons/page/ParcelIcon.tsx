import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ParcelIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <Path
        d="M15.727 4.651L9.54 1.266a1.117 1.117 0 00-1.08 0L2.272 4.653a1.125 1.125 0 00-.584.984v6.725a1.125 1.125 0 00.585.984l6.187 3.387a1.117 1.117 0 001.08 0l6.188-3.387a1.125 1.125 0 00.585-.984V5.638a1.125 1.125 0 00-.585-.987zM9 2.251l5.649 3.093-2.093 1.146-5.65-3.094L9 2.25zm0 6.187L3.351 5.344l2.384-1.305 5.649 3.094L9 8.438zm-6.188-2.11l5.626 3.079v6.032l-5.626-3.077V6.328zm12.376 6.032l-5.626 3.079v-6.03l2.25-1.23v2.509a.563.563 0 001.126 0V7.562l2.25-1.234v6.032z"
        fill={color}
      />
    </Svg>
  )
}

export default ParcelIcon
