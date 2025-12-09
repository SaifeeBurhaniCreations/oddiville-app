  import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const ProductionLane: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {
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
        d="M20.921 6.414l-1.5-3A.75.75 0 0018.75 3H5.25a.75.75 0 00-.671.414l-1.5 3A.757.757 0 003 6.75V19.5A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5V6.75a.759.759 0 00-.079-.336zm-5.39 6.867a.747.747 0 01-1.062 0l-1.719-1.72v5.689a.75.75 0 11-1.5 0v-5.69l-1.72 1.72a.75.75 0 11-1.06-1.06l3-3a.749.749 0 011.06 0l3 3a.747.747 0 010 1.06zM4.963 6l.75-1.5h12.574l.75 1.5H4.963z"
        fill={"#fff"}
      />
    </Svg>
  )
}

export default ProductionLane
