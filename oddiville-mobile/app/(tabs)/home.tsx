import ActivitesFlatList from "@/src/components/ui/ActivitesFlatList";
import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import SearchBar from "@/src/components/ui/SearchBar";
import Tabs from "@/src/components/ui/Tabs";
import { ActionButtonConfig, ActivityProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { StyleSheet, View } from "react-native";
import { useAdmin } from "@/src/hooks/useAdmin";
import { useEffect, useMemo, useRef, useState } from "react";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { BottomSheetSchemaKey, FilterEnum } from "@/src/schemas/BottomSheetSchema";
import Loader from "@/src/components/ui/Loader";
import { actionableButtons } from "@/src/lookups/actionableButtons";
import * as SecureStore from "expo-secure-store";
import {
  useActionableNotifications,
  useInformativeNotifications,
  useTodaysNotifications,
} from "@/src/hooks/useNotifications";
import { AdminNotification } from "@/src/types/notification";
import { getCreatedAt, getDescription } from "@/src/utils/formatUtils";
import { useAuth } from "@/src/context/AuthContext";
import { resolveAccess } from "@/src/utils/policiesUtils";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import { filterItems, flattenFilters } from "@/src/utils/filterUtils";
import { filterHandlers } from "@/src/lookups/filters";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { runFilter } from "@/src/utils/bottomSheetUtils";
import { FilterNode } from "@/src/redux/slices/bottomsheet/filters.slice";
import OverlayLoader from "@/src/components/ui/OverlayLoader";

const informativeNotificationsDataFormatter = (
  data: AdminNotification[]
): ActivityProps[] =>
  data.map((val: any) => ({
    id: val.id ?? "unknown",
    itemId: val.itemId ?? "unknown",
    title: val.title,
    type: val.type,
    read: val.read,
    createdAt: getCreatedAt(val),
    extra_details: getDescription(val),
    identifier: val.identifier,
    color: val.color,
  }));

const actionableNotificationsDataFormatter = (
  data: AdminNotification[]
): ActivityProps[] =>
  data.map((val: any) => ({
    id: val.id ?? "unknown",
    itemId: val.itemId ?? "unknown",
    title: val.title,
    type: val.type,
    read: val.read,
    createdAt: getCreatedAt(val),
    extra_details: getDescription(val),
    identifier: val.identifier,
    color: val.color,
    buttons: actionableButtons[val.type as BottomSheetSchemaKey]
      ? [
          actionableButtons[
            val.type as BottomSheetSchemaKey
          ] as ActionButtonConfig,
        ]
      : [],
    data: { disableButton: val.type === "order-ready" ? true : false },
  }));

const todaysNotificationsDataFormatter = (
  data: AdminNotification[]
): ActivityProps[] =>
  data.map((val: any) => ({
    id: val.id ?? "unknown",
    itemId: val.itemId ?? "unknown",
    title: val.title,
    type: val.type,
    read: val.read,
    createdAt: getCreatedAt(val),
    extra_details: getDescription(val),
    identifier: val.identifier,
    color: val.color,
  }));

  const MAX_LOCAL_FILTER = 100;

const HomeScreen = () => {
    const nestedFilters = useSelector((state: RootState) => state.filter.filters);
  
    const { role, policies } = useAuth();
  
    const safeRole = role ?? "guest";
    const safePolicies = policies ?? [];
    const access = resolveAccess(safeRole, safePolicies);
  
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);    
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  useAdmin();

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };
  const {
    data: informativenotifications,
    fetchNextPage: fetchNextInformativePage,
    hasNextPage: hasNextInformativePage,
    isFetchingNextPage: isFetchingNextInformativePage,
    isFetching: isFetchingInformativeNotifications,
    refetch: refetchInformative,
  } = useInformativeNotifications();

  const {
    data: actionablenotifications,
    fetchNextPage: fetchNextActionablePage,
    hasNextPage: hasNextActionablePage,
    isFetchingNextPage: isFetchingNextActionablePage,
    isFetching: isFetchingActionableNotifications,
    refetch: refetchActionable,
  } = useActionableNotifications();

  const {
    data: todaysnotifications,
    fetchNextPage: fetchNextTodaysPage,
    hasNextPage: hasNextTodaysPage,
    isFetchingNextPage: isFetchingNextTodaysPage,
    isFetching: isFetchingTodaysNotifications,
    refetch: refetchTodays,
  } = useTodaysNotifications();

  const formatedInformativeNotifications =
    informativeNotificationsDataFormatter(informativenotifications);

  const formatedActionableNotifications = actionableNotificationsDataFormatter(
    actionablenotifications
  );
  const formatedTodaysNotifications =
    todaysNotificationsDataFormatter(todaysnotifications);

  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const stringifiedUser = await SecureStore.getItemAsync("newsync");

        if (!stringifiedUser) return;

        const user = JSON.parse(stringifiedUser);

        if (user?.username) {
          setUsername(user.username);
        }
      } catch (error) {
        console.error("Failed to load user from storage:", error);
      }
    };

    getUserFromStorage();
  }, []);

  if (!access.isFullAccess) {
  return null;
}
  const handleOpen = async (id: string, type: BottomSheetSchemaKey) => {
    setIsLoading(true);
    await validateAndSetData(id, type);
    setIsLoading(false);
  };

const filtersApplied = useMemo(() => {
  const hasValue = (node?: FilterNode): boolean => {
    if (!node) return false;
    if (node.value != null) return true;
    return Object.values(node.children ?? {}).some(hasValue);
  };

  const result = Object.values(nestedFilters).some(hasValue);

  return result;
}, [nestedFilters]);

  const filters = useMemo(
    () => flattenFilters(nestedFilters) as Record<FilterEnum, string[]>,
    [nestedFilters]
  );

const filteredNotifications = useMemo(() => {
  if (!filtersApplied) return formatedInformativeNotifications;

  const slice = formatedInformativeNotifications.slice(0, MAX_LOCAL_FILTER);
  return filterItems(slice, filters, filterHandlers);
}, [formatedInformativeNotifications, filters, filtersApplied]);

const informativeListData = useMemo(() => {
  return filtersApplied
    ? filteredNotifications
    : formatedInformativeNotifications;
}, [filtersApplied, filteredNotifications, formatedInformativeNotifications]);

const canPaginateInformative = !filtersApplied;

const hasShownFilterToast = useRef(false);

useEffect(() => {
  if (!filtersApplied) {
    hasShownFilterToast.current = false;
    return;
  }

  if (
    formatedInformativeNotifications.length > MAX_LOCAL_FILTER &&
    !hasShownFilterToast.current
  ) {
    showToast("info", "Refine filters or scroll to load more results");
    hasShownFilterToast.current = true;
  }
}, [filtersApplied, formatedInformativeNotifications.length]);



useEffect(() => {
  if (formatedInformativeNotifications.length > 200) {
    showToast("error", "Too many notifications to filter");
  }
}, [formatedInformativeNotifications.length]);

  const handleSearchFilter = () => {
    setIsLoading(true);
    runFilter({
      key: "home:activities",
      validateAndSetData,
      mode: "select-main",
    });
    setIsLoading(false);
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Home"} />
      <View style={styles.wrapper}>
        <SearchBar />

        <Tabs
          tabTitles={["Activities", "Actions", "Today"]}
          color="green"
          style={styles.flexGrow}
        >
        <View style={[styles.flexGrow, {flexDirection: "column"}]}>
                  <View style={styles.searchinputWrapper}>
          <SearchWithFilter
            placeholder={"Search activities"}
            value={""}
            cross={true}
            onFilterPress={handleSearchFilter}
            onSubmitEditing={() => {}}
            onChangeText={(text) => () => {}}
            onClear={() => () => {}}
          />
        </View>
           {/* <ActivitesFlatList
            isVirtualised={true}
            onPress={handleOpen}
            fetchMore={() => {
              if (hasNextInformativePage && !isFetchingNextInformativePage)
                fetchNextInformativePage();
            }}
            hasMore={hasNextInformativePage ?? false}
            activities={formatedInformativeNotifications}
            isLoading={isFetchingInformativeNotifications}
            listKey={"recent_activities"}
            extraData={formatedInformativeNotifications}
            refetch={refetchInformative}
          /> */}
          <ActivitesFlatList
            isVirtualised={true}
            onPress={handleOpen}
            fetchMore={() => {
              if (
                canPaginateInformative &&
                hasNextInformativePage &&
                !isFetchingNextInformativePage
              ) {
                fetchNextInformativePage();
              }
            }}
            hasMore={canPaginateInformative && hasNextInformativePage}
            activities={informativeListData}
            isLoading={isFetchingInformativeNotifications}
            listKey={"recent_activities"}
            extraData={informativeListData}
            refetch={refetchInformative}
          />

   </View>
          <ActivitesFlatList
            isVirtualised={true}
            onPress={handleOpen}
            fetchMore={() => {
              if (hasNextActionablePage && !isFetchingNextActionablePage)
                fetchNextActionablePage();
            }}
            hasMore={hasNextActionablePage ?? false}
            activities={formatedActionableNotifications}
            isLoading={isFetchingActionableNotifications}
            listKey={"alerts"}
            extraData={formatedActionableNotifications}
            refetch={refetchActionable}
          />
          <ActivitesFlatList
            isVirtualised={true}
            onPress={handleOpen}
            fetchMore={() => {
              if (hasNextTodaysPage && !isFetchingNextTodaysPage)
                fetchNextTodaysPage();
            }}
            hasMore={hasNextTodaysPage ?? false}
            activities={formatedTodaysNotifications}
            isLoading={isFetchingTodaysNotifications}
            listKey={"today"}
            extraData={formatedTodaysNotifications}
            refetch={refetchTodays}
          />
        </Tabs>
      </View>

      <BottomSheet color="green" />

       {(isLoading ||
        isFetchingInformativeNotifications ||
        isFetchingActionableNotifications ||
        isFetchingTodaysNotifications) && <OverlayLoader />}
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.05),
    zIndex: 2,
  },
    searchinputWrapper: {
    height: 44,
    marginTop: 16,
  },
});

export default HomeScreen;
