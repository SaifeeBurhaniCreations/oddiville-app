import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const LaneIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 18, style, ...props }) => {
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
      d="M17.438 11.25H13.5v-4.5h3.938a.562.562 0 100-1.125h-4.09a1.125 1.125 0 00-.973-.563h-4.5a1.125 1.125 0 00-.972.563H4.5a.563.563 0 10-1.125 0H.562a.562.562 0 100 1.125h2.813v4.5H.562a.563.563 0 000 1.125h2.813a.562.562 0 101.125 0h2.403a1.125 1.125 0 00.972.563h4.5a1.125 1.125 0 00.972-.563h4.09a.562.562 0 100-1.125zM4.5 6.75h2.25v4.5H4.5v-4.5zm3.375 5.063V6.186h4.5v2.25h-2.25a.563.563 0 100 1.126h2.25V11.811h-4.5z"
      fill={color}
    />
  </Svg>
  )
}

export default LaneIcon
