import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ClockIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 18, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M9 2.813a6.75 6.75 0 106.75 6.75A6.758 6.758 0 009 2.813zm0 12.374a5.625 5.625 0 115.625-5.624A5.631 5.631 0 019 15.186zm3.21-8.835a.562.562 0 010 .796L9.399 9.96a.564.564 0 01-.796-.795l2.813-2.813a.563.563 0 01.796 0zM6.75 1.125a.563.563 0 01.563-.563h3.375a.563.563 0 110 1.125H7.312a.562.562 0 01-.562-.562z"
        fill={color}
      />
    </Svg>
  )
}

export default ClockIcon
