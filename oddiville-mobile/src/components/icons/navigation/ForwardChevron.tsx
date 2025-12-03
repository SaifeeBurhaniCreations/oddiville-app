import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ForwardChevron: React.FC<IconProps> = ({ color = "#0A493B", size = 16,style, ...props }) => {
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
        d="M5.854 3.146l5 5a.5.5 0 010 .707l-5 5a.5.5 0 01-.707-.707L9.793 8.5 5.147 3.853a.5.5 0 11.707-.707z"
        fill={color}
      />
    </Svg>
  )
}

export default ForwardChevron
