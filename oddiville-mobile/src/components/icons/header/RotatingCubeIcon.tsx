import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const RotatingCubeIcon: React.FC<IconProps> = ({ color = "#fff", size = 66, style, ...props }) => {

  const aspectRatio = 66 / 46;
  const height = size / aspectRatio;

  return (
    <Svg
    width={size}
    height={height}
    viewBox="0 0 66 46"
    fill="none"
    style={style}
    {...props}
  >
    <G opacity={0.3} clipPath="url(#clip0_1088_3255)" fill={color}>
      <Path d="M47.029 24.985a1.446 1.446 0 00-2.045 0c-6.765 6.765-17.772 6.765-24.537 0a17.378 17.378 0 01-4.72-8.811l.63.632a1.446 1.446 0 002.046-2.045l-3.067-3.067a1.446 1.446 0 00-2.045 0l-3.067 3.067a1.446 1.446 0 002.044 2.045l.524-.524a20.285 20.285 0 005.61 10.747c7.893 7.893 20.734 7.893 28.627 0a1.446 1.446 0 000-2.044zM44.984.448a17.158 17.158 0 014.736 8.825l-.646-.646a1.446 1.446 0 10-2.045 2.044l3.067 3.068a1.446 1.446 0 002.045 0l3.067-3.068a1.446 1.446 0 10-2.045-2.044l-.535.534a20.016 20.016 0 00-5.6-10.758c-7.892-7.893-20.733-7.893-28.625 0A1.446 1.446 0 1020.447.448c6.765-6.765 17.772-6.765 24.537 0z" />
      <Path d="M36.805 24.984l8.179-8.179.007-.009-11.074-4.26-8.87 8.87 10.198 3.9a1.446 1.446 0 001.56-.322zm8.53-9.605c-.014-.044-4.12-10.357-4.12-10.357a1.435 1.435 0 00-.806-.805S30.096.11 30.052.097l4.245 11.037 11.037 4.245zM28.624.447l-8.178 8.18a1.446 1.446 0 00-.321 1.56l3.9 10.197 8.868-8.87L28.635.44l-.01.007z" />
    </G>
    <Defs>
      <ClipPath id="clip0_1088_3255">
        <Path
          fill={color}
          transform="rotate(45 40.5 29.491)"
          d="M0 0H46.267V46.267H0z"
        />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default RotatingCubeIcon
