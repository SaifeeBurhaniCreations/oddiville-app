import React, { useMemo, useState } from "react";
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
import { usePackedItems } from "@/src/hooks/packing/getPackedItemsEvent";

import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";

import StarIcon from "@/src/components/icons/page/StarIcon";
import { B4 } from "@/src/components/typography/Typography";

import { RootState } from "@/src/redux/store";
import { safeNumber, toKg } from "@/src/utils/chamberstock/stockUtils";
import Require from "@/src/components/authentication/Require";
import ChamberIcon from "@/src/components/icons/common/ChamberIcon";

const StockDetail = () => {
  const { product_name } = useParams("stock-detail", "product_name");
  const [searchValue, setSearchValue] = useState("");

  const { chamber: selectedChamber } = useSelector(
    (state: RootState) => state.chamber,
  );
  const { data: chamberData } = useChamberByName(selectedChamber);
  const chamberId = chamberData?.id;

  const { chamberStock, refetch, isFetching } = useChamberStockByName([
    product_name ?? "",
  ]);

  const { data: packedItems, isLoading: packedLoading } = usePackedItems();

  const emptyStateData = getEmptyStateData("no-stock-detail");

  /* MATERIAL */
  const materialBlock = useMemo(() => {
    if (!chamberStock || !chamberId) return null;

    const materialStocks = chamberStock.filter((s) => s.category === "material");

    const blocks = materialStocks
      .map((stock) => {
        const chamberEntry = stock.chamber?.find((ch) => ch.id === chamberId);
        if (!chamberEntry) return null;

        const packaging = stock.packaging as Packaging;
        if (!packaging) return null;

        const chamberKg = safeNumber(Number(chamberEntry.quantity));

        const bagSizeKg = toKg(
          packaging.size.value,
          packaging.size.unit as "kg" | "gm",
        );

        const chamberBags = bagSizeKg > 0 ? Math.floor(chamberKg / bagSizeKg) : 0;
const looseKg = bagSizeKg > 0 ? +(chamberKg % bagSizeKg).toFixed(2) : 0;

        const materialIcon = mapPackageIcon({
          size: packaging.size.value,
          unit: packaging.size.unit as any,
        });

        return (
          <View key={stock.id} style={{ gap: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <StarIcon color={getColor("green", 700)} size={16} />
              <B4 style={{ fontWeight: "700" }}>Rating: {stock.rating}</B4>
            </View>

            <ChamberCard
              id={stock.id}
              name={`${chamberBags} ${packaging.type}${looseKg ? ` (+ ${looseKg} kg)` : ""}`}
              category="material"
              description={`${chamberKg} kg`}
              plainDescription
              onPressOverride={() => {}}
              leadingIcon={materialIcon}
            />
          </View>
        );
      })
      .filter(Boolean);

    return blocks.length ? <View style={{ gap: 12 }}>{blocks}</View> : null;
  }, [chamberStock, chamberId]);

  /* PACKED (event based) */
  const packedBlock = useMemo(() => {
    if (!packedItems || !product_name || !chamberId) return null;

    const items = packedItems
      .filter((item) => item.product_name === product_name)
      .flatMap((item) =>
        item.storage
          .filter((s) => s.chamberId === chamberId)
          .map((s) => {
            const packetKg = item.packet.unit === "gm" ? item.packet.size / 1000 : item.packet.size;
            const totalPackets = s.bagsStored * item.packet.packetsPerBag;

            return {
              key: `${item.id}-${item.skuId}-${s.chamberId}`,
              sizeLabel: item.skuLabel,
              bags: s.bagsStored,
              packets: totalPackets,
              totalKg: totalPackets * packetKg,
              icon: mapPackageIcon({ size: item.packet.size, unit: item.packet.unit }),
            };
          }),
      );

    if (!items.length) return null;

    return (
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <ChamberIcon color={getColor("green", 700)} size={16} />
          <B4 style={{ fontWeight: "700" }}>Packed in this chamber</B4>
        </View>

        {items.map((pkg) => (
          <ChamberCard
            key={pkg.key}
            id={pkg.key}
            name={pkg.sizeLabel}
            category="packed"
            description={`${pkg.bags} bags | ${pkg.packets} packs | ${pkg.totalKg} kg`}
            plainDescription
            onPressOverride={() => {}}
            leadingIcon={pkg.icon}
          />
        ))}
      </View>
    );
  }, [packedItems, product_name, chamberId]);

  if (!chamberId) {
    return (
      <View style={styles.center}>
        <EmptyState stateData={emptyStateData} />
      </View>
    );
  }

  return (
    <Require anyOf={["production", "package", "sales"]}>
      <View style={styles.rootContainer}>
        <PageHeader page="Chamber" />

        <View style={styles.wrapper}>
          <View style={styles.paddingTLR16}>
            <BackButton label="Chambers" backRoute="chambers" />
          </View>

          <View style={styles.flexGrow}>
            <View style={styles.searchinputWrapper}>
              <SearchWithFilter
                placeholder="Search by product name"
                value={searchValue}
                cross
                onChangeText={setSearchValue}
                onClear={() => setSearchValue("")}
              />
            </View>

            <ScrollView
              refreshControl={
                <RefreshControl refreshing={isFetching || packedLoading} onRefresh={refetch} />
              }
            >
              {materialBlock}
              {packedBlock}

              {!materialBlock && !packedBlock && <EmptyState stateData={emptyStateData} />}
            </ScrollView>
          </View>
        </View>
      </View>
    </Require>
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