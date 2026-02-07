import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const EventIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 22, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="injected-svg"
      data-src="https://cdn.hugeicons.com/icons/transaction-history-stroke-rounded.svg?v=1.0.1"
      color={color}
      style={style}
      {...props}
    >
      <Path
        d="M19 10.5V10c0-3.771 0-5.657-1.172-6.828C16.657 2 14.771 2 11 2 7.229 2 5.343 2 4.172 3.172 3 4.343 3 6.229 3 10v4.5c0 3.287 0 4.931.908 6.038.166.202.352.388.554.554C5.57 22 7.212 22 10.5 22M7 7h8m-8 4h4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 18.5l-1.5-.55V15.5m-4.5 2a4.5 4.5 0 109 0 4.5 4.5 0 00-9 0z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default EventIcon