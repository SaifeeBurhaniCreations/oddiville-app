import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PorductionBagIcon: React.FC<IconProps> = ({ color = "#fff", size = 60, style, ...props }) => {

  const aspectRatio = 75 / 86;
  const height = size / aspectRatio;

  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 75 86"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M21.25 15.81c-.03 1.937.782 4.006 2.542 5.018h16.416c1.76-1.012 2.571-3.08 2.542-5.018a5.06 5.06 0 00-4.874-5.055L43.254 0H20.746l5.377 10.755a5.06 5.06 0 00-4.873 5.055zm37.625 59.44V43c0-6.993-3.34-13.206-8.511-17.133H13.636C8.465 29.794 5.125 36.007 5.125 43v32.25a5.888 5.888 0 00-5.888 5.888V86h65.526v-4.862a5.888 5.888 0 00-5.888-5.888zm-29.51-8.774h-9.22l-1.799-3.116 4.604-7.974 4.364 2.52-2.04 3.531h4.09v5.04zm2.652-16.716l-2.051 3.552-4.364-2.52 4.616-7.994h3.598l4.616 7.995-4.364 2.52-2.05-3.553zM43.89 66.476h-9.22v-5.039h4.09l-2.039-3.53 4.364-2.52 4.604 7.973-1.8 3.116z"
      fill={color}
      opacity={0.3}
    />
  </Svg>
  )
}

export default PorductionBagIcon
