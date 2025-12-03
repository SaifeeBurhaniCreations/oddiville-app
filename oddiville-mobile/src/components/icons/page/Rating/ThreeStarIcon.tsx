import * as React from "react"
import Svg, { G, Rect, Defs } from "react-native-svg"
import { IconRatingProps } from "@/src/types"
import { getColor } from "@/src/constants/colors"

const ThreeStarIcon: React.FC<IconRatingProps> = ({ color = "light", active, size = 32, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <Rect width={32} height={32} rx={7.75758} fill={active ? getColor("green", 200) : getColor(color, 200)} />
    <G filter="url(#filter0_d_1402_4584)">
      <Rect
        x={7.60449}
        y={7.27344}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        fill={active ? getColor(color, 200) : getColor("green", 200)}
      />
    </G>
    <G filter="url(#filter1_d_1402_4584)">
      <Rect
        x={24.417}
        y={15.8066}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        transform="rotate(-180 24.417 15.807)"
        fill={active ? getColor(color, 200) : getColor("green", 200)}
      />
    </G>
    <G filter="url(#filter2_d_1402_4584)">
      <Rect
        x={25.3115}
        y={21.6836}
        width={3.39394}
        height={18.857}
        rx={1.69697}
        transform="rotate(90 25.311 21.684)"
        fill={active ? getColor(color, 200) : getColor("green", 200)}
      />
    </G>
    <Defs></Defs>
  </Svg>
  )
}

export default ThreeStarIcon
