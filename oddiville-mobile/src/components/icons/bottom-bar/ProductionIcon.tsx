import { IconProps } from "@/src/types"
import React from "react"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

const ProductionIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
      {...props}
    >
      <G
        clipPath="url(#clip0_2968_13130)"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M.714.714h18.572M.714 5.357h1.548M17.738 5.357h1.547M.714 14.643h1.548M17.738 14.643h1.547M.714 10h1.548M17.738 10h1.547M.714 19.286h18.572"
          stroke="#3D874C"
        />
        <Path
          d="M5.513 12.427a2.326 2.326 0 002.046 2.05c.794.09 1.61.166 2.441.166.832 0 1.648-.076 2.442-.165a2.327 2.327 0 002.045-2.05c.085-.79.156-1.601.156-2.428s-.071-1.638-.156-2.429a2.327 2.327 0 00-2.045-2.05c-.795-.088-1.61-.164-2.442-.164-.832 0-1.647.076-2.441.165a2.327 2.327 0 00-2.046 2.05c-.084.79-.156 1.6-.156 2.428 0 .827.072 1.638.156 2.427z"
          stroke={color}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2968_13130">
          <Path fill="#fff" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default ProductionIcon
