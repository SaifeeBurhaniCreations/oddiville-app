import * as React from "react"
import Svg, { ClipPath, Defs, G, Mask, Path } from "react-native-svg"

const RawMaterialActiveIcon = (props: any) => {
  return (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    viewBox="0 0 21 20"
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip0_1585_1585)">
      <Path
        d="M8.646 5.85c1.455.193 2.756 1.114 3.698 2.056.934.933 1.847 2.22 2.05 3.661 2.24-.83 5.6-2.492 5.09-4.025-.305-.913-1.263-1.015-2.123-.874-.136.022-.366-.388-.272-.489.896-.972 1.59-2.344.46-3.475-1.132-1.132-2.505-.437-3.476.46-.102.093-.512-.137-.49-.274.142-.859.04-1.817-.873-2.121C11.156.25 9.464 3.588 8.646 5.85z"
        fill="#0A493B"
      />
      <Path
        d="M4.697 7.395C1.314 10.778.783 15.1 1.01 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
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
          d="M4.697 7.395C1.314 10.778.783 15.1 1.01 17.562a1.836 1.836 0 001.679 1.678c2.462.227 6.783-.305 10.166-3.688 2.914-2.913 1.238-5.899-.51-7.647-1.747-1.748-4.733-3.423-7.647-.51z"
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
        <Path d="M4.515 7.578c1.339.76 2.3 1.72 3.06 3.06M6.045 15.223c1.29.71 2.201 1.62 2.911 2.91" />
      </G>
    </G>
    <Defs>
      <ClipPath id="clip0_1585_1585">
        <Path fill="#fff" transform="translate(.25)" d="M0 0H20V20H0z" />
      </ClipPath>
    </Defs>
  </Svg>
  )
}

export default RawMaterialActiveIcon
