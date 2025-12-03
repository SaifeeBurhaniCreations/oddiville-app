import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
import { IconProps } from "@/src/types"

const TruckRightIcon: React.FC<IconProps> = ({ color = "#0982CE", size = 24, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    {...props}
  >
    <G clipPath="url(#clip0_1402_4775)">
      <Path
        d="M23.946 10.969l-1.313-3.281a1.493 1.493 0 00-1.391-.938H18V6a.75.75 0 00-.75-.75H3a1.5 1.5 0 00-1.5 1.5v10.5a1.5 1.5 0 001.5 1.5h1.594a3 3 0 005.812 0h4.688a3 3 0 005.812 0H22.5a1.5 1.5 0 001.5-1.5v-6a.742.742 0 00-.054-.281zM18 8.25h3.242l.9 2.25H18V8.25zM3 6.75h13.5v6H3v-6zM7.5 19.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm7.594-2.25h-4.688a3 3 0 00-5.812 0H3v-3h13.5v1.154a3.008 3.008 0 00-1.406 1.846zM18 19.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm4.5-2.25h-1.594A3.007 3.007 0 0018 15v-3h4.5v5.25z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_1402_4775">
        <Path fill="#fff" d="M0 0H24V24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
    )
}

export default TruckRightIcon
