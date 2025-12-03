import * as React from "react"
import Svg, { Path, G, Defs, ClipPath } from "react-native-svg"
import { IconProps } from "@/src/types"

const WarningIcon: React.FC<IconProps> = ({ color = "#FF9D00", size = 17, style, ...props }) => {
  const aspectRatio = 17 / 16;
  const height = size / aspectRatio;
  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 17 16"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M15.3 11.756L9.834 2.264a1.548 1.548 0 00-2.669 0L1.7 11.756a1.47 1.47 0 000 1.482A1.522 1.522 0 003.034 14h10.931a1.522 1.522 0 001.535-1.503c0-.26-.07-.516-.2-.741zm-.867.982a.53.53 0 01-.468.262H3.035a.53.53 0 01-.468-.262.474.474 0 010-.483l5.465-9.492a.547.547 0 01.938 0l5.465 9.492a.475.475 0 01-.002.482zM8 9V6.5a.5.5 0 011 0V9a.5.5 0 11-1 0zm1.25 2.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      fill={color}
    />
  </Svg>
    )
}

export default WarningIcon
