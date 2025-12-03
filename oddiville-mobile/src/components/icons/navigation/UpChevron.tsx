import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const UpChevron: React.FC<IconProps> = ({ color = "#3D874C", size = 20, style, ...props }) => {
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
      d="M16.692 13.308l-6.25-6.25a.624.624 0 00-.884 0l-6.25 6.25a.625.625 0 00.885.885L10 8.384l5.808 5.809a.626.626 0 10.884-.885z"
      fill={color}
    />
  </Svg>
  )
}

export default UpChevron
