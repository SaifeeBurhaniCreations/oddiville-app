import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const WarehouseIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 20, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M7.25 12.143V10c0-.789.64-1.428 1.429-1.428h2.142c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H8.68c-.79 0-1.429-.64-1.429-1.429z"
        stroke={color}
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.75 17.143V15c0-.789.64-1.428 1.429-1.428H8.32c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H6.18c-.79 0-1.429-.64-1.429-1.429zM9.75 17.143V15c0-.789.64-1.428 1.429-1.428h2.142c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H11.18c-.79 0-1.429-.64-1.429-1.429z"
        stroke={color}
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1.613 5.8c-.9 3.494-.87 8.423-.692 11.299a1.36 1.36 0 001.191 1.266c1.642.21 4.83.564 7.638.564 2.807 0 5.996-.354 7.637-.564A1.36 1.36 0 0018.58 17.1c.178-2.876.207-7.805-.692-11.3a1.29 1.29 0 00-.487-.719c-1.362-1.002-4.181-2.79-7.208-3.858-.286-.101-.598-.101-.884 0C6.28 2.29 3.462 4.078 2.1 5.08a1.29 1.29 0 00-.487.72z"
        stroke="#3D874C"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default WarehouseIcon
