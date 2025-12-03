import { View, StyleSheet } from "react-native";
import { getColor } from "@/src/constants/colors";
import { TagProps } from "@/src/types";
import { findPadding } from "@/src/utils/common";
import { B5, C1 } from "@/src/components/typography/Typography";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";

const TagComponent = ({ size, color = "yellow", children, icon, style }: TagProps) => {
  const { paddingHorizontal, paddingVertical } = findPadding(size);

  const dynamicStyle = useMemoizedStyle(
    {
      paddingHorizontal,
      paddingVertical,
      backgroundColor: getColor(color, 500),
      borderColor: getColor(color, 700),
    },
    [paddingHorizontal, paddingVertical, color]
  );

  const textStyle = useMemoizedStyle(
    {
      color: getColor("light"),
    },
    [color]
  );

  return (
    <View style={[styles.tag, dynamicStyle, style]}>
      <View style={styles.tagContent}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        {size === "xs" ? <C1 style={textStyle}>{children}</C1> : <B5 style={textStyle}>{children}</B5>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tag: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
  },
  tagContent: {
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  iconContainer: {
    marginRight: 4, 
  },
});

const Tag = TagComponent;
export default Tag;
