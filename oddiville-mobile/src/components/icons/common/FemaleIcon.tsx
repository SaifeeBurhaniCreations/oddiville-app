import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const FemaleIcon: React.FC<IconProps> = ({ color = "#fff", size = 20, style, ...props }) => {
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
      d="M16.25 7.5a6.25 6.25 0 10-6.875 6.219v1.906h-2.5a.625.625 0 000 1.25h2.5v1.875a.625.625 0 101.25 0v-1.875h2.5a.625.625 0 100-1.25h-2.5v-1.906a6.258 6.258 0 005.625-6.22zM5 7.5a5 5 0 1110 0 5 5 0 01-10 0z"
      fill={color}
    />
  </Svg>
  )
}

export default FemaleIcon
