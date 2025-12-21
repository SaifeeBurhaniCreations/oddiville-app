import React from "react";
import { ScrollView, View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

type RefreshableListProps = {
  refreshing?: boolean;
  onRefresh?: () => void;
};

type RefreshableContentProps = {
  isEmpty: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  emptyComponent: React.ReactNode;
  listComponent: React.ReactElement<RefreshableListProps>;
};

const RefreshableContent = ({
  isEmpty,
  refreshing,
  onRefresh,
  emptyComponent,
  listComponent,
}: RefreshableContentProps) => {
  if (isEmpty) {
    return (
      <ScrollView
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ flex: 1 }}>{emptyComponent}</View>
      </ScrollView>
    );
  }

  return React.cloneElement(listComponent, {
    refreshing,
    onRefresh,
  });
};

export default RefreshableContent;
