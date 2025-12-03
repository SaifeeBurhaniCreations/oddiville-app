import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const HistoryIcon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, ...props }) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 18 18"
            fill="none"
            {...props}
        >
            <Path
                d="M9.563 5.625v3.056l2.54 1.524a.562.562 0 11-.58.965L8.711 9.482A.563.563 0 018.438 9V5.625a.562.562 0 111.125 0zm6.187-1.687a.562.562 0 00-.562.562v1.266a30.483 30.483 0 00-1.415-1.535 6.75 6.75 0 10-.14 9.682.562.562 0 10-.774-.819 5.625 5.625 0 11.117-8.074 31.61 31.61 0 011.58 1.73h-1.618a.562.562 0 100 1.125h2.812a.563.563 0 00.563-.562V4.5a.562.562 0 00-.563-.562z"
                fill={color}
            />
        </Svg>
    )
}

export default HistoryIcon
