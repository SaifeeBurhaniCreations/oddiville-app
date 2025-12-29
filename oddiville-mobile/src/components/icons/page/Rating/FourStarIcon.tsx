import * as React from "react"
import Svg, { Path, G, Rect, Defs } from "react-native-svg"
import { IconRatingProps } from "@/src/types"

const FourStarIcon: React.FC<IconRatingProps> = ({
  color = "green",
  size = 32,
  active,
  style,
  ...props
}) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    style={style}
    {...props}
  >
    <Rect
      width={size}
      height={size}
      rx={7.75758}
      fill="#3D874C"
      fillOpacity={active ? 0.8 : 0.1}
    />
    <G opacity={1} filter="url(#filter0_d_1402_4632)">
      <Rect
        x={7.60449}
        y={7.27344}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        fill={active ? "#DFF6E2" : "#3D874C"}
      />
    </G>
    <G opacity={1} filter="url(#filter1_d_1402_4632)">
      <Rect
        x={24.417}
        y={15.8066}
        width={3.39394}
        height={8.45361}
        rx={1.69697}
        transform="rotate(-180 24.417 15.807)"
        fill={active ? "#DFF6E2" : "#3D874C"}
      /> 
    </G>
    <Path
      opacity={1}
      d="M7.272 21.818c3.621 4.61 10.863 6.914 17.94 0"
      stroke={active ? "#DFF6E2" : "#3D874C"}
      strokeWidth={2.90909}
      strokeLinecap="round"
    />
    <Defs></Defs>
  </Svg>
  )
}

export default FourStarIcon
