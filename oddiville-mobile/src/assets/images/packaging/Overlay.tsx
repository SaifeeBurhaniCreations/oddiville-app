import * as React from "react"
import Svg, { Path } from "react-native-svg"

const Overlay = ({ style, width = '170', height = '105' }: { style?: any, width?: string, height?: string }) => {
    return (
        <Svg width={width} height={height} style={style} viewBox="0 0 171 105" fill="none" >
            <Path d="M8 0.5H70.8838C72.1841 0.500061 73.4625 0.838386 74.5928 1.48145L99.9131 15.8877C101.194 16.6165 102.642 16.9999 104.116 17H163C167.142 17 170.5 20.3579 170.5 24.5V96.0469C170.5 100.172 167.169 103.523 163.044 103.547L8.04395 104.453C3.88476 104.477 0.500025 101.112 0.5 96.9531V8L0.509766 7.61426C0.710536 3.65139 3.98724 0.5 8 0.5Z" fill="white" stroke="#CCD6D1"/>
        </Svg>

    )
}

export default Overlay