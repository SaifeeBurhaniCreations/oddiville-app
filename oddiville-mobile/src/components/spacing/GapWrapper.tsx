import { View } from "react-native";
import { GapWrapperProps } from "@/src/types";


  
  const GapWrapper = ({ children, gap = "4", direction = "row", className = "" }: GapWrapperProps) => {
    const gapClasses = gap
      .split(" ")
      .map((g) => (isNaN(Number(g)) ? `gap-${g}` : `gap-[${g}px]`))
      .join(" ");
  
    return (
      <View className={`flex ${direction === "column" ? "flex-col" : ""} ${gapClasses} ${className}`}>
        {children}
      </View>
    );
  };
  
  export default GapWrapper;
  

//   usage
{/* <GapWrapper gap="md:4 lg:8" direction="row">
  <div className="bg-red-200 w-16 h-16"></div>
  <div className="bg-blue-200 w-16 h-16"></div>
</GapWrapper> */}
