import React, { useState } from "react";
import { StyleSheet, View, RefreshControl, ScrollView } from "react-native";
import { useSelector } from "react-redux";

import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import ChamberCard from "@/src/components/ui/ChamberCard";
import EmptyState from "@/src/components/ui/EmptyState";

import { getColor } from "@/src/constants/colors";
import { useParams } from "@/src/hooks/useParams";
import { Packaging, useChamberStockByName } from "@/src/hooks/useChamberStock";
import { useChamberByName } from "@/src/hooks/useChambers";

import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";

import BoxIcon from "@/src/components/icons/common/BoxIcon";
import StarIcon from "@/src/components/icons/page/StarIcon";
import { B4 } from "@/src/components/typography/Typography";

import { RootState } from "@/src/redux/store";

const getLeadingIcon = (size: number, unit: string) =>
  mapPackageIcon({
    size,
    unit: unit as "kg" | "gm" | "qn",
  });

const StockDetail = () => {
  const { product_name } = useParams("stock-detail", "product_name");
  const [searchValue, setSearchValue] = useState("");

  const { chamber: selectedChamber } = useSelector(
    (state: RootState) => state.chamber
  );
  const { data: chamberData } = useChamberByName(selectedChamber);
  const chamberId = chamberData?.id ?? null;

  const { chamberStock, refetch, isFetching } = useChamberStockByName([
    product_name ?? "",
  ]);

  const stock = chamberStock?.[0];
  const emptyStateData = getEmptyStateData("no-stock-detail");

  if (!stock) {
    return (
      <View style={styles.center}>
        <EmptyState stateData={emptyStateData} />
      </View>
    );
  }

  const currentChamber = stock.chamber.find((ch) => ch.id === chamberId);

  if (!currentChamber) {
    return (
      <View style={styles.center}>
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

  if (stock.category === "material" && !materialPackaging) {
    return (
      <View style={styles.center}>
        <EmptyState stateData={emptyStateData} />
      </View>
    );
  }

  const materialIcon = materialPackaging
    ? mapPackageIcon({
        size: materialPackaging.size.value,
        unit: materialPackaging.size.unit as "kg" | "gm" | "qn",
      })
    : BoxIcon;

  const safeMaterialPackaging = materialPackaging as Packaging;
  // const chamberKg = Number(currentChamber.quantity) / 1000;
  const totalKgForRating = materialByRating[currentChamber.rating] ?? 0;

  const chamberKg = Number(currentChamber.quantity);

  const chamberBags =
    totalKgForRating > 0
      ? Math.round((chamberKg / totalKgForRating) * safeMaterialPackaging.count)
      : 0;

  const packedPackaging =
    stock.category === "packed" && Array.isArray(stock.packaging)
      ? stock.packaging
      : [];

  const packedByChamber = packedPackaging.map((pkg) => {
    const sizeKg =
      pkg.size.unit === "gm" ? pkg.size.value / 1000 : pkg.size.value;

    const packetsInChamber = Math.floor(chamberKg / sizeKg);

    return {
      ...pkg,
      packetsInChamber,
      totalKg: packetsInChamber * sizeKg,
    };
  });

  return (
    <View style={styles.rootContainer}>
      <PageHeader page="Chamber" />

      <View style={styles.wrapper}>
        <View style={styles.paddingTLR16}>
          <BackButton label="Chambers" backRoute="chambers" />
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
            {/* MATERIAL */}
            {materialPackaging && (
              <View style={{ gap: 8, marginBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
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
                  leadingIcon={materialIcon}
                />
              </View>
            )}

            {/* PACKED */}
            {stock.category === "packed" && packedPackaging.length > 0 && (
              <View style={{ gap: 12 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <StarIcon color={getColor("green", 700)} size={16} />
                  <B4 style={{ fontWeight: "700" }}>
                    Rating: {currentChamber.rating}
                  </B4>
                </View>

                {packedByChamber.map((pkg, index) => (
                  <ChamberCard
                    key={`${stock.id}-${pkg.size.value}-${index}`}
                    id={`${stock.id}-${pkg.size.value}`}
                    name={`${pkg.size.value} ${pkg.size.unit}`}
                    category="packed"
                    description={`${pkg.packetsInChamber} pouches | ${pkg.totalKg} kg`}
                    plainDescription
                    onPressOverride={() => {}}
                    leadingIcon={getLeadingIcon(pkg.size.value, pkg.size.unit)}
                  />
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default StockDetail;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  paddingTLR16: {
    paddingTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  flexGrow: {
    gap: 16,
  },
  searchinputWrapper: {
    height: 44,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
