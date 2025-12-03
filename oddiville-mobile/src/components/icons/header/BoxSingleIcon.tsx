import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"

const BoxSingleIcon: React.FC<IconProps> = ({ color = "#fff", size = 36, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    style={style}
    {...props}
  >
    <G opacity={0.3} clipPath="url(#clip0_2090_8563)">
      <Path
        d="M6.952 11.108l-3.745 4.21c-.063.07-.121.146-.174.226l14.242 1.786 4.077-4.328-14.4-1.894zm21.725-3.524l-4.871 5.17 1.236 3.326a.808.808 0 01-1.515.563l-.957-2.576-4.056 4.305 4.474 12.036.039-.04 9.272-10.034a1.888 1.888 0 00.392-1.958L28.704 7.65c-.008-.023-.018-.044-.027-.066zm-1.548-1.16l-13.57-1.542h-.006a1.905 1.905 0 00-1.611.616L8.25 9.648l14.468 1.904 4.763-5.056a1.917 1.917 0 00-.352-.072zM2.804 17.144c.01.035.022.07.035.106l3.997 10.752a1.893 1.893 0 001.54 1.222l13.023 1.73h.006c.021.003.043.005.064.006l-4.474-12.036-14.191-1.78z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_2090_8563">
        <Path
          fill={color}
          transform="rotate(-20.391 26.726 4.807)"
          d="M0 0H27.5892V27.5892H0z"
        />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default BoxSingleIcon
