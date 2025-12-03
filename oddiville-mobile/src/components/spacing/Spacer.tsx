import { View } from "react-native";
import { SpacerProps } from "@/src/types";

const Spacer = ({ size = "md", direction = "vertical", className = "" }: SpacerProps) => {
    const isVertical = direction === "vertical";

    // Generate dynamic Tailwind class
    const spacingClass = size
        .split(" ")
        .map((s) => (isNaN(Number(s)) ? `${isVertical ? "h-" : "w-"}${s}` : `${isVertical ? "h" : "w"}-[${s}px]`))
        .join(" ");

    return <View className={`${spacingClass} ${className}`} />;
};

export default Spacer;

//   usage
// <Spacer size="lg" />  // h-lg (Vertical spacing)
// <Spacer size="md:8 lg:12" />  // Responsive spacing
// <Spacer size="20" direction="horizontal" />  // w-[20px]

