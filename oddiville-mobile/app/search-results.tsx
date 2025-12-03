// SearchResultsScreen.tsx
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SearchInput from "@/src/components/ui/SearchInput";
import { useCallback, useMemo, useState } from "react";
import Chip from "@/src/components/ui/Chip";
import BellRingingIcon from "@/src/components/icons/page/BellringingIcon";
import HistoryIcon from "@/src/components/icons/page/HistoryIcon";
import { getColor } from "@/src/constants/colors";
import EmptyState from "@/src/components/ui/EmptyState";
import RecentSearchItem from "@/src/components/ui/RecentSearchTerm";
import { B5, H2 } from "@/src/components/typography/Typography";
import Button from "@/src/components/ui/Buttons/Button";
import { useParams } from "@/src/hooks/useParams";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { useInformativeNotifications } from "@/src/hooks/useNotifications";
import { AdminNotification } from "@/src/types/notification";
import { ActivityProps } from "@/src/types";
import SearchActivitesFlatList from "@/src/components/ui/SearchActivitesFlatList";
import { useGlobalSearch } from "@/src/hooks/globalSearch";
import { getCreatedAt, getDescription } from "@/src/utils/formatUtils";
import useDebouncedValue from "@/src/utils/debounceUtil";
import PageHeader from "@/src/components/ui/PageHeader";

const initialChips = [
  { text: "Raw material ordered", icon: <HistoryIcon />, key: "raw-material-ordered", isActive: false },
  { text: "Order shipped", icon: <BellRingingIcon />, key: "order-shipped", isActive: false },
  { text: "Raw material reached", icon: <HistoryIcon />, key: "raw-material-reached", isActive: false },
  { text: "Order ready", icon: <BellRingingIcon />, key: "order-ready", isActive: false },
  { text: "Order reached", icon: <BellRingingIcon />, key: "order-reached", isActive: false },
  { text: "Vendors", icon: <HistoryIcon />, key: "vendor", isActive: false },
  { text: "Production Start", icon: <BellRingingIcon />, key: "production-start", isActive: false },
  { text: "Production Completed", icon: <BellRingingIcon />, key: "production-completed", isActive: false },
  { text: "Production Inprogress", icon: <BellRingingIcon />, key: "production-inprogress", isActive: false },
  { text: "Trucks", icon: <HistoryIcon />, key: "trucks", isActive: false },
];

const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 88 : 0;

const SearchResultsScreen = () => {
  const { query } = useParams("search-results", "query");
  const [searchText, setSearchText] = useState(query || "");
  const [searchedState, setSearchedState] = useState(false);

  const [chipList, setChipList] = useState(() => initialChips);

  const selectedKeys = useMemo(
    () => chipList.filter((c) => c.isActive).map((c) => c.key as string),
    [chipList]
  );

  const debouncedSelectedKeys = useDebouncedValue<string[]>(selectedKeys, 300);
  const debouncedSearchText = useDebouncedValue(searchText, 300);

  const { items: activities, count, isLoading } = useGlobalSearch(
    debouncedSelectedKeys as any,
    debouncedSearchText
  );

  const [recentSearchTerm, setRecentSearchTerm] = useState<string[]>([]);
  const isRecentSearch = recentSearchTerm.length > 0;

  const informativeNotificationsDataFormatter = (data: AdminNotification[] = []): ActivityProps[] =>
    data.map((val: any) => ({
      id: val.id ?? "unknown",
      itemId: val.itemId ?? "unknown",
      title: val.title,
      type: val.type,
      read: val.read,
      createdAt: getCreatedAt(val),
      extra_details: getDescription(val),
      identifier: val.identifier,
    }));

  const {
    data: informativenotifications,
    fetchNextPage: fetchNextInformativePage,
    hasNextPage: hasNextInformativePage,
    isFetchingNextPage: isFetchingNextInformativePage,
    isFetching: isFetchingInformativeNotifications,
    refetch: refetchInformative,
  } = useInformativeNotifications();

  const formatedInformativeNotifications = informativeNotificationsDataFormatter(informativenotifications ?? []);

  const toggleChip = useCallback((index: number) => {
    setChipList((prev) => {
      const copy = prev.slice();
      copy[index] = { ...copy[index], isActive: !copy[index].isActive };
      return copy;
    });
  }, []);

  const handleSearchInputChange = (text: string) => {
    setSearchText(text);
  };

  const handleSubmit = () => {
    setSearchedState(true);
  };

  const handleOpen = async () => {};

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Search Result"} />
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "flex-start",
              paddingBottom: Platform.OS === "ios" ? 0 : 24,
            }}
          >
            <View style={styles.wrapContainer}>
              <BackButton label="Search result" backRoute="admin-home" style={{ marginHorizontal: 16 }} />

              <SearchInput
                value={searchText}
                defaultValue={query}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                border={true}
                cross={true}
                w={0.92}
                style={{ marginHorizontal: 16 }}
              />

              <View
                style={[
                  styles.centeredChips,
                  {
                    borderBottomWidth: searchedState ? 0 : 1,
                    paddingBottom: searchedState ? 0 : 24,
                  },
                ]}
              >
                {(() => {
                  const withIndex = chipList.map((c, i) => ({ ...c, originalIndex: i }));
                  const chipsToRender = searchedState ? withIndex.filter((c) => c.isActive) : withIndex;
                  return chipsToRender.map((chip) => (
                    <Chip key={chip.text} icon={chip.icon} isActive={chip.isActive} onPress={() => toggleChip(chip.originalIndex)}>
                      {chip.text}
                    </Chip>
                  ));
                })()}
              </View>

              {isRecentSearch && !searchedState ? (
                <View style={styles.flexFill}>
                  <View style={styles.recentSearchWrapper}>
                    <B5 style={{ textTransform: "uppercase" }}>Recent search</B5>
                    <ScrollView style={{ width: "100%" }}>
                      <View style={[styles.recentSearchList, { width: "100%" }]}>
                        {recentSearchTerm.map((value, index) => (
                          <RecentSearchItem
                            color="green"
                            key={index}
                            recentSearchTerm={recentSearchTerm}
                            setRecentSearchTerm={setRecentSearchTerm}
                            index={index}
                          >
                            {value}
                          </RecentSearchItem>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  <Button variant="fill" color="green" style={{ textAlign: "center" }}>
                    View all searches
                  </Button>
                </View>
              ) : searchedState ? (
                <View style={{ flex: 1, flexDirection: "column", gap: 24 }}>
                  <H2 style={{ paddingHorizontal: 24 }}>Search result: {count}</H2>

                  <SearchActivitesFlatList
                    isVirtualised={false}
                    onPress={handleOpen}
                    fetchMore={() => {
                      if (hasNextInformativePage && !isFetchingNextInformativePage) fetchNextInformativePage();
                    }}
                    style={{ paddingHorizontal: 16 }}
                    hasMore={hasNextInformativePage ?? false}
                    activities={activities}
                    isLoading={isFetchingInformativeNotifications}
                    listKey={"global_search"}
                    extraData={formatedInformativeNotifications}
                    refetch={refetchInformative}
                  />
                </View>
              ) : (
                <View style={styles.emptyWrapper}>
                  <EmptyState
                    stateData={{
                      title: "No recent search yet",
                      description: "'Recent Search' shows the last 30 days, auto-deleting after.",
                    }}
                    color="green"
                    style={{
                      flexDirection: "column",
                      gap: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      maxWidth: 270,
                      flexGrow: 1,
                      minHeight: 300,
                      paddingBottom: 24,
                    }}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default SearchResultsScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    flexDirection: "column",
    gap: 24,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingVertical: 16,
  },
  wrapContainer: {
    flexDirection: "column",
    gap: 12,
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
  content: {
    flexDirection: "column",
    gap: 16,
    height: "100%",
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: { justifyContent: "space-between" },
  alignCenter: { alignItems: "center" },
  gap8: { gap: 8 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  centeredChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: getColor("green", 100),
    paddingBottom: 24,
  },

  emptyWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  flexFill: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  recentSearchWrapper: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  recentSearchList: {
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
});