import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const BackArrowIcon: React.FC<IconProps> = ({ color = "#fff", size = 14, style, ...props }) => {
    return (
        <Svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M12.25 7a.438.438 0 01-.437.438h-8.57l3.192 3.19a.438.438 0 01-.62.62L1.879 7.31a.438.438 0 010-.62l3.938-3.937a.438.438 0 01.619.62l-3.191 3.19h8.569A.437.437 0 0112.25 7z"
        fill={color}
      />
    </Svg>
    )
}

export default BackArrowIcon
