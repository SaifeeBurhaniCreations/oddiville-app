import * as React from "react"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

const RawMaterialIcon = (props: any) => {
  return (
    <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip0_2408_4644)">
      <G
        clipPath="url(#clip1_2408_4644)"
        strokeWidth={1.42857}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M8.396 5.85c1.455.193 2.757 1.114 3.698 2.056.934.933 1.847 2.22 2.05 3.661 2.24-.83 5.601-2.492 5.09-4.025-.304-.913-1.263-1.015-2.122-.874-.136.022-.366-.388-.273-.489.897-.972 1.591-2.344.46-3.475-1.132-1.132-2.504-.437-3.476.46-.101.093-.511-.137-.489-.274.142-.859.039-1.817-.873-2.121C10.906.25 9.214 3.588 8.396 5.85zM4.265 7.578c1.34.76 2.3 1.72 3.06 3.06M5.795 15.225c1.29.71 2.2 1.62 2.91 2.91"
          stroke="#0A493B"
        />
        <Path
          d="M4.447 7.395C1.064 10.778.533 15.1.76 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
          stroke="#3D874C"
        />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_2408_4644">
        <Path fill="#fff" d="M0 0H20V20H0z" />
      </ClipPath>
      <ClipPath id="clip1_2408_4644">
        <Path fill="#fff" d="M0 0H20V20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default RawMaterialIcon
