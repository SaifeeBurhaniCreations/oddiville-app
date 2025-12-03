import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const WarehouseIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, style, ...props }) => {
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
      d="M16.875 12.938h-.563V4.07l.68-.146a.562.562 0 10-.235-1.1L1.007 6.2a.563.563 0 00.237 1.1l.444-.095v5.733h-.563a.563.563 0 000 1.125h15.75a.562.562 0 100-1.125zM2.812 6.96l12.376-2.649v8.626H13.5V9a.562.562 0 00-.563-.562H5.064A.563.563 0 004.5 9v3.938H2.812V6.96zm9.563 3.727h-6.75V9.563h6.75v1.125zm-6.75 1.125h6.75v1.125h-6.75v-1.125z"
      fill={color}
    />
  </Svg>
    )
}

export default WarehouseIcon
