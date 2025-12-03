import { FC } from "react";
import { CenterProps } from "@/src/types";
import { View } from "react-native";

const Center: FC<CenterProps> = ({ children, className = "", fullScreen = false }) => {
    return (
      <View
        className={`flex items-center justify-center ${className}`}
        style={fullScreen ? { flex: 1, minHeight: "100%" } : { flex: 1 }}
      >
        {children}
      </View>
    );
  };
  
export default Center;


// usage

{/* <Center>
  <button className="bg-blue-500 text-white px-4 py-2 rounded">Click Me</button>
</Center> */}

// <Center fullScreen>
//   <h1 className="text-3xl font-bold">Welcome!</h1>
// </Center>


// <Center className="bg-gray-200 p-6 rounded-lg">
//   <p className="text-lg">This is inside a centered box.</p>
// </Center>
