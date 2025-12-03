import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const BoxIcon: React.FC<IconProps> = ({ color = "#fff", size = 51, style, ...props }) => {

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 51 51"
      fill="none"
      style={style}
      {...props}
    >
      <G opacity={0.3} clipPath="url(#clip0_490_4205)">
        <Path
          d="M23.375 29.219a1.598 1.598 0 00-1.594-1.594h-7.968V34a2.125 2.125 0 01-4.25 0v-6.375h-7.97A1.598 1.598 0 000 29.219v20.187C0 50.284.716 51 1.594 51H21.78c.876 0 1.594-.716 1.594-1.594V29.22zm27.625 0a1.598 1.598 0 00-1.594-1.594h-7.968V34a2.125 2.125 0 01-4.25 0v-6.375h-7.97a1.598 1.598 0 00-1.593 1.594v20.187c0 .878.716 1.594 1.594 1.594h20.187c.876 0 1.594-.716 1.594-1.594V29.22zM37.187 1.594A1.6 1.6 0 0035.594 0h-7.969v6.375a2.125 2.125 0 01-4.25 0V0h-7.969a1.598 1.598 0 00-1.594 1.594V21.78c0 .878.717 1.594 1.594 1.594h20.188c.875 0 1.593-.716 1.593-1.594V1.594z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_490_4205">
          <Path fill={color} d="M0 0H51V51H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default BoxIcon
