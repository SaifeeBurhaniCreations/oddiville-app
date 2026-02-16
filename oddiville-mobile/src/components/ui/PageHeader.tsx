import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getColor } from "@/src/constants/colors";
import { H1, B6 } from "../typography/Typography";
import WindmillIcon from "../icons/header/WindmillIcon";
import BarnIcon from "../icons/header/BarnIcon";
import FarmerIcon from "../icons/header/FarmerIcon";
import CarrotIcon from "../icons/header/CarrotIcon";
import FruitBasketIcon from "../icons/header/FruitBasketIcon";
import FactoryIcon from "../icons/header/FactoryIcon";
import GearsIcon from "../icons/header/GearsIcon";
import BoxIcon from "../icons/header/BoxesIcon";
import WarehouseBoxesIcon from "../icons/header/WarehouseBoxesIcon";
import RotatingCubeIcon from "../icons/header/RotatingCubeIcon";
import BarnFarmhouseIcon from "../icons/header/BarnFarmhouseIcon";
import WorkerIcon from "../icons/page/WorkerIcon";
import WorkerCapIcon from "../icons/header/WorkerCapIcon";
import WorkerIcon2 from "../icons/header/WorkerIcon";
import ToolsIcon from "../icons/page/ToolsIcon";
import UserSingleIcon from "../icons/page/UserSingleIcon";
import UserCircleIcon from "../icons/header/UserCircleIcon";
import WorkerCapStarIcon from "../icons/header/WorkerCapStarIcon";
import HandToolsIcon from "../icons/header/HandToolsIcon";
import PorductionBagIcon from "../icons/header/PorductionBagIcon";
import Factory2Icon from "../icons/header/Factory2Icon";
import MachineHandBoxIcon from "../icons/header/MachineHandBoxIcon";
import BoxSingleIcon from "../icons/header/BoxSingleIcon";
import TruckIcon from "../icons/header/TruckIcon";

import { RootState } from "@/src/redux/store";
import { useDispatch, useSelector } from "react-redux";
import { toggleMenu } from "@/src/utils/bottomBarUtils";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";
import { useAuth } from "@/src/context/AuthContext";
import { useAdmin } from "@/src/hooks/useAdmin";
import { useUnreadNotificationCount } from "@/src/hooks/useNotifications";
import HomeLightIcon from "../icons/bottom-bar/HomeLightIcon";
import LogoutIcon from "../icons/menu/LogoutIcon";
import { closeMenu } from "@/src/redux/slices/menusheet.slice";
import { clearAdmin } from "@/src/redux/slices/admin.slice";
import { useRouter } from "expo-router";
import { useAppCapabilities } from "@/src/hooks/useAppCapabilities";

type PageVariant =
  | "welcome"
  | "chamber"
  | "warehouse"
  | "user"
  | "contractor"
  | "purchase"
  | "packaging"
  | "order"
  | "production"
  | "searchResult"
  | "exportReports"
  | "default";

const getPageVariant = (page: string): PageVariant => {
  const trimmed = page.replace(/\s+/g, "");
  const lower = trimmed.toLowerCase();

  if (page === "Welcome") return "welcome";
  if (page === "Chamber" || trimmed === "ThirdPartyProduct") return "chamber";
  if (trimmed === "WarehouseManagement") return "warehouse";
  if (page.slice(0, page.length - 1) === "User") return "user";
  if (lower === "purchase") return "purchase";
  if (page === "Production") return "production";
  if (page === "Contractor" || page === "Labour") return "contractor";
  if (page === "Packaging" || page === "SKU" || page === "Package")
    return "packaging";
  if (page === "Order" || page === "Sales") return "order";
  if (lower === "searchresult") return "searchResult";
  return "default";
};

type BgIconConfig = {
  key: string;
  Component: React.ComponentType<any>;
  styleName: keyof typeof styles;
  extraProps?: any;
};

const BACKGROUND_CONFIG: Record<PageVariant, BgIconConfig[]> = {
  welcome: [
    { key: "fruit", Component: FruitBasketIcon, styleName: "backgroundImage4" },
    { key: "carrot", Component: CarrotIcon, styleName: "backgroundImage5" },
  ],
  chamber: [
    { key: "factory", Component: FactoryIcon, styleName: "backgroundImage6" },
    { key: "gears", Component: GearsIcon, styleName: "backgroundImage7" },
    { key: "boxes", Component: BoxIcon, styleName: "backgroundImage8" },
  ],
  warehouse: [
    {
      key: "warehouseBox",
      Component: WarehouseBoxesIcon,
      styleName: "backgroundImage6",
    },
    {
      key: "cube",
      Component: RotatingCubeIcon,
      styleName: "backgroundImage9",
    },
    {
      key: "barnFarm",
      Component: BarnFarmhouseIcon,
      styleName: "backgroundImage8",
    },
  ],
  packaging: [
    {
      key: "bag",
      Component: PorductionBagIcon,
      styleName: "backgroundImage17",
    },
    {
      key: "machine",
      Component: MachineHandBoxIcon,
      styleName: "backgroundImage18",
    },
    {
      key: "factory2",
      Component: Factory2Icon,
      styleName: "backgroundImage8",
    },
  ],
  searchResult: [
    { key: "box", Component: BoxIcon, styleName: "backgroundImage1" },
    {
      key: "machine",
      Component: MachineHandBoxIcon,
      styleName: "backgroundImage18",
    },
    {
      key: "factory2",
      Component: Factory2Icon,
      styleName: "backgroundImage8",
    },
  ],
  user: [
    { key: "worker", Component: WorkerIcon, styleName: "backgroundImage10" },
    { key: "cap", Component: WorkerCapIcon, styleName: "backgroundImage11" },
    {
      key: "userSingle",
      Component: UserSingleIcon,
      styleName: "backgroundImage12",
    },
    { key: "tools", Component: ToolsIcon, styleName: "backgroundImage13" },
  ],
  contractor: [
    { key: "worker2", Component: WorkerIcon2, styleName: "backgroundImage15" },
    {
      key: "capStar",
      Component: WorkerCapStarIcon,
      styleName: "backgroundImage11",
    },
    {
      key: "cap",
      Component: WorkerCapIcon,
      styleName: "backgroundImage16",
    },
    {
      key: "handTools",
      Component: HandToolsIcon,
      styleName: "backgroundImage13",
    },
  ],
  purchase: [
    {
      key: "fruit",
      Component: FruitBasketIcon,
      styleName: "backgroundImage6",
    },
    { key: "carrot", Component: CarrotIcon, styleName: "backgroundImage14" },
  ],
  order: [
    {
      key: "boxBig",
      Component: BoxIcon,
      styleName: "backgroundImage19",
      extraProps: { size: 40 },
    },
    {
      key: "boxSingle",
      Component: BoxSingleIcon,
      styleName: "backgroundImage20",
    },
    { key: "truck", Component: TruckIcon, styleName: "backgroundImage3" },
  ],
  production: [
    { key: "factory", Component: FactoryIcon, styleName: "backgroundImage6" },
    { key: "gears", Component: GearsIcon, styleName: "backgroundImage7" },
    { key: "boxes", Component: BoxIcon, styleName: "backgroundImage8" },
  ],
  exportReports: [
    { key: "factory", Component: FactoryIcon, styleName: "backgroundImage6" },
    { key: "gears", Component: GearsIcon, styleName: "backgroundImage7" },
    { key: "boxes", Component: BoxIcon, styleName: "backgroundImage8" },
  ],
  default: [
    { key: "windmill", Component: WindmillIcon, styleName: "backgroundImage1" },
    { key: "farmer", Component: FarmerIcon, styleName: "backgroundImage2" },
    { key: "barn", Component: BarnIcon, styleName: "backgroundImage3" },
  ],
};

const PageHeader = ({ page }: { page: string }) => {
  const { role } = useAuth();
  const caps = useAppCapabilities();

  const router = useRouter();
  const { logout } = useAuth();

  const admin = useAdmin();
  const { goTo } = useAppNavigation();
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);
  const variant = getPageVariant(page);
  const bgIcons = BACKGROUND_CONFIG[variant];
  const { total } = useUnreadNotificationCount(admin?.username);

  const notificationCount = total.toString();
  const badgeLabel =
    parseInt(notificationCount) > 99
      ? "99+"
      : notificationCount.toString().padStart(2, "0");

  const isWelcome = page === "Welcome";

  const handleLogout = async () => {
    dispatch(closeMenu());
    dispatch(clearAdmin());
    await logout();
    router.replace("/");
  };

  return (
    <View style={[styles.columnGap12, styles.pageHeader]}>
      {variant === "default" ? (
        <View style={StyleSheet.absoluteFill}>
          {bgIcons.map(({ key, Component, styleName, extraProps }) => (
            <Component key={key} style={styles[styleName]} {...extraProps} />
          ))}
        </View>
      ) : (
        bgIcons.map(({ key, Component, styleName, extraProps }) => (
          <Component key={key} style={styles[styleName]} {...extraProps} />
        ))
      )}

      <View style={styles.headerRow}>
        {role === "admin" ||
          (role === "superadmin" && (
            <Pressable
              style={styles.iconContainer}
              onPress={() => goTo("home")}
            >
              <HomeLightIcon size={24} />
              {parseInt(notificationCount) > 0 && (
                <View style={styles.badgeContainer}>
                  <B6 style={styles.badgeText}>{badgeLabel}</B6>
                </View>
              )}
            </Pressable>
          ))}

        <H1 color={getColor("light")} style={styles.headerText}>
          {page}
        </H1>

        {!isWelcome &&
          (caps.isSingleOperator ? (
            <Pressable onPress={handleLogout} style={styles.iconContainer}>
              <LogoutIcon size={24} color={getColor("light")} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => toggleMenu({ isOpen, dispatch })}
              style={styles.iconContainer}
            >
              <UserCircleIcon color={getColor("light")} />
            </Pressable>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageHeader: {
    padding: 16,
    backgroundColor: getColor("green"),
    overflow: "hidden",
  },
  columnGap12: {
    flexDirection: "column",
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 15,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
  },
  iconContainer: {
    paddingHorizontal: 4,
  },
  badgeContainer: {
    position: "absolute",
    top: -8,
    right: -4,
    backgroundColor: "red",
    minWidth: 18,
    height: 18,
    paddingHorizontal: 3,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
  },

  // your existing positions — unchanged:
  backgroundImage1: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage2: {
    position: "absolute",
    bottom: 0,
    left: "35%",
    width: "35%",
    height: "35%",
    zIndex: -1,
  },
  backgroundImage3: {
    position: "absolute",
    bottom: -10,
    right: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage4: {
    position: "absolute",
    top: 20,
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage5: {
    position: "absolute",
    bottom: -22,
    right: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage6: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage7: {
    position: "absolute",
    top: 0,
    left: "25%",
    width: "35%",
    height: "35%",
    zIndex: -1,
  },
  backgroundImage8: {
    position: "absolute",
    bottom: -5,
    right: 10,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage9: {
    position: "absolute",
    top: 0,
    left: "40%",
    width: "35%",
    height: "35%",
    zIndex: -1,
  },
  backgroundImage10: {
    position: "absolute",
    top: "50%",
    left: 8,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage11: {
    position: "absolute",
    top: 0,
    left: "35%",
    width: "35%",
    height: "35%",
    zIndex: -1,
  },
  backgroundImage12: {
    position: "absolute",
    top: "15%",
    right: "30%",
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage13: {
    position: "absolute",
    bottom: -14,
    right: 12,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage14: {
    position: "absolute",
    bottom: -30,
    right: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage15: {
    position: "absolute",
    top: "40%",
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage16: {
    position: "absolute",
    top: "70%",
    right: "30%",
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage17: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage18: {
    position: "absolute",
    top: "15%",
    left: "25%",
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage19: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
  backgroundImage20: {
    position: "absolute",
    bottom: -12,
    left: "55%",
    width: "40%",
    height: "40%",
    zIndex: -1,
  },
});

export default PageHeader;
