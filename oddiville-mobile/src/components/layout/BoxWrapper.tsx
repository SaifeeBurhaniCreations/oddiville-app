import { View } from "react-native";
import { BoxProps } from "@/src/types";
import { ViewStyle } from "react-native";

const Box = ({ children, bg, border, shadow, rounded, style, p, m }: BoxProps) => {
  const combinedStyles: ViewStyle = {
    backgroundColor: bg,
    borderWidth: border ? 1 : 0,
    shadowOpacity: shadow ? 0.2 : 0, 
    borderRadius: rounded ? 8 : 0, 
    padding: p ? Number(p) : undefined,
    margin: m ? Number(m) : undefined,
    ...(style as object), 
  };

  return <View style={combinedStyles}>{children}</View>;
};

export default Box;

//   usage

// <Box bg="bg-gray-100" border="border border-gray-300" shadow="shadow-lg" rounded="rounded-md" p="4" m="2">
//   <Text>Content inside Box</Text>
// </Box>
