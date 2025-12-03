import * as React from "react"
import Svg, { Path, G, Rect, Defs, ClipPath } from "react-native-svg"
import { IconRatingProps } from "@/src/types"
import { getColor } from "@/src/constants/colors"

const FiveStarIcon: React.FC<IconRatingProps> = ({ color = "blue", size = 32, active,  style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <G clipPath="url(#clip0_1402_4580)">
      <Rect width={32} height={32} rx={7.75758} fill={active ? getColor(color) : getColor(color, 100)} />
      <G filter="url(#filter0_d_1402_4580)">
        <Rect
          x={7.60449}
          y={7.27344}
          width={3.39394}
          height={8.45361}
          rx={1.69697}
          fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
      <G filter="url(#filter1_d_1402_4580)">
        <Rect
          x={24.417}
          y={15.8066}
          width={3.39394}
          height={8.45361}
          rx={1.69697}
          transform="rotate(-180 24.417 15.807)"
                    fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
      <G filter="url(#filter2_d_1402_4580)">
        <Path
          d="M22.79 19.877c.802 0 1.467.656 1.326 1.447a8.24 8.24 0 01-11.269 6.168 8.244 8.244 0 01-4.96-6.168c-.141-.79.523-1.447 1.326-1.447H22.79z"
                    fill={active ? getColor(color, 100) : getColor(color)}
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1402_4580">
        <Rect width={32} height={32} rx={7.75758} fill="#fff" />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default FiveStarIcon
