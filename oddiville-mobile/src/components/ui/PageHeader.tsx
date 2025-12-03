import React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { getColor } from "@/src/constants/colors"
import { H1 } from "../typography/Typography"
import WindmillIcon from "../icons/header/WindmillIcon"
import BarnIcon from "../icons/header/BarnIcon"
import FarmerIcon from "../icons/header/FarmerIcon"
import CarrotIcon from "../icons/header/CarrotIcon"
import FruitBasketIcon from "../icons/header/FruitBasketIcon"
import FactoryIcon from "../icons/header/FactoryIcon"
import GearsIcon from "../icons/header/GearsIcon"
import BoxIcon from "../icons/header/BoxesIcon"
import WarehouseBoxesIcon from "../icons/header/WarehouseBoxesIcon"
import RotatingCubeIcon from "../icons/header/RotatingCubeIcon"
import BarnFarmhouseIcon from "../icons/header/BarnFarmhouseIcon"
import WorkerIcon from "../icons/page/WorkerIcon"
import WorkerCapIcon from "../icons/header/WorkerCapIcon"
import WorkerIcon2 from "../icons/header/WorkerIcon"
import ToolsIcon from "../icons/page/ToolsIcon"
import UserSingleIcon from "../icons/page/UserSingleIcon"
import UserCircleIcon from "../icons/header/UserCircleIcon"
import { RootState } from "@/src/redux/store"
import { useDispatch, useSelector } from "react-redux"
import { toggleMenu } from "@/src/utils/bottomBarUtils";
import WorkerCapStarIcon from "../icons/header/WorkerCapStarIcon"
import HandToolsIcon from "../icons/header/HandToolsIcon"
import PorductionBagIcon from "../icons/header/PorductionBagIcon"
import Factory2Icon from "../icons/header/Factory2Icon"
import MachineHandBoxIcon from "../icons/header/MachineHandBoxIcon"
import BoxSingleIcon from "../icons/header/BoxSingleIcon"
import TruckIcon from "../icons/header/TruckIcon"

const PageHeader = ({ page }: { page: string }) => {

  const dispatch = useDispatch()
  const isOpen = useSelector((state: RootState) => state.menu.isOpen);

  const isWelcome = page === "Welcome"
  const isChamber = page === "Chamber" || page.replace(/\s+/g, "") === "ThirdPartyProduct"
  const isWarehouseManagement = page.replace(/\s+/g, "") === "WarehouseManagement"
  const isUser = page.slice(0, page.split("")?.length - 1) === "User"
  const isPurchase = page.replace(/\s+/g, "").toLowerCase() === "purchase";
  const isProduction = page === "Production";
  const isContractor = page === "Contractor" || page === "Labour";
  const isPackaging = page === "Packaging" || page === "SKU";
  const isOrder = page === "Order";
  const isSearchResult = page.replace(/\s+/g, "").toLowerCase() === "searchresult";

  return (
    <View style={[styles.columnGap12, styles.pageHeader]}>
      {/* Background SVGs */}
      {isWelcome ? (
        <>
          <FruitBasketIcon style={styles.backgroundImage4} />
          <CarrotIcon style={styles.backgroundImage5} />
        </>
      ) : isChamber ? (
        <>
          <FactoryIcon style={styles.backgroundImage6} />
          <GearsIcon style={styles.backgroundImage7} />
          <BoxIcon style={styles.backgroundImage8} />
        </>
      ) : isWarehouseManagement ? (
        <>
          <WarehouseBoxesIcon style={styles.backgroundImage6} />
          <RotatingCubeIcon style={styles.backgroundImage9} />
          <BarnFarmhouseIcon style={styles.backgroundImage8} />
        </>
      ) : isPackaging ? (
        <>
          <PorductionBagIcon style={styles.backgroundImage17} />
          <MachineHandBoxIcon style={styles.backgroundImage18} />
          <Factory2Icon style={styles.backgroundImage8} />
        </>
      ) : isSearchResult ? (
        <>
          <BoxIcon style={styles.backgroundImage1} />
          <MachineHandBoxIcon style={styles.backgroundImage18} />
          <Factory2Icon style={styles.backgroundImage8} />
        </>
      ) : isUser ? (
        <>
          <WorkerIcon style={styles.backgroundImage10} />
          <WorkerCapIcon style={styles.backgroundImage11} />
          <UserSingleIcon style={styles.backgroundImage12} />
          <ToolsIcon style={styles.backgroundImage13} />
        </>
      ) : isContractor ? (
        <>
          <WorkerIcon2 style={styles.backgroundImage15} />
          <WorkerCapStarIcon style={styles.backgroundImage11} />
          <WorkerCapIcon style={styles.backgroundImage16} />
          <HandToolsIcon style={styles.backgroundImage13} />
        </>
      ) : isPurchase ? (
        <>
          <FruitBasketIcon style={styles.backgroundImage6} />
          <CarrotIcon style={styles.backgroundImage14} />
        </>
      ) : isOrder ? (
        <>
          <BoxIcon style={styles.backgroundImage19} size={40} />
          <BoxSingleIcon style={styles.backgroundImage20} />
          <TruckIcon style={styles.backgroundImage3} />
        </>
      ) : isProduction ? (
        <>
          <FactoryIcon style={styles.backgroundImage6} />
          <GearsIcon style={styles.backgroundImage7} />
          <BoxIcon style={styles.backgroundImage8} />
        </>
      ) : (
        <View style={StyleSheet.absoluteFill}>
          <WindmillIcon style={styles.backgroundImage1} />
          <FarmerIcon style={styles.backgroundImage2} />
          <BarnIcon style={styles.backgroundImage3} />
        </View>
      )}

      {/* Centered Text and Icon */}
      <View style={styles.headerRow}>
        <H1 color={getColor("light", 500)} style={styles.headerText}>
          {page}
        </H1>
        
        <Pressable onPress={() => toggleMenu({ isOpen, dispatch })} style={styles.userIconContainer}>
          <UserCircleIcon />
        </Pressable>
      </View>
    </View>
  )
}

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
    position: "relative",
    alignItems: "center", 
    justifyContent: "center",
    width: "100%",
    zIndex: 15,
  },
  headerText: {
    textAlign: "center",
  },
  userIconContainer: {
    position: "absolute",
    right: 0,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  backgroundImage1: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1
  },
  backgroundImage2: {
    position: "absolute",
    bottom: 0,
    left: "35%",
    width: "35%",
    height: "35%",
    zIndex: -1
  },
  backgroundImage3: {
    position: "absolute",
    bottom: -10,
    right: 0,
    width: "40%",
    height: "40%",
    zIndex: -1
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
    zIndex: -1
  },
  backgroundImage15: {
    position: "absolute",
    top: "40%",
    left: 0,
    width: "40%",
    height: "40%",
    zIndex: -1
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
    zIndex: -1
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
})
export default PageHeader
