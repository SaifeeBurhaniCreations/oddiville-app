import { Children, FC } from "react";
import { GridProps } from "@/src/types";
import { View, useWindowDimensions } from "react-native";

const AutoLayout: FC<GridProps> = ({ children, columns, gap = "gap-4", className = "" }) => {
  const childArray = Children.toArray(children);
  const itemCount = childArray?.length;
  const { width } = useWindowDimensions();

  let columnCount = columns || 1;
  if (!columns) {
    if (width >= 1280) columnCount = Math.min(itemCount, 6); // Large screens (max 6)
    else if (width >= 1024) columnCount = Math.min(itemCount, 4); // Medium screens (max 4)
    else if (width >= 768) columnCount = Math.min(itemCount, 3); // Tablets (max 3)
    else columnCount = Math.min(itemCount, 2); // Mobile (max 2)
  }

  return (
    <View className={`grid grid-cols-${columnCount} ${gap} ${className}`}>
      {children}
    </View>
  );
};

export default AutoLayout;


// usage example
//  <Grid>
//   <div className="bg-blue-500 p-4 text-white">Item 1</div>
//   <div className="bg-green-500 p-4 text-white">Item 2</div>
//   <div className="bg-red-500 p-4 text-white">Item 3</div>
//   <div className="bg-yellow-500 p-4 text-white">Item 4</div>
//   <div className="bg-purple-500 p-4 text-white">Item 5</div>
//   <div className="bg-pink-500 p-4 text-white">Item 6</div>
// </Grid>


// <Grid columns={4}>
//   <div className="bg-blue-500 p-4 text-white">Item 1</div>
//   <div className="bg-green-500 p-4 text-white">Item 2</div>
//   <div className="bg-red-500 p-4 text-white">Item 3</div>
//   <div className="bg-yellow-500 p-4 text-white">Item 4</div>
// </Grid>

// <Grid columns={2}>
//   <Grid columns={2} className="bg-gray-100 p-4">
//     <div className="bg-blue-400 p-4 text-white">Nested 1</div>
//     <div className="bg-green-400 p-4 text-white">Nested 2</div>
//   </Grid>
//   <div className="bg-red-400 p-4 text-white">Outer Item</div>
// </Grid>
