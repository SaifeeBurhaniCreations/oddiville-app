import { View } from "react-native";
import { MarginWrapperProps } from "@/src/types";

const MarginWrapper = ({ children, className = "", ...marginProps }: MarginWrapperProps) => {
    const marginClasses = Object.entries(marginProps)
        .map(([key, value]) =>
            value
                ?.split(" ")
                .map((v) => (isNaN(Number(v)) ? `${key}-${v}` : `${key}-[${v}px]`))
                .join(" ")
        )
        .join(" ");

    return <View className={`${marginClasses} ${className}`}>{children}</View>;
};

export default MarginWrapper;

// usage

// <MarginWrapper mx="md:6 lg:12" my="4" className="border">
//   <p>Content inside with margin</p>
// </MarginWrapper>
