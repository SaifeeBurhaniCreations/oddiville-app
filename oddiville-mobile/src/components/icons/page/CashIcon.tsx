import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const CashIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 18, style, ...props }) => {
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
          d="M9 6.188a2.812 2.812 0 100 5.624 2.812 2.812 0 000-5.624zm0 4.5a1.688 1.688 0 110-3.376 1.688 1.688 0 010 3.375zm7.875-6.75H1.125a.562.562 0 00-.563.562v9a.562.562 0 00.563.563h15.75a.562.562 0 00.563-.563v-9a.563.563 0 00-.563-.563zm-3.259 9H4.384a3.993 3.993 0 00-2.697-2.697V7.759a3.992 3.992 0 002.697-2.697h9.232a3.992 3.992 0 002.697 2.697v2.482a3.993 3.993 0 00-2.697 2.697zm2.697-6.373a2.87 2.87 0 01-1.503-1.503h1.502v1.503zM3.19 5.062a2.87 2.87 0 01-1.502 1.503V5.062H3.19zm-1.502 6.373a2.87 2.87 0 011.502 1.502H1.688v-1.502zm13.122 1.502a2.87 2.87 0 011.502-1.502v1.502H14.81z"
          fill={color}
        />
      </Svg>
    )
}

export default CashIcon
