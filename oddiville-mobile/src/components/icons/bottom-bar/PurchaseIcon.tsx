import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

const PurchaseIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      style={style}
      {...props}
    >
      <G
        clipPath="url(#clip0_2968_13064)"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M8.396 5.85c1.455.193 2.757 1.113 3.698 2.055.934.934 1.847 2.221 2.05 3.661 2.24-.83 5.601-2.491 5.09-4.025-.304-.912-1.263-1.015-2.122-.873-.136.022-.366-.388-.273-.49.897-.971 1.591-2.343.46-3.475-1.132-1.131-2.504-.437-3.476.46-.101.093-.511-.137-.489-.273.142-.86.039-1.817-.873-2.122C10.906.25 9.214 3.588 8.396 5.85zM4.265 7.578c1.34.76 2.3 1.72 3.06 3.06M5.794 15.224c1.29.71 2.202 1.62 2.912 2.911"
          stroke={color}
        />
        <Path
          d="M4.447 7.395C1.064 10.778.533 15.1.76 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
          stroke="#3D874C"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_2968_13064">
          <Path fill="#fff" d="M0 0H20V20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default PurchaseIcon
