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
import { safeNumber, toKg } from "@/src/utils/chamberstock/stockUtils";

const getLeadingIcon = (size: number, unit: string) =>
  mapPackageIcon({
    size,
    unit: unit as "kg" | "gm" | "unit",
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

  const safeMaterialPackaging = materialPackaging as Packaging;

  const materialIcon = materialPackaging
    ? mapPackageIcon({
      size: safeMaterialPackaging.size.value,
      unit: safeMaterialPackaging.size.unit as "kg" | "gm" | "unit",
    })
    : BoxIcon;

  const chamberRows =
    stock.category === "material"
      ? stock.chamber.filter(
        ch => ch.id === chamberId && ch.rating === currentChamber.rating
      )
      : [];

  const normalizeToKg = (qty: number) => {
    return safeNumber(qty);
  };

  const chamberKg = chamberRows.reduce((sum, ch) => {
    return sum + normalizeToKg(Number(ch.quantity));
  }, 0);


  const bagSizeKg = toKg(
    safeMaterialPackaging.size.value,
    safeMaterialPackaging.size.unit as "kg" | "gm"
  );

  const chamberBags =
    bagSizeKg > 0 ? Math.floor(chamberKg / bagSizeKg) : 0;

    // -----------------------Packed--------------------------
  const packedRows =
    stock.category === "packed"
      ? stock.chamber.filter(ch => ch.id === chamberId)
      : [];
      
  const packedChamberKg = packedRows.reduce((sum, ch) => {
    return sum + safeNumber(ch.quantity); // already KG
  }, 0);

  const packedPackaging =
    stock.category === "packed" && Array.isArray(stock.packaging)
      ? stock.packaging
      : [];

  const packedByChamber = packedPackaging.map(pkg => {
    const sizeKg = toKg(pkg.size.value, pkg.size.unit as "kg" | "gm");

    const packetsInChamber =
      sizeKg > 0 ? Math.floor(packedChamberKg / sizeKg) : 0;

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
