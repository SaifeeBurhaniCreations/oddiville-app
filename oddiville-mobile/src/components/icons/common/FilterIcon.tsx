import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const PencilIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M18.75 12.75a.75.75 0 01-.75.75H6A.75.75 0 116 12h12a.75.75 0 01.75.75zm3-5.25H2.25a.75.75 0 000 1.5h19.5a.75.75 0 100-1.5zm-7.5 9h-4.5a.75.75 0 100 1.5h4.5a.75.75 0 100-1.5z"
      fill={color}
    />
  </Svg>
  )
}

export default PencilIcon
