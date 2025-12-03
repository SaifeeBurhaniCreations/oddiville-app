import ActivitesFlatList from "@/src/components/ui/ActivitesFlatList";
import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import SearchBar from "@/src/components/ui/SearchBar";
import Tabs from "@/src/components/ui/Tabs";
import { ActionButtonConfig, ActivityProps } from "@/src/types";
import { getColor } from "@/src/constants/colors";
import { StyleSheet, View } from "react-native";
import { useAdmin } from "@/src/hooks/useAdmin";
import { useEffect, useState } from "react";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { BottomSheetSchemaKey } from "@/src/schemas/BottomSheetSchema";
import Loader from "@/src/components/ui/Loader";
import {
  Notification,
  useNotificationsActionable,
  useNotificationsInformative,
  useNotificationsTodays,
} from "@/src/hooks/useAdminNotifications";
import * as SecureStore from "expo-secure-store";
import { parseValidDate } from "@/src/utils/dateUtils";
import { actionableButtons } from "@/src/lookups/actionableButtons";
import { useArrayTransformer } from "@/src/sbc/utils/arrayTransformer/useArrayTransformer";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import Button from "@/src/components/ui/Buttons/Button";
import {
  useActionableNotifications,
  useInformativeNotifications,
  useTodaysNotifications,
} from "@/src/hooks/useNotifications";
import { AdminNotification } from "@/src/types/notification";
import { getCreatedAt, getDescription } from "@/src/utils/formatUtils";

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
    buttons: actionableButtons[val.type as BottomSheetSchemaKey]
      ? [
          actionableButtons[
            val.type as BottomSheetSchemaKey
          ] as ActionButtonConfig,
        ]
      : [],
    metaData: { disableButton: val.type === "order-ready" ? true : false },
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
  }));

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  useAdmin();
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

  const handleOpen = async (id: string, type: BottomSheetSchemaKey) => {
    setIsLoading(true);
    await validateAndSetData(id, type);
    setIsLoading(false);
  };

// console.log("formatedInformativeNotifications", JSON.stringify(formatedInformativeNotifications, null, 2));


  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Home"} />
      <View style={styles.wrapper}>
        <SearchBar />

        <Tabs
          tabTitles={["Recents", "Alerts", "Today's"]}
          color="green"
          style={styles.flexGrow}
        >
          <ActivitesFlatList
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
          />
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
        isFetchingTodaysNotifications) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;
