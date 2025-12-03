import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import { StyleSheet, View } from "react-native";
import UserFlatList from "@/src/components/ui/UserFlatList";
import { UserProps } from "@/src/types";
import PencilIcon from "@/src/components/icons/common/PencilIcon";
import Button from "@/src/components/ui/Buttons/Button";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import user1 from "@/src/assets/images/users/user-1.png";
import { runFilter } from "@/src/utils/bottomSheetUtils";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useMemo, useState } from "react";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useDeleteUser, useUsers } from "@/src/hooks/user";
import Loader from "@/src/components/ui/Loader";
import useDebouncedValue from "@/src/utils/debounceUtil";
import Modal from "@/src/components/ui/modals/Modal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setDeleteUserPopup } from "@/src/redux/slices/delete-popup-slice";
import { removeUser } from "@/src/services/user.service";

const UserScreen = () => {
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { goTo } = useAppNavigation();
  const username = useSelector(
    (state: RootState) => state.bottomSheet.meta?.id
  );

  const showDeletePopup = useSelector(
    (state: RootState) => state.deletePopup.showDeletePopup
  );

  const {
    data: rawUsers,
    count,
    isFetching: userFetching,
    refetch,
  } = useUsers();
  const deleteUserMutation = useDeleteUser();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 250);
  const dispatch = useDispatch();
  const users = useMemo<UserProps[]>(() => {
    if (!rawUsers) return [];
    const order = ["superadmin", "admin", "supervisor"];
    const sortedUser = [...rawUsers].sort(
      (a, b) => order.indexOf(a.role) - order.indexOf(b.role)
    );

    const s = (debouncedSearch ?? "").trim().toLowerCase();
    const filtered = s
      ? sortedUser.filter(
          (u) =>
            (u.name ?? "").toLowerCase().includes(s) ||
            (u.username ?? "").toLowerCase().includes(s) ||
            (u.email ?? "").toLowerCase().includes(s) ||
            (u.phone ?? "").toLowerCase().includes(s)
        )
      : sortedUser;

    return filtered.map((u) => ({
      name: u.name,
      username: u.username,
      role: u.role,
      profileImg: user1,
      extra_details: `${u.phone ?? ""} • ${u.email ?? ""}`,
      label: "Access",
      disabled: false,
      icon: PencilIcon,
      href: "user-form",
    }));
  }, [rawUsers, debouncedSearch]);

  const handleSearchFilter = () => {
    runFilter({
      key: "user:overview",
      validateAndSetData,
      mode: "select-main",
    });
  };

  const handlePress = async (username: string) => {
    await validateAndSetData(username, "user-action");
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Users"} />
      <View style={styles.wrapper}>
        <View
          style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}
        >
          <BackButton label={`Users (${count})`} backRoute="home" />
          <Button variant="outline" size="md" onPress={() => goTo("user-form")}>
            Invite user
          </Button>
        </View>
        <View style={styles.content}>
          <SearchWithFilter
            placeholder={"Search user by name"}
            value={searchValue}
            cross={true}
            onFilterPress={handleSearchFilter}
            onSubmitEditing={() => {}}
            onChangeText={(text) => setSearchValue(text)}
            onClear={() => setSearchValue("")}
          />
          <UserFlatList
            users={users}
            fetchMore={() => {}}
            hasMore={false}
            isLoading={false}
            refetch={refetch}
            onActionPress={handlePress}
          />
        </View>
      </View>
      {userFetching && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}

      <Modal
        showPopup={showDeletePopup}
        setShowPopup={(visible) => dispatch(setDeleteUserPopup(visible))}
        modalData={{
          title: "Remove User",
          description: `You are deleting User "${username}"  parmanently, are you sure?`,
          type: "danger",
          buttons: [
            {
              variant: "fill",
              label: "Delete",
              action: () =>
                typeof username === "string" &&
                deleteUserMutation.mutate({ username }),
            },
          ],
        }}
      />
    </View>
  );
};

export default UserScreen;

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
  content: {
    flexDirection: "column",
    gap: 16,
    height: "100%",
  },

  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
