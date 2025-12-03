import * as React from "react"
import Svg, { Path } from "react-native-svg"

const ShapesIcon = (props: any) => {
    return (
        <Svg
            xmlns="http://www.w3.org/2000/svg"
            width={47}
            height={10}
            viewBox="0 0 47 10"
            fill="none"
            {...props}
        >
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.218 0H0v10h10.218V0zm8.173 5c0-2.761 2.196-5 4.905-5h.409c2.708 0 4.904 2.239 4.904 5s-2.196 5-4.905 5h-.409c-2.708 0-4.904-2.239-4.904-5zm22.479 5L47 0H34.74l6.13 10z"
                fill="#fff"
            />
        </Svg>
    )
}

export default ShapesIcon
