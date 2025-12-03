import * as React from "react"
import Svg, {  G, Rect, Defs } from "react-native-svg"
import { IconRatingProps } from "@/src/types"
import { getColor } from "@/src/constants/colors"

const TwoStarIcon: React.FC<IconRatingProps> = ({ color = "yellow", active, size = 32, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <Rect width={32} height={32} rx={7.75758} fill={active ? getColor(color) : getColor(color, 100)} />
    <G filter="url(#filter0_d_1402_4586)">
      <Rect
        x={13.5283}
        y={7.75586}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        transform="rotate(90 13.528 7.756)"
        fill={active ? getColor(color, 100) : getColor(color)}
      />
    </G>
    <G filter="url(#filter1_d_1402_4586)">
      <Rect
        x={26.9473}
        y={7.83594}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        transform="rotate(90 26.947 7.836)"
        fill={active ? getColor(color, 100) : getColor(color)}
      />
    </G>
    <G filter="url(#filter2_d_1402_4586)">
      <Rect
        x={24.8398}
        y={17.9414}
        width={3.39394}
        height={18.857}
        rx={1.69697}
        transform="rotate(79.426 24.84 17.941)"
        fill={active ? getColor(color, 100) : getColor(color)}
      />
    </G>
    <Defs></Defs>
  </Svg>
  )
}

export default TwoStarIcon
