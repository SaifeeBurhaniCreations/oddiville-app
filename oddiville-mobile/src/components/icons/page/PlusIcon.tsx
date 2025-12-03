import { IconProps } from "@/src/types"
import * as React from "react"
import Svg, { Path } from "react-native-svg"

const PlusIcon: React.FC<IconProps> = ({ color = "#fff", size = 24, style, ...props }) => {
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
                d="M21 12a.75.75 0 01-.75.75h-7.5v7.5a.75.75 0 11-1.5 0v-7.5h-7.5a.75.75 0 110-1.5h7.5v-7.5a.75.75 0 111.5 0v7.5h7.5A.75.75 0 0121 12z"
                fill={color}
            />
        </Svg>
    )
}

export default PlusIcon
