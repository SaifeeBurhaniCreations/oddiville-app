import React, { useState } from "react";
import {
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";

import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import ChamberCard from "@/src/components/ui/ChamberCard";
import EmptyState from "@/src/components/ui/EmptyState";

import { getColor } from "@/src/constants/colors";
import { useParams } from "@/src/hooks/useParams";
import {
  ChamberStock,
  Packaging,
  useChamberStockByName,
} from "@/src/hooks/useChamberStock";
import { useChamberByName } from "@/src/hooks/useChambers";

import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";

import BoxIcon from "@/src/components/icons/common/BoxIcon";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import StarIcon from "@/src/components/icons/page/StarIcon";
import { B4 } from "@/src/components/typography/Typography";

import { RootState } from "@/src/redux/store";

const getPackedLeadingIcon = (item: {
  size: { value: number; unit: string };
  count: number;
}) => {
  return mapPackageIcon({
    size: item.size.value,
    unit: item.size.unit as "kg" | "gm" | "qn",
    quantity: item.count.toString(),
    rawSize: `${item.size.value} ${item.size.unit}`,
  });
};

const StockDetail = () => {
  const { product_name } = useParams("stock-detail", "product_name");
  const [searchValue, setSearchValue] = useState("");

  const { chamber: selectedChamber } = useSelector(
    (state: RootState) => state.chamber
  );

  const { data: chamberData } = useChamberByName(selectedChamber);
  const chamberId = chamberData?.id ?? null;

  console.log("chamberId", chamberId);

  const { chamberStock, refetch, isFetching } = useChamberStockByName([
    product_name ?? "",
  ]);

  const stock = chamberStock?.[0];
  const emptyStateData = getEmptyStateData("no-stock-detail");

  if (!stock) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <EmptyState stateData={emptyStateData} />
      </View>
    );
  }

  const currentChamber = stock.chamber.find(
  (ch) => ch.id === chamberId
);

  if (!currentChamber) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <EmptyState stateData={emptyStateData} />
      </View>
    );
  }

  const materialByRating =
    stock.category === "material"
      ? stock.chamber.reduce((acc, ch) => {
          const rating = ch.rating;
          const qtyKg = Number(ch.quantity) / 1000;

          if (!acc[rating]) acc[rating] = 0;
          acc[rating] += qtyKg;

          return acc;
        }, {} as Record<string, number>)
      : {};

  const materialPackaging =
    stock.category === "material" && !Array.isArray(stock.packaging)
      ? stock.packaging
      : null;

  const LeadingIcon = materialPackaging
    ? mapPackageIcon({
        size: materialPackaging.size.value,
        unit: materialPackaging.size.unit as "kg" | "gm" | "qn",
        quantity: materialPackaging.count.toString(),
        rawSize: materialPackaging.size.value.toString(),
      })
    : BoxIcon;

  const packedMaterialPackaging =
    stock.category === "packed" && Array.isArray(stock.packaging)
      ? stock.packaging
      : [];

      if (stock.category === "material" && !materialPackaging) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <EmptyState stateData={emptyStateData} />
    </View>
  );
}
const safeMaterialPackaging = materialPackaging as Packaging;

const chamberKg = Number(currentChamber.quantity) / 1000;
const rating = currentChamber.rating;
const totalKgForRating = materialByRating[rating] ?? 0;

const chamberBags =
  totalKgForRating > 0
    ? Math.round(
        (chamberKg / totalKgForRating) * safeMaterialPackaging.count
      )
    : 0;

  return (
    <View style={styles.rootContainer}>
      <PageHeader page={"Chamber"} />

      <View style={styles.wrapper}>
        <View style={styles.paddingTLR16}>
          <BackButton label="Chambers" backRoute={"chambers"} />
        </View>

        <View style={styles.flexGrow}>
          <View style={styles.searchinputWrapper}>
            <SearchWithFilter
              placeholder="Search by material name"
              value={searchValue}
              cross
              onSubmitEditing={() => {}}
              onChangeText={setSearchValue}
              onClear={() => setSearchValue("")}
            />
          </View>

          <ScrollView
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
          >
     {materialPackaging && currentChamber && (
  <View style={{ gap: 8, marginBottom: 16 }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <StarIcon color={getColor("green", 700)} size={16} />
      <B4 style={{ fontWeight: "700" }}>
        Rating: {currentChamber.rating}
      </B4>
    </View>

    <ChamberCard
      id={currentChamber.id}
      name={`${chamberBags} ${materialPackaging.type}`}
      category="material"
      description={`${chamberKg} kg`}
      plainDescription
      onPressOverride={() => {}}
      leadingIcon={LeadingIcon}
    />
  </View>
)}
          </ScrollView>

          {/* PACKED */}
          {stock.category === "packed" && (
            <View style={{ gap: 12 }}>
              {packedMaterialPackaging.map((item, index) => {
                const leadingIcon = getPackedLeadingIcon(item);

                return (
                  <ChamberCard
                    key={`${stock.id}-${item.size.value}-${index}`}
                    id={`${stock.id}-${item.size.value}`}
                    name={`${item.size.value} ${item.size.unit}`}
                    category="packed"
                    description={`${item.count} | ${item.type}`}
                    plainDescription
                    onPressOverride={() => {}}
                    leadingIcon={leadingIcon}
                  />
                );
              })}
            </View>
          )}

          {!stock.packaging && (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <EmptyState stateData={emptyStateData} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default StockDetail;

const styles = StyleSheet.create({
  flexGrow: {
    gap: 16,
  },
  searchinputWrapper: {
    height: 44,
  },
  cardContainerV2: {
    gap: 12,
    paddingBottom: 20,
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
  rootContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "column",
    gap: 16,
  },
  paddingTLR16: {
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
});