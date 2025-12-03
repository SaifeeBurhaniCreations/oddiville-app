import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const LocationIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 14, style, ...props }) => {
  const aspectRatio = 14 / 16;
  const height = size / aspectRatio;
  return (
      <Svg
      width={size}
      height={height}
      viewBox="0 0 14 16"
      fill="none"
      style={style}
      {...props}
    >
      <Path
        d="M7 3.5a2.812 2.812 0 100 5.625A2.812 2.812 0 007 3.5zM7 8a1.687 1.687 0 110-3.375A1.687 1.687 0 017 8zM7 .125A6.195 6.195 0 00.812 6.313c0 2.207 1.02 4.547 2.954 6.767a17.87 17.87 0 002.914 2.693.562.562 0 00.646 0 17.874 17.874 0 002.908-2.693c1.93-2.22 2.954-4.56 2.954-6.768A6.195 6.195 0 007 .125zm0 14.484c-1.162-.914-5.063-4.271-5.063-8.296a5.063 5.063 0 1110.126 0c0 4.023-3.9 7.382-5.063 8.296z"
        fill={color}
      />
    </Svg>
    )
}

export default LocationIcon
