import * as React from "react"
import Svg, { Path, G, Defs, ClipPath } from "react-native-svg"
import { IconProps } from "@/src/types"

const TruckIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 20, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      style={style}
      {...props}
    >
      <G clipPath="url(#clip0_817_5287)">
        <Path
          d="M17.96 8.227l-.985-2.461a1.12 1.12 0 00-1.044-.704H13.5V4.5a.563.563 0 00-.563-.563H2.25a1.125 1.125 0 00-1.125 1.126v7.875a1.125 1.125 0 001.125 1.124h1.195a2.25 2.25 0 004.36 0h3.515a2.25 2.25 0 004.36 0h1.195A1.125 1.125 0 0018 12.938v-4.5a.559.559 0 00-.04-.211zm-4.46-2.04h2.431l.675 1.688H13.5V6.187zM2.25 5.063h10.125v4.5H2.25v-4.5zm3.375 9.563a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25zm5.695-1.688H7.805a2.25 2.25 0 00-4.36 0H2.25v-2.25h10.125v.866a2.257 2.257 0 00-1.055 1.384zm2.18 1.688a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25zm3.375-1.688H15.68a2.254 2.254 0 00-2.18-1.687V9h3.375v3.938z"
          fill={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_817_5287">
          <Path fill="#fff" d="M0 0H18V18H0z" />
        </ClipPath>
      </Defs>
    </Svg>
    )
}

export default TruckIcon
