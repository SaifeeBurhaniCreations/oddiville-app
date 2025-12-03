import { View } from "react-native";
import { PaddingWrapperProps } from "@/src/types";

const PaddingWrapper = ({ children, className = "", ...paddingProps }: PaddingWrapperProps) => {
    const paddingClasses = Object.entries(paddingProps)
        .map(([key, value]) =>
            value
                ?.split(" ")
                .map((v) => (isNaN(Number(v)) ? `${key}-${v}` : `${key}-[${v}px]`))
                .join(" ")
        )
        .join(" ");

    return <View className={`${paddingClasses} ${className}`}>{children}</View>;
};

export default PaddingWrapper;

//   usage
{/* <PaddingWrapper p="4" px="md:6 lg:12" className="bg-gray-200">
    <p>Content with dynamic padding</p>
    </PaddingWrapper> */}
