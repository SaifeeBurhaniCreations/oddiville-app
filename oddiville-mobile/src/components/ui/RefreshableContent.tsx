import React from "react";
import { View } from "react-native";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";

type RefreshableContentProps = {
  isEmpty: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  emptyComponent: React.ReactNode;
  children: React.ReactNode;
};

const RefreshableContent = ({
  isEmpty,
  refreshing,
  onRefresh,
  emptyComponent,
  children,
}: RefreshableContentProps) => {
  if (isEmpty) {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
      >
        {emptyComponent}
      </ScrollView>
    );
  }

  return <View style={{ flex: 1 }}>{children}</View>;
};

export default RefreshableContent;