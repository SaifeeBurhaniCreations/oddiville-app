import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const BagIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 22, style, ...props }) => {
  return (
<Svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M18 7.241c-1.523 7.449.709 11.815-.452 12.759 0 0-3.552-.517-6.497-.517S5.393 20 5.393 20C4.268 18.895 6.856 12.48 5 7.295m13-.054l-.03-2.094M18 7.241l-10.715.044M5 7.295l.018-2.148M5 7.295l2.285-.01M5.018 5.147l.016-1.949a.2.2 0 01.2-.198h12.51a.2.2 0 01.2.197l.025 1.95m-12.951 0h2.267m10.684 0H7.285m0 0v2.138"
        stroke={color}
        strokeWidth={1.25}
      />
    </Svg>
  )
}

export default BagIcon
