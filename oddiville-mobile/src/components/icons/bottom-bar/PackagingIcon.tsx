import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PackagingIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 22, style, ...props }) => {

  return (
     <Svg
      width={size}
      height={size}
      viewBox="0 0 18 20"
      fill="none"
      {...props}
    >
      <Path
        d="M2.515 17.276v-10a2 2 0 012-2h7a3 3 0 013 3v7a2 2 0 01-2 2h-10z"
        stroke={color}
        strokeWidth={1.43}
      />
      <Path
        d="M15.91 19.243a.715.715 0 001.011-1.011l-.505.506-.506.505zm-.473-1.484l.506-.505-.506.505zM3.96 17.295v.715h10.357v-1.43H3.96v.715zm11.477.464l-.505.506.978.978.506-.505.505-.506-.978-.978-.506.505zm-1.12-.464v.715a.87.87 0 01.615.255l.505-.506.506-.505a2.299 2.299 0 00-1.626-.674v.715zM1.22.21A.715.715 0 10.21 1.22L.714.715 1.22.209zm1.298 2.964h-.715.715zm-.464-1.12l-.506.505.506-.505zm.464 13.8h.715V3.173h-1.43v12.68h.715zm-.464-13.8l.505-.506L1.22.209.715.715l-.506.505 1.339 1.34.506-.506zm.464 1.12h.715a2.3 2.3 0 00-.674-1.626l-.505.506-.506.505a.87.87 0 01.255.615h.715z"
        fill="#3D874C"
      />
      <Path
        d="M6.565 14.726h5M7.565 12.226h3"
        stroke={color}
        strokeWidth={1.43}
        strokeLinecap="round"
      />
      <Path
        d="M1.075 17.295a1.442 1.442 0 102.884 0 1.442 1.442 0 00-2.884 0z"
        fill="#fff"
        stroke={color}
        strokeWidth={1.43}
      />
    </Svg>
  )
}

export default PackagingIcon