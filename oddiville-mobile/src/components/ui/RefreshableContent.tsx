import React from "react";
import { View } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";

type ListProps = {
  data: any[];
  renderItem: any;
  keyExtractor?: any;
  ListEmptyComponent?: React.ReactNode;
  refreshControl?: React.ReactElement;
};

type RefreshableContentProps = {
  isEmpty: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  emptyComponent: React.ReactNode;
  children: React.ReactElement<ListProps>;
};

const RefreshableContent = ({
  isEmpty,
  refreshing,
  onRefresh,
  emptyComponent,
  children,
}: RefreshableContentProps) => {
  return React.cloneElement(children, {
    ListEmptyComponent: isEmpty ? emptyComponent : undefined,
    refreshControl: (
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    ),
  });
};

export default RefreshableContent;