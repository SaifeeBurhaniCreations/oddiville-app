import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const RightChevron: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M8.737 3.638l6.875 6.875a.689.689 0 010 .973l-6.875 6.875a.688.688 0 11-.973-.973L14.154 11 7.763 4.61a.688.688 0 11.973-.973z"
      fill={color}
    />
  </Svg>
  )
}

export default RightChevron
