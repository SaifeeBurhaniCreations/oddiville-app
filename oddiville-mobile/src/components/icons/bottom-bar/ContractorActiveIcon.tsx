import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ContractorActiveIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 24, style, ...props }) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="injected-svg"
      color={color}
      style={style}
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.5 6.25a.75.75 0 01.75.75v2a2.75 2.75 0 105.5 0V7a.75.75 0 011.5 0v2a4.25 4.25 0 01-8.5 0V7a.75.75 0 01.75-.75zM12 1.25a.75.75 0 01.75.75v3a.75.75 0 01-1.5 0V2a.75.75 0 01.75-.75z"
        fill={color}
      />
      <Path
        d="M11.25 2.816A4.252 4.252 0 007.757 6.75H7.5a.75.75 0 100 1.5h9a.75.75 0 000-1.5h-.257a4.252 4.252 0 00-3.493-3.934V2a.75.75 0 00-1.5 0v.816z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.75 14.25H10a.75.75 0 01.53.22L12 15.94l1.47-1.47a.75.75 0 01.53-.22h2.25v8.5h-8.5v-8.5zm-1.5 8.486v-8.472a7.771 7.771 0 00-.469.032c-.473.048-.913.153-1.309.418-.3.2-.558.458-.759.758-.264.396-.369.836-.417 1.309-.046.452-.046 1.088-.046 1.757 0 .67 0 1.229.046 1.681.048.473.153.913.417 1.309.201.3.459.558.76.759.395.264.835.369 1.308.417.145.015.302.025.469.032zm11.5 0v-8.472c.167.007.324.017.469.032.473.048.913.153 1.309.418.3.2.558.458.759.758.264.396.369.836.417 1.309.046.452.046 1.088.046 1.757 0 .67 0 1.229-.046 1.681-.048.473-.153.913-.418 1.309-.2.3-.458.558-.758.759-.396.264-.835.369-1.309.417a7.772 7.772 0 01-.469.032z"
        fill={color}
      />
    </Svg>
  )
}

export default ContractorActiveIcon
