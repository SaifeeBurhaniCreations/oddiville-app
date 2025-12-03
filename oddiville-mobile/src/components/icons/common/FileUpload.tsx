import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const FileUpload: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
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
      d="M21 13.5v6a.75.75 0 01-.75.75H3.75A.75.75 0 013 19.5v-6a.75.75 0 111.5 0v5.25h15V13.5a.75.75 0 111.5 0zM8.78 7.282l2.47-2.47v8.69a.75.75 0 101.5 0V4.81l2.47 2.47a.75.75 0 101.06-1.061l-3.75-3.75a.749.749 0 00-1.06 0L7.72 6.22a.75.75 0 001.06 1.061z"
      fill={color}
    />
  </Svg>
  )
}

export default FileUpload
