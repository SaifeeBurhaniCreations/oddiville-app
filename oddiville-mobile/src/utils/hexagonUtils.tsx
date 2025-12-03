import { View } from "react-native";
import HexagonIcon from "../components/icons/menu/HexagonIcon";

export const renderHexagonRow = (index: number, MenuSheetWidth: number) => {
    const extraPadding = index % 2 === 0 ? 16 : 0; 
    return (
      <View key={index} style={{ flexDirection: 'row', paddingLeft: extraPadding }}>
        <HexagonIcon size={MenuSheetWidth + 32} />
      </View>
    );
  };