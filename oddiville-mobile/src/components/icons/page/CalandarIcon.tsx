import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const CalandarIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, ...props }) => {
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
        <Path
        d="M14.625 2.25h-1.688v-.563a.563.563 0 00-1.124 0v.563H6.186v-.563a.563.563 0 10-1.125 0v.563H3.375A1.125 1.125 0 002.25 3.375v11.25a1.125 1.125 0 001.125 1.125h11.25a1.125 1.125 0 001.125-1.125V3.375a1.125 1.125 0 00-1.125-1.125zM5.062 3.375v.563a.563.563 0 101.125 0v-.563h5.625v.563a.563.563 0 001.126 0v-.563h1.687v2.25H3.375v-2.25h1.688zm9.563 11.25H3.375V6.75h11.25v7.875zm-2.696-6.023a.562.562 0 010 .796l-3.375 3.375a.562.562 0 01-.796 0l-1.687-1.688a.563.563 0 01.796-.796l1.29 1.29 2.976-2.977a.563.563 0 01.796 0z"
        fill={color}
      />
    </Svg>
  )
}

export default CalandarIcon
