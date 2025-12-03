import * as React from "react"
import Svg, { Path } from "react-native-svg"

const OrderActiveIcon = (props: any) => {
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
      d="M1.041 7.543C1.414 6.259 2 5.07 2.57 3.915c.281-.57.559-1.133.805-1.696.221-.506.694-.87 1.25-.92 1.532-.135 2.798-.229 4.626-.229 1.81 0 3.07.092 4.584.226.577.05 1.06.442 1.278.972.274.67.595 1.316.924 1.975.508 1.022 1.033 2.075 1.42 3.297"
      fill="#0A493B"
    />
    <Path
      d="M9.25 6.445V1.07"
      stroke="#CCD6D1"
      strokeWidth={1.42857}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M.831 17.272a1.487 1.487 0 001.356 1.246c2.259.172 4.625.41 7.063.41 2.438 0 4.804-.238 7.064-.41a1.487 1.487 0 001.355-1.246c.233-1.472.51-3.007.51-4.586 0-1.578-.277-3.113-.51-4.585a1.487 1.487 0 00-1.355-1.246c-2.26-.172-4.626-.41-7.064-.41-2.438 0-4.804.238-7.063.41A1.487 1.487 0 00.83 8.101c-.233 1.472-.51 3.007-.51 4.585 0 1.579.277 3.114.51 4.586z"
      fill="#3D874C"
    />
    <Path
      d="M11.668 15.105h2.887"
      stroke="#CCD6D1"
      strokeWidth={1.42857}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
  )
}

export default OrderActiveIcon
