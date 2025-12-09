import { IconProps } from "@/src/types"
import React from "react"
import Svg, { Path } from "react-native-svg"

const ProductionActiveIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
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
        d="M.714.714h18.572M.714 5.357h1.548M17.738 5.357h1.547M.714 14.643h1.548M17.738 14.643h1.547M.714 10h1.548M17.738 10h1.547M.714 19.286h18.572"
        stroke="#3D874C"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5.513 12.428a2.327 2.327 0 002.046 2.05c.794.09 1.61.165 2.441.165.832 0 1.648-.076 2.442-.165a2.327 2.327 0 002.045-2.05c.085-.79.156-1.601.156-2.428s-.071-1.638-.156-2.428a2.327 2.327 0 00-2.045-2.05c-.795-.088-1.61-.165-2.442-.165-.832 0-1.647.076-2.441.165a2.327 2.327 0 00-2.046 2.05c-.084.79-.156 1.6-.156 2.428 0 .828.072 1.638.156 2.428z"
        fill={color}
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default ProductionActiveIcon
