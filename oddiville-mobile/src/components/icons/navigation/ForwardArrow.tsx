import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ForwardArrow: React.FC<IconProps> = ({ color = "#3D874C", size = 18, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <Path
        d="M13.854 8.354l-4.5 4.5a.5.5 0 11-.708-.707L12.293 8.5H2.5a.5.5 0 110-1h9.793L8.646 3.854a.5.5 0 11.708-.707l4.5 4.5a.502.502 0 010 .707z"
        fill={color}
      />
    </Svg>
  )
}

export default ForwardArrow
