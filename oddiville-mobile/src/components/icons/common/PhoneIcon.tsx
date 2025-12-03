import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const PhoneIcon: React.FC<IconProps> = ({ color = "#0A493B", size = 16, style, ...props }) => {

    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            style={style}
            {...props}
        >
            <Path
                d="M13.898 9.904l-2.944-1.32-.008-.003a1 1 0 00-.995.122L8.429 10c-.963-.468-1.958-1.456-2.426-2.407L7.3 6.049a1 1 0 00.118-.99v-.007l-1.323-2.95a1 1 0 00-1.038-.595A3.516 3.516 0 002 5c0 4.962 4.038 9 9 9a3.517 3.517 0 003.492-3.058 1 1 0 00-.594-1.038zM11 13a8.009 8.009 0 01-8-8 2.512 2.512 0 012.18-2.5v.007l1.312 2.938L5.2 6.99a1 1 0 00-.098 1.03c.566 1.158 1.733 2.316 2.904 2.881a1 1 0 001.03-.106l1.52-1.296 2.937 1.316h.007A2.513 2.513 0 0111 13z"
                fill={color}
            />
        </Svg>
    )
}

export default PhoneIcon
