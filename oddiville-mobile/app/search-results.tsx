// SearchResultsScreen.tsx
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SearchInput from "@/src/components/ui/SearchInput";
import Chip from "@/src/components/ui/Chip";
import BellRingingIcon from "@/src/components/icons/page/BellringingIcon";
import HistoryIcon from "@/src/components/icons/page/HistoryIcon";
import { getColor } from "@/src/constants/colors";
import EmptyState from "@/src/components/ui/EmptyState";
import { H2 } from "@/src/components/typography/Typography";
import { useParams } from "@/src/hooks/useParams";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import SearchActivitesFlatList from "@/src/components/ui/SearchActivitesFlatList";
import PageHeader from "@/src/components/ui/PageHeader";
import type { SearchRegistryKey } from "@/src/utils/searchRegistyUtil";
import { useSearchController } from "@/src/hooks/useSearchController";

type ChipItem = {
  text: string;
  icon: JSX.Element;
  key: SearchRegistryKey;
};

const chips: ChipItem[] = [
  { text: "Raw material ordered", icon: <HistoryIcon />, key: "raw-material-ordered" },
  { text: "Order shipped", icon: <BellRingingIcon />, key: "order-shipped" },
  { text: "Raw material reached", icon: <HistoryIcon />, key: "raw-material-reached" },
  { text: "Order ready", icon: <BellRingingIcon />, key: "order-ready" },
  { text: "Order reached", icon: <BellRingingIcon />, key: "order-reached" },
  { text: "Vendors", icon: <HistoryIcon />, key: "vendor" },
  { text: "Production Start", icon: <BellRingingIcon />, key: "production-start" },
  { text: "Production Completed", icon: <BellRingingIcon />, key: "production-completed" },
  { text: "Production Inprogress", icon: <BellRingingIcon />, key: "production-inprogress" },
  { text: "Trucks", icon: <HistoryIcon />, key: "trucks" },
{ text: "Packing", icon: <HistoryIcon />, key: "packing-event" },
];

const KEYBOARD_VERTICAL_OFFSET = Platform.OS === "ios" ? 88 : 0;

const SearchResultsScreen = () => {
  const { query } = useParams("search-results", "query");
  const queryString = typeof query === "string" ? query : "";

  const search = useSearchController(queryString);

  /* ---------------- Handlers ---------------- */

  const handleSearchInputChange = (text: string) => {
    search.updateQuery(text);
  };

  const handleSubmit = () => {
    search.submitSearch();
  };

  /* ---------------- UI ---------------- */

  const renderContent = () => {
    if (search.phase === "idle") {
      return (
        <View style={styles.emptyWrapper}>
          <EmptyState
            stateData={{
              title: "Start typing to search",
              description: "Search across orders, vendors, production, trucks & packing",
            }}
            color="green"
          />
        </View>
      );
    }

    if (search.phase === "loading") {
      return (
        <View style={styles.emptyWrapper}>
          <EmptyState
            stateData={{
              title: "Searching...",
              description: "Preparing results",
            }}
            color="green"
          />
        </View>
      );
    }

    if (search.phase === "empty") {
      return (
        <View style={styles.emptyWrapper}>
          <EmptyState
            stateData={{
              title: "No results found",
              description: "Try different keywords or filters",
            }}
            color="green"
          />
        </View>
      );
    }

    return (
      <View style={{ flex: 1, gap: 24 }}>
        <H2 style={{ paddingHorizontal: 24 }}>
          Search result: {search.rawCount}
        </H2>

        <SearchActivitesFlatList
          activities={search.results.map(doc => doc.activity)}
        />
      </View>
    );
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Search Result"} />
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={KEYBOARD_VERTICAL_OFFSET}
        >
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.wrapContainer}>
              <BackButton label="Search result" backRoute="home" style={{ marginHorizontal: 16 }} />

              <SearchInput
                value={search.query}
                defaultValue={queryString}
                onChangeText={handleSearchInputChange}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                border
                cross
                w={0.92}
                style={{ marginHorizontal: 16 }}
              />

              {/* FILTER CHIPS */}
              <View style={styles.centeredChips}>
                {chips.map((chip) => (
                  <Chip
                    key={chip.key}
                    icon={chip.icon}
                    isActive={search.filters.includes(chip.key)}
                    onPress={() => search.toggleFilter(chip.key)}
                  >
                    {chip.text}
                  </Chip>
                ))}
              </View>

              {renderContent()}
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
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingVertical: 16,
  },
  wrapContainer: {
    flexDirection: "column",
    gap: 12,
  },
  centeredChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyWrapper: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },
});