import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ThreeDot: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
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
      d="M10.938 10a.937.937 0 11-1.875 0 .937.937 0 011.874 0zM10 5.625a.937.937 0 100-1.874.937.937 0 000 1.874zm0 8.75a.938.938 0 100 1.875.938.938 0 000-1.875z"
      fill={color}
    />
  </Svg>
  )
}

export default ThreeDot
