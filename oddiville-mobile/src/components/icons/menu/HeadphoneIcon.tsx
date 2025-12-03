import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const HeadphoneIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 22, style, ...props }) => {

  return (
    <Svg
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    style={style}
    {...props}
  >
    <Path
      d="M17.35 4.697a8.888 8.888 0 00-6.282-2.635H11A8.938 8.938 0 002.062 11v4.813a2.063 2.063 0 002.063 2.062H5.5a2.062 2.062 0 002.063-2.063v-3.437A2.063 2.063 0 005.5 10.312H3.468a7.573 7.573 0 0112.907-4.646 7.51 7.51 0 012.157 4.646H16.5a2.062 2.062 0 00-2.063 2.063v3.438a2.062 2.062 0 002.063 2.062h2.063a2.062 2.062 0 01-2.063 2.063h-4.813a.687.687 0 100 1.375H16.5a3.438 3.438 0 003.438-3.438V11a8.887 8.887 0 00-2.588-6.303zM5.5 11.687a.687.687 0 01.688.688v3.438a.687.687 0 01-.688.687H4.125a.687.687 0 01-.688-.688v-4.124H5.5zm11 4.813a.687.687 0 01-.688-.688v-3.437a.687.687 0 01.688-.688h2.063V16.5H16.5z"
      fill={color}
    />
  </Svg>
  )
}

export default HeadphoneIcon