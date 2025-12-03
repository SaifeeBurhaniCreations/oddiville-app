import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const InfoCircleIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, style, ...props }) => {
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
        d="M9 1.688A7.312 7.312 0 1016.313 9 7.32 7.32 0 009 1.687zm0 13.5A6.187 6.187 0 1115.188 9 6.195 6.195 0 019 15.188zm1.125-2.813a.562.562 0 01-.563.563 1.125 1.125 0 01-1.124-1.126V9a.562.562 0 110-1.125A1.125 1.125 0 019.562 9v2.813a.562.562 0 01.563.562zm-2.25-6.469a.844.844 0 111.687 0 .844.844 0 01-1.687 0z"
        fill={color}
      />
    </Svg>
  )
}

export default InfoCircleIcon
