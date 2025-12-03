import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const FileIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M20.03 7.72l-5.25-5.25a.75.75 0 00-.53-.22h-9a1.5 1.5 0 00-1.5 1.5v16.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-12a.75.75 0 00-.22-.53zM15 4.81l2.69 2.69H15V4.81zm3.75 15.44H5.25V3.75h8.25v4.5a.75.75 0 00.75.75h4.5v11.25zm-3-7.5a.75.75 0 01-.75.75H9A.75.75 0 119 12h6a.75.75 0 01.75.75zm0 3a.75.75 0 01-.75.75H9A.75.75 0 119 15h6a.75.75 0 01.75.75z"
      fill={color}
    />
  </Svg>
  )
}

export default FileIcon
