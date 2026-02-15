import {
  StyleSheet,
  View,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/src/redux/store";
import { Dimensions } from "react-native";
import { getColor } from "@/src/constants/colors";
import { renderHexagonRow } from "@/src/utils/hexagonUtils";
import { closeMenu } from "@/src/redux/slices/menusheet.slice";
import CustomImage from "./CustomImage";
import { B4, H1, H4 } from "../typography/Typography";
import CrossIcon from "../icons/page/CrossIcon";
import {
  CHAMBERS_MENU_ITEMS,
  DISPATCH_MENU_ITEMS,
  MENU_ITEMS,
  PACKAGE_MENU_ITEMS,
  PRODUCTION_MENU_ITEMS,
  PURCHASE_MENU_ITEMS,
  TRUCKS_MENU_ITEMS,
LABOURS_MENU_ITEMS,
} from "@/src/constants/MenuItems";
import MenuCard from "./MenuCard";
import LogoutIcon from "../icons/menu/LogoutIcon";
import ActionButton from "./Buttons/ActionButton";
import PencilIcon from "../icons/common/PencilIcon";
import { ScrollView } from "react-native-gesture-handler";
import { useAdmin } from "@/src/hooks/useAdmin";
import { clearAdmin } from "@/src/redux/slices/admin.slice";
import { useAuth } from "@/src/context/AuthContext";
import { closeFab } from "@/src/redux/slices/fab.Slice";
import { useRouter } from "expo-router";
import { canView, isSingleModuleUser, resolveAccess } from "@/src/utils/policiesUtils";

const user1 = require("@/src/assets/images/users/user-1.png");

const { width, height } = Dimensions.get("window");
const MenuSheetWidth = width * 0.85;
const headerHeight = height * 0.25;

const MenuSheet = () => {
  const admin = useAdmin();
  const router = useRouter();

  const { logout, role } = useAuth();
  const currentView = useSelector(
    (state: RootState) => state.changeView.viewIs
  );

  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);

  const slideAnim = useRef(new Animated.Value(-MenuSheetWidth - 32)).current;
  const menuRef = useRef(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    isAnimating.current = true;
    Animated.timing(slideAnim, {
      toValue: isOpen ? 0 : -MenuSheetWidth - 32,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  }, [isOpen]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isOpen) {
          dispatch(closeMenu());
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isOpen]);

  const handleTouchOutside = () => {
    if (!isAnimating.current) {
      dispatch(closeMenu());
    }
  };

  const handleLogout = async () => {
    dispatch(closeMenu());
    dispatch(clearAdmin());
    await logout();
    router.replace("/");
  };

  const handleMenuPress = () => {
    dispatch(closeMenu());
    if (isOpen) dispatch(closeFab());
  };

  const access = resolveAccess(admin && admin?.role, admin && admin?.policies);

  const canPurchase = canView(access.purchase);
const canSales = canView(access.sales);
const canProduction = canView(access.production);
const canPackage = canView(access.package);
const canTrucks = canView(access.trucks);
const canLabours = canView(access.labours);

// behaviour
const onlyPurchaseUser = isSingleModuleUser(access, "purchase");
const onlySalesUser = isSingleModuleUser(access, "sales");
const onlyProductionUser = isSingleModuleUser(access, "production");
const onlyPackageUser = isSingleModuleUser(access, "package");
const onlyTrucksUser = isSingleModuleUser(access, "trucks");
const onlyLaboursUser = isSingleModuleUser(access, "labours");
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {isOpen && (
        <TouchableWithoutFeedback onPress={handleTouchOutside}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View
        ref={menuRef}
        style={[styles.sheet, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.headerContainer}>
          {Array.from({ length: 6 }, (_, index) =>
            renderHexagonRow(index, MenuSheetWidth)
          )}
          <View
            style={[
              {
                position: "absolute",
                left: 16,
                top: 32,
                width: MenuSheetWidth - 32,
              },
              styles.HStack,
              styles.justifyBetween,
              styles.alignItemsCenter,
            ]}
          >
            <H1 color={getColor("light", 500)}>Menu</H1>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.HStack,
                styles.alignItemsCenter,
                styles.justifyBetween,
                styles.crossIcon,
              ]}
              onPress={() => dispatch(closeMenu())}
            >
              <CrossIcon size={16} color={getColor("light", 500)} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.avatarWrapper}>
          <CustomImage
            style={styles.avatarImage}
            src={user1}
            width={72}
            height={72}
          />
        </View>

        <View style={styles.bodyContainer}>
          <View style={styles.userInfoContainer}>
            <ActionButton
              icon={PencilIcon}
              disabled={role !== "superadmin" && role !== "admin"}
            >
              Edit profile
            </ActionButton>
            <H4 color={getColor("green", 700)}>{admin?.name}</H4>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <B4 color={getColor("green", 400)}>{admin?.phone}</B4>
              <B4 color={getColor("green", 400)}>•</B4>
              <B4 color={getColor("green", 400)}>{admin?.email}</B4>
            </View>
          </View>

<ScrollView contentContainerStyle={styles.contentContainer}>
  <View style={styles.navigationContainer}>

    {/* Admin */}
    {access.isFullAccess &&
      MENU_ITEMS.map((item) => (
        <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
      ))}

    {/* Operator roles */}
    {!access.isFullAccess && !onlyPurchaseUser && !onlySalesUser && !onlyProductionUser && !onlyPackageUser && !onlyTrucksUser && !onlyLaboursUser && (
      <>
        {(canProduction || canPackage || canSales) &&
          CHAMBERS_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canPurchase &&
          PURCHASE_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canProduction &&
          PRODUCTION_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canPackage &&
          PACKAGE_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canSales &&
          DISPATCH_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canTrucks &&
          TRUCKS_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}

        {canLabours &&
          LABOURS_MENU_ITEMS.map((item) => (
            <MenuCard key={item.name} item={item} onPress={handleMenuPress} />
          ))}
      </>
    )}
  </View>
</ScrollView>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.menuFooter}
            onPress={handleLogout}
          >
            <LogoutIcon />
            <H4 color={getColor("red", 700)}>Logout</H4>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  crossIcon: {
    backgroundColor: getColor("light", 500, 0.2),
    padding: 6,
    borderRadius: "50%",
    borderWidth: 1,
    borderColor: getColor("light", 500, 0.3),
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2,
  },
  sheet: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: 8,
    borderRadius: 16,
    width: MenuSheetWidth,
    backgroundColor: getColor("light", 200),
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 3,
  },
  avatarWrapper: {
    position: "absolute",
    top: headerHeight - headerHeight * 0.2,
    left: 16,
    zIndex: 1,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: getColor("light"),
  },
  avatarImage: {
    borderRadius: 50,
  },
  headerContainer: {
    height: headerHeight,
    backgroundColor: getColor("green", 500),
    position: "relative",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  bodyContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  contentContainer: {
    flexDirection: "column",
    gap: 12,
  },
  userInfoContainer: {
    flexDirection: "column",
    gap: 4,
    backgroundColor: getColor("light"),
    width: "100%",
    padding: 16,
  },
  navigationContainer: {
    flexDirection: "column",
    gap: 16,
    padding: 16,
  },
  menuFooter: {
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderTopColor: getColor("green", 100),
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    padding: 16,
  },
});

export default MenuSheet;
