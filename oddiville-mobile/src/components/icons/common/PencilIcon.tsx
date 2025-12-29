import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const PencilIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
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
        d="M17.759 5.733L14.268 2.24a1.25 1.25 0 00-1.768 0l-9.634 9.635a1.238 1.238 0 00-.366.883v3.492a1.25 1.25 0 001.25 1.25h3.491a1.24 1.24 0 00.884-.367l9.634-9.633a1.25 1.25 0 000-1.768zM7.24 16.25H3.75v-3.492l6.875-6.875 3.491 3.492-6.875 6.875zM15 8.49l-3.491-3.49 1.875-1.875 3.491 3.49L15 8.491z"
        fill={color}
      />
    </Svg>
  )
}

export default PencilIcon
