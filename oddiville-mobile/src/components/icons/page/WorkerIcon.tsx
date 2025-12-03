import * as React from "react"
import Svg, { Path, G, Defs, ClipPath } from "react-native-svg"
import { IconProps } from "@/src/types"

const WorkerIcon: React.FC<IconProps> = ({ color = "#fff", size = 57, style, ...props }) => {
  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 57 57"
    fill="none"
    style={style}
    {...props}
  >
    <G opacity={0.3} clipPath="url(#clip0_924_16683)" fill={color}>
      <Path d="M54.222 51.746l-1.297-3.818a18.31 18.31 0 00-14.96-12.258c-2.54 2.795-5.845 4.5-9.466 4.5-3.62 0-6.925-1.705-9.465-4.5a18.31 18.31 0 00-14.96 12.258l-1.296 3.818a3.595 3.595 0 003.406 4.753h44.632a3.598 3.598 0 003.406-4.753z" />
      <Path d="M28.5 37.342c6.318 0 11.448-6.71 11.621-15.069H16.88c.173 8.36 5.303 15.07 11.62 15.07zM14.277 18.567a2.8 2.8 0 001.245.3H41.48c.449 0 .868-.114 1.245-.3a2.818 2.818 0 001.585-2.53 2.83 2.83 0 00-2.83-2.829h-.52a23.38 23.38 0 00-.278-1.219c-.772-3.04-2.166-5.87-4.126-7.986v2.055a1.887 1.887 0 01-3.773 0V1.221A10.266 10.266 0 0030.387.5v7.615a1.887 1.887 0 01-3.773 0V.5c-.84.15-1.644.384-2.394.72v4.838a1.887 1.887 0 01-3.773 0V4.003c-1.96 2.116-3.353 4.943-4.124 7.982-.104.405-.2.811-.28 1.223h-.52a2.83 2.83 0 00-2.83 2.83 2.82 2.82 0 001.585 2.53z" />
    </G>
    <Defs>
      <ClipPath id="clip0_924_16683">
        <Path fill={color} transform="translate(.5 .5)" d="M0 0H56V56H0z" />
      </ClipPath>
    </Defs>
  </Svg>
    )
}

export default WorkerIcon
