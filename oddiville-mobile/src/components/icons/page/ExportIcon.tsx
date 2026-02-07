import { IconProps } from "@/src/types";
import * as React from "react";
import Svg, { Path } from "react-native-svg";

const ExportIcon: React.FC<IconProps> = ({
    color = "#548076",
    size = 20,
    style,
    ...props
}) => {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            className="injected-svg"
            color={color}
            {...props}
            style={style}
        >
            <Path
                d="M21 17v2.5a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V17M7.5 11.5L12 16l4.5-4.5M12 15V3"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default ExportIcon;
