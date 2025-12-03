import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const DownChevron: React.FC<IconProps> = ({ color = "#3D874C", size = 20, style, ...props }) => {
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
      d="M16.692 7.943l-6.25 6.25a.625.625 0 01-.884 0l-6.25-6.25a.625.625 0 01.885-.885L10 12.867l5.808-5.809a.625.625 0 11.884.885z"
      fill={color}
    />
  </Svg>
  )
}

export default DownChevron
