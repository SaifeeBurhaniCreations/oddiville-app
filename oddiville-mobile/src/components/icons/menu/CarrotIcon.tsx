import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const CarrotIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 22, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"

    style={style}
    {...props}
  >
    <Path
      d="M19.938 5.5h-2.466l2.264-2.264a.686.686 0 00-.486-1.174.688.688 0 00-.486.202L16.5 4.528V2.063a.688.688 0 10-1.375 0V4.86a5.5 5.5 0 00-6.634.87C5.045 9.116 2.454 17.168 2.2 17.973A1.375 1.375 0 004.028 19.8c.805-.253 8.867-2.847 12.243-6.292a5.5 5.5 0 00.867-6.633h2.8a.688.688 0 100-1.375zm-4.651 7.047c-.769.784-1.827 1.53-2.995 2.211l-2.181-2.182a.688.688 0 00-.973.973l1.898 1.898c-3.512 1.821-7.418 3.044-7.476 3.062a.686.686 0 00-.122.053.68.68 0 00.05-.12c.025-.08 2.406-7.699 5.5-11.23l2.902 2.902a.688.688 0 10.973-.973L9.984 6.263a4.125 4.125 0 015.303 6.284z"
      fill={color}
    />
  </Svg>
  )
}

export default CarrotIcon