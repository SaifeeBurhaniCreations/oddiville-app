import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const BigBagIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 22, style, ...props }) => {
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
      d="M14.851 15.509l-.26-3.08M9.2 10.332a2.36 2.36 0 00-1.794 2.095m4.772-5.798a8.707 8.707 0 011.097-1.107l.171-.145a3.866 3.866 0 001.322-2.322s-1.826-1.093-4.5-.827c0 .412.121.815.348 1.16.25.379.384.824.384 1.279v.096"
      stroke={color}
      strokeWidth={1.25069}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.344 2.784c-1.899-.033-3.114.27-3.114.27.151.906.62 1.73 1.322 2.322l.171.144c.398.336.765.707 1.097 1.108m2.912.029H9.266a.723.723 0 000 1.447h3.466a.723.723 0 000-1.447z"
      stroke={color}
      strokeWidth={1.25069}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.617 7.778l-.722.176a4.08 4.08 0 00-3.099 3.62l-.449 5.323a2.811 2.811 0 01-.684 1.647.76.76 0 00.567 1.268h13.548a.76.76 0 00.567-1.268 2.812 2.812 0 01-.685-1.647l-.449-5.323a4.08 4.08 0 00-3.099-3.62l-.742-.18"
      stroke={color}
      strokeWidth={1.25069}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  )
}

export default BigBagIcon
