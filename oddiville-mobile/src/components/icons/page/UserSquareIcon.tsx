import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const UserSquareIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, style, ...props }) => {
  return (
    <Svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M14.625 2.25H3.375A1.125 1.125 0 002.25 3.375v11.25a1.125 1.125 0 001.125 1.125h11.25a1.125 1.125 0 001.125-1.125V3.375a1.125 1.125 0 00-1.125-1.125zM6.75 8.438a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zm-1.922 6.187a4.5 4.5 0 018.343 0H4.829zm9.797 0h-.258a5.62 5.62 0 00-3.282-3.536 3.375 3.375 0 10-4.17 0 5.618 5.618 0 00-3.282 3.536h-.258V3.375h11.25v11.25z"
      fill={color}
    />
  </Svg>
    )
}

export default UserSquareIcon
