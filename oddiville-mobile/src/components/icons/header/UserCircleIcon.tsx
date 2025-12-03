import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const UserCircleIcon: React.FC<IconProps> = ({ color = "#fff", size = 32, style, ...props }) => {


  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M21.5 15A5.5 5.5 0 1116 9.5a5.506 5.506 0 015.5 5.5zm7.5 1A13 13 0 1116 3a13.014 13.014 0 0113 13zm-2 0A11.012 11.012 0 0015.566 5.009C9.68 5.236 4.984 10.14 5 16.03a10.956 10.956 0 002.78 7.27 9.963 9.963 0 012.72-2.663.5.5 0 01.604.04 7.479 7.479 0 009.785 0 .5.5 0 01.604-.04 9.965 9.965 0 012.723 2.663A10.953 10.953 0 0027 16z"
      fill={color}
    />
  </Svg>
  )
}

export default UserCircleIcon
