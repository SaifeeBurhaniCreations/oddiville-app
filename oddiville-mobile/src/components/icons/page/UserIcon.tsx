import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const UserIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, style, ...props }) => {
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
      d="M8.244 11.104a4.219 4.219 0 10-4.676 0 6.738 6.738 0 00-3.32 2.651.562.562 0 10.942.614 5.626 5.626 0 019.432 0 .563.563 0 00.942-.614 6.738 6.738 0 00-3.32-2.652zm-5.432-3.51a3.094 3.094 0 116.188 0 3.094 3.094 0 01-6.188 0zm14.776 6.94a.563.563 0 01-.778-.165 5.614 5.614 0 00-4.716-2.557.563.563 0 010-1.125 3.094 3.094 0 10-1.15-5.967.563.563 0 11-.417-1.044 4.219 4.219 0 013.905 7.428 6.738 6.738 0 013.32 2.651.562.562 0 01-.164.778z"
      fill={color}
    />
  </Svg>
    )
}

export default UserIcon
