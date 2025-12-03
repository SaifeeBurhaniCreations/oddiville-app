import CrossIcon from "@/src/components/icons/page/CrossIcon"
import { HStack } from "@/src/components/layout/HStack"
import { RecentSearchItemProps } from "@/src/types"
import { H5 } from "@/src/components/typography/Typography"
import { getColor } from "@/src/constants/colors"
import { StyleSheet, TouchableOpacity } from "react-native"
import HistoryIcon from "../icons/page/HistoryIcon"

const RecentSearchItem = ({ color, children, setRecentSearchTerm, recentSearchTerm, index }: RecentSearchItemProps) => {
    return (
      <HStack gap={8} style={styles.searchItemContainer}>
        <HStack gap={8}>
          <HistoryIcon color={getColor(color, 500)} size={20} />
          <H5 color={getColor(color, 700)}>{children}</H5>
        </HStack>
  
        <TouchableOpacity
          onPress={() => {
            if (setRecentSearchTerm) {
              setRecentSearchTerm(recentSearchTerm.filter((_, idx) => idx !== index));
            }
          }}
          activeOpacity={0.7}
        >
          <CrossIcon color={getColor(color, 500)} size={20} />
        </TouchableOpacity>
      </HStack>
    );
  };
  

export default RecentSearchItem

const styles = StyleSheet.create({
    searchItemContainer: {
        justifyContent: "space-between",
        alignItems: "center"
    }
})
