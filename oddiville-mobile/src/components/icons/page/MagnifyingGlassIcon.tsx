import * as React from "react"
import Svg, { Path } from "react-native-svg"

function MagnifyingGlassIcon(props: any) {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
            {...props}
        >
            <Path
                d="M17.942 17.058l-3.912-3.91a6.884 6.884 0 10-.883.883l3.91 3.911a.626.626 0 00.885-.884zM3.125 8.75a5.625 5.625 0 115.625 5.625A5.631 5.631 0 013.125 8.75z"
                fill="#0A493B"
                opacity={0.7}
            />
        </Svg>
    )
}

export default MagnifyingGlassIcon
