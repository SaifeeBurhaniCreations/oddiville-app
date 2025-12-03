import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const LeftChevron: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
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
      d="M14.638 3.638l-6.875 6.875a.689.689 0 000 .973l6.875 6.875a.688.688 0 10.973-.973L9.221 11l6.39-6.389a.686.686 0 00-.223-1.122.688.688 0 00-.75.15z"
      fill={color}
    />
  </Svg>
  )
}

export default LeftChevron
