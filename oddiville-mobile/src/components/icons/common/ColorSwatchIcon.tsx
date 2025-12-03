import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ColorSwatchIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 18, style, ...props }) => {
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
      d="M6.189 12.656a.844.844 0 11-1.688 0 .844.844 0 011.688 0zm10.687-1.674v3.643a1.125 1.125 0 01-1.125 1.125H5.345a3.093 3.093 0 01-3.05-3.63L4.053 2.056a1.121 1.121 0 011.299-.914l3.849.686a1.125 1.125 0 01.908 1.302l-.85 4.852 4.769-1.724a1.125 1.125 0 011.438.67l1.34 3.667c.043.125.066.255.07.387zM7.243 13L9.001 2.935 5.166 2.25 3.408 12.312a1.969 1.969 0 001.578 2.283 1.918 1.918 0 001.446-.322A1.958 1.958 0 007.243 13zm.97.712l7.538-2.735-1.341-3.663L9.035 9.26l-.687 3.932c-.031.177-.077.35-.137.519zm7.538-1.538l-6.768 2.452h6.768v-2.452z"
      fill={color}
    />
  </Svg>
  )
}

export default ColorSwatchIcon
