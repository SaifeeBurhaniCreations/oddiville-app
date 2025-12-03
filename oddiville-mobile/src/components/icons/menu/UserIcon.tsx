import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const UserIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 22, style, ...props }) => {

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
        d="M10.076 13.571a5.155 5.155 0 10-5.714 0 8.235 8.235 0 00-4.058 3.241.687.687 0 101.151.751 6.875 6.875 0 0111.528 0 .688.688 0 001.151-.75 8.235 8.235 0 00-4.058-3.242zm-6.638-4.29a3.781 3.781 0 117.562 0 3.781 3.781 0 01-7.562 0zm18.059 8.482a.687.687 0 01-.952-.2 6.86 6.86 0 00-5.764-3.125.687.687 0 110-1.375 3.78 3.78 0 10-1.404-7.294.687.687 0 11-.51-1.276 5.156 5.156 0 014.772 9.078 8.235 8.235 0 014.058 3.241.688.688 0 01-.2.951z"
        fill={color}
      />
    </Svg>
  )
}

export default UserIcon