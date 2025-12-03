import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ContractorIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="injected-svg"
    color={color}
    style={style}
    {...props}
  >
    <Path
      d="M20 22v-3c0-1.886 0-2.828-.586-3.414C18.828 15 17.886 15 16 15h-2l-2 2-2-2H8c-1.886 0-2.828 0-3.414.586C4 16.172 4 17.114 4 19v3M16 15v7M8 15v7M15.5 9V7a3.5 3.5 0 10-7 0v2a3.5 3.5 0 107 0zM7.5 7.5h9M12 2v1.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  )
}

export default ContractorIcon
