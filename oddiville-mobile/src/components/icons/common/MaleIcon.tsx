import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const MaleIcon: React.FC<IconProps> = ({ color = "#fff", size = 20, style, ...props }) => {
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
        d="M16.875 2.5h-3.75a.625.625 0 000 1.25h2.241L12.08 7.037a6.25 6.25 0 10.884.883l3.287-3.286v2.241a.625.625 0 001.25 0v-3.75a.625.625 0 00-.625-.625zm-5.216 12.913a5 5 0 110-7.072 5.008 5.008 0 010 7.072z"
        fill={color}
      />
    </Svg>
  )
}

export default MaleIcon
