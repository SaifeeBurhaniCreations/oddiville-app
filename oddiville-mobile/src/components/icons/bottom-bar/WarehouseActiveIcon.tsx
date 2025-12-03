import * as React from "react"
import Svg, { Path } from "react-native-svg"

const WarehouseActiveIcon = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={19}
      height={19}
      viewBox="0 0 19 19"
      fill="none"
      {...props}
    >
      <Path
        d="M1.613 4.8c-.9 3.494-.87 8.423-.692 11.299a1.36 1.36 0 001.191 1.266c1.642.21 4.83.564 7.638.564 2.807 0 5.996-.354 7.637-.564A1.36 1.36 0 0018.58 16.1c.178-2.876.207-7.805-.692-11.3a1.29 1.29 0 00-.487-.719C16.038 3.078 13.22 1.29 10.192.222c-.286-.101-.598-.101-.884 0C6.28 1.29 3.462 3.078 2.1 4.08a1.29 1.29 0 00-.487.72z"
        fill="#3D874C"
      />
      <Path
        d="M7.25 11.143V9c0-.789.64-1.428 1.429-1.428h2.142c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H8.68c-.79 0-1.429-.64-1.429-1.429z"
        fill="#0A493B"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.75 16.143V14c0-.789.64-1.428 1.429-1.428H8.32c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H6.18c-.79 0-1.429-.64-1.429-1.429zM9.75 16.143V14c0-.789.64-1.428 1.429-1.428h2.142c.79 0 1.429.64 1.429 1.428v2.143c0 .79-.64 1.429-1.429 1.429H11.18c-.79 0-1.429-.64-1.429-1.429z"
        fill="#0A493B"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default WarehouseActiveIcon
