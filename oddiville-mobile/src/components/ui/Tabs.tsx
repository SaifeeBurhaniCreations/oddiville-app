import React, { useState, ReactNode, memo, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { TabButtonProps, TabsProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { B2, H5 } from "@/src/components/typography/Typography";
import { useMemoizedStyle } from "@/src/hooks/useMemoizedStyle";

// --- Memoized Tab Button ---
const TabButton: React.FC<TabButtonProps> = memo(
  ({ title, isActive, onPress, color, variant = "default" }) => {
    const buttonStyle = useMemoizedStyle(
      variant === "ghost"
        ? {}
        : {
          borderBottomWidth: isActive ? 2 : 1,
          borderBottomColor: isActive
            ? getColor(color, 500)
            : getColor(color, 100),
        },
      [isActive, color, variant]
    );

    const textColor = isActive ? getColor(color, 500) : getColor(color, 700);

    return (
      <TouchableOpacity
        style={[styles.tabButton, buttonStyle]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {typeof title === "string" ? (
          isActive ? (
            <H5 style={{ color: textColor }}>{title}</H5>
          ) : (
            <B2 style={{ color: textColor }}>{title}</B2>
          )
        ) : (
          title // ReactNode
        )}
      </TouchableOpacity>
    );
  }
);

// --- Tabs Component ---
const Tabs: React.FC<TabsProps> = ({
  tabTitles,
  children,
  setCurrentTab = 0,
  color = "green",
  style,
  variant = "default",
  headerStyle,
  renderTabHeader,
}) => {
  const [activeTab, setActiveTab] = useState<number>(setCurrentTab);

  useEffect(() => {
    setActiveTab(setCurrentTab);
  }, [setCurrentTab]);

  const tabContents = React.Children.toArray(children) as ReactNode[];
  const isVariantDefault = variant === "default";

  if (isVariantDefault && tabTitles?.length !== tabContents?.length) {
    console.warn("Number of tab titles must match number of tab contents");
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {renderTabHeader ? (
        renderTabHeader({ activeTab, setActiveTab })
      ) : (
        <View
          style={[
            styles.tabHeader,
            headerStyle,
            variant === "ghost" && { borderBottomWidth: 0 },
          ]}
        >
          {isVariantDefault && tabTitles?.map((title, index) => (
            <TabButton
              key={`tab-${index}`}
              title={title}
              isActive={activeTab === index}
              onPress={() => setActiveTab(index)}
              color={color}
              variant={variant}
            />
          ))}
        </View>
      )}

      <View style={styles.tabContent}>
        {tabContents.map((child, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              display: activeTab === index ? "flex" : "none",
              width: "100%",
            }}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: getColor("light", 200),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  tabContent: {
    flex: 1,
    borderRadius: 8,
  },
});
