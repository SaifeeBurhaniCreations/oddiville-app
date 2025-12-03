import * as React from "react"
import Svg, { Path, G, Rect, Defs, ClipPath } from "react-native-svg"
import { IconRatingProps } from "@/src/types"
import { getColor } from "@/src/constants/colors"

const OneStarIcon: React.FC<IconRatingProps> = ({ color = "red", active, size = 32, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <G clipPath="url(#clip0_1402_4588)">
      <Rect width={size} height={size} rx={7.75758} fill={active ? getColor(color) : getColor(color, 100)} />
      <G filter="url(#filter0_d_1402_4588)">
        <Rect
          x={11.8535}
          y={11.1523}
          width={3.39394}
          height={8.45361}
          rx={1.69697}
          transform="rotate(55.955 11.854 11.152)"
          fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
      <G filter="url(#filter1_d_1402_4588)">
        <Rect
          x={18.2295}
          y={14.2383}
          width={3.39394}
          height={8.45361}
          rx={1.69697}
          transform="rotate(-58.44 18.23 14.238)"
          fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
      <G filter="url(#filter2_d_1402_4588)">
        <Path
          d="M11.636 26.03c-.803 0-1.472-.662-1.273-1.44a5.81 5.81 0 011.523-2.675 5.818 5.818 0 019.752 2.675c.198.778-.47 1.44-1.274 1.44h-8.728z"
          fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1402_4588">
        <Rect width={32} height={32} rx={7.75758} fill="#fff" />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default OneStarIcon
