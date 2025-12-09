import * as React from "react"
import Svg, { G, Mask, Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const PurchaseActiveIcon = ({color = "#0A493B", size = 24, style, ...props}: IconProps) => {
  return (
   <Svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <Path
        d="M8.396 5.85c1.455.193 2.757 1.113 3.698 2.055.934.934 1.847 2.221 2.05 3.661 2.24-.83 5.601-2.491 5.09-4.025-.304-.912-1.263-1.015-2.122-.873-.136.022-.366-.388-.273-.49.897-.971 1.591-2.343.46-3.475-1.132-1.131-2.504-.437-3.476.46-.101.093-.511-.137-.489-.273.142-.86.039-1.817-.873-2.122C10.906.25 9.214 3.588 8.396 5.85z"
        fill={color}
      />
      <Path
        d="M4.447 7.395C1.064 10.778.533 15.1.76 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
        fill="#3D874C"
      />
      <Mask
        id="a"
        style={{
          maskType: "alpha"
        }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={5}
        width={15}
        height={15}
      >
        <Path
          d="M4.447 7.395C1.064 10.778.533 15.1.76 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
          fill="#3D874C"
        />
      </Mask>
      <G
        mask="url(#a)"
        stroke="#fff"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M4.265 7.577c1.34.76 2.3 1.72 3.06 3.06M5.794 15.224c1.29.71 2.202 1.62 2.912 2.91" />
      </G>
    </Svg>
  )
}

export default PurchaseActiveIcon
