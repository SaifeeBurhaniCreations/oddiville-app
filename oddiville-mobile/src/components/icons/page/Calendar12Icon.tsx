import * as React from "react"
import Svg, { Path } from "react-native-svg"
import { IconProps } from "@/src/types"

const Calendar12Icon: React.FC<IconProps> = ({ color = "#3D874C", size = 18, ...props }) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 14 14"
            fill="none"
            {...props}
        >
            <Path
                d="M11.375 1.75h-1.313v-.438a.438.438 0 00-.874 0v.438H4.811v-.438a.437.437 0 10-.875 0v.438H2.625a.875.875 0 00-.875.875v8.75a.875.875 0 00.875.875h8.75a.875.875 0 00.875-.875v-8.75a.875.875 0 00-.875-.875zm-7.438.875v.438a.437.437 0 10.876 0v-.438h4.375v.438a.437.437 0 10.874 0v-.438h1.313v1.75h-8.75v-1.75h1.313zm7.438 8.75h-8.75V5.25h8.75v6.125zm-5.25-4.813v3.5a.438.438 0 01-.875 0V7.27l-.242.122a.438.438 0 11-.391-.784l.875-.437a.437.437 0 01.633.391zM9.36 8.229L8.313 9.625h.874a.437.437 0 110 .875h-1.75a.438.438 0 01-.35-.7l1.574-2.098a.437.437 0 10-.727-.483.437.437 0 11-.758-.438A1.313 1.313 0 119.36 8.228z"
                fill={color}
            />
        </Svg>
    )
}

export default Calendar12Icon
