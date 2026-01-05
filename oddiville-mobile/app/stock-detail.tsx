import {
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
  FlatList,
} from "react-native";
import {
  StyleSheet,
  View,
  RefreshControl,
  ScrollView,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import { getColor } from "@/src/constants/colors";
import { useParams } from "@/src/hooks/useParams";
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import {
  ChamberStock,
  useChamberStockByName,
} from "@/src/hooks/useChamberStock";
import {
  ChamberStock,
  useChamberStockByName,
} from "@/src/hooks/useChamberStock";
import ChamberCard from "@/src/components/ui/ChamberCard";
import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";
import EmptyState from "@/src/components/ui/EmptyState";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import { B4 } from "@/src/components/typography/Typography";
import StarIcon from "@/src/components/icons/page/StarIcon";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { useChamberByName } from "@/src/hooks/useChambers";
import { useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { useChamberByName } from "@/src/hooks/useChambers";

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
  const emptyStateData = getEmptyStateData("no-stock-detail");

  if (!stock) return <EmptyState stateData={emptyStateData} />;

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
  const materialPackaging =
    stock.category === "material" && !Array.isArray(stock.packaging)
      ? stock.packaging
      : null;

  const LeadingIcon = materialPackaging
  const LeadingIcon = materialPackaging
    ? mapPackageIcon({
        size: materialPackaging.size.value,
        unit: materialPackaging.size.unit as "kg" | "gm" | "qn",
        quantity: materialPackaging.count.toString(),
        rawSize: materialPackaging.size.value.toString(),
      })
    : BoxIcon;

  const packedMaterialPackaging =
    stock?.category === "packed" && Array.isArray(stock.packaging)
      ? stock.packaging
      : [];
  const packedMaterialPackaging =
    stock?.category === "packed" && Array.isArray(stock.packaging)
      ? stock.packaging
      : [];

  return (
    <View style={styles.rootContainer}>
    <View style={styles.rootContainer}>
      <PageHeader page={"Chamber"} />
      <View style={styles.wrapper}>
        <View style={[styles.paddingTLR16]}>
          <BackButton label="Chambers" backRoute={"chambers"} />
        </View>
        <View style={styles.flexGrow}>
          <View style={styles.searchinputWrapper}>
            <SearchWithFilter
              placeholder={"Search by material name"}
              value={searchValue}
              cross={true}
              onSubmitEditing={() => {}}
              onChangeText={(text) => setSearchValue(text)}
              onClear={() => setSearchValue("")}
            />
          </View>
          <ScrollView
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
          >
            {materialPackaging &&
              Object.entries(materialByRating).map(([rating, totalKg]) => {
                return stock.chamber
                  .filter((ch) => ch.rating === rating)
                  .map((ch) => {
                    const chamberKg = Number(ch.quantity) / 1000;
console.log("chamberKg", chamberKg);
console.log("totalKg", totalKg);
console.log("materialPackaging.count", materialPackaging.count);

                    const chamberBags = Math.round(
                      (chamberKg / totalKg) * materialPackaging.count
                    );

                    return (
                      <View key={ch.id} style={{ gap: 8, marginBottom: 16 }}>
                        <ChamberCard
                          id={ch.id}
                          name={`${chamberBags} ${materialPackaging.type}`}
                          category="material"
                          description={`${chamberKg} kg`}
                          plainDescription
                          onPressOverride={() => {}}
                          leadingIcon={LeadingIcon}
                        />
                      </View>
                    );
                  });
              })}
          </ScrollView>

          {/* PACKED */}
          {stock.category === "packed" && Array.isArray(stock.packaging) && (
            <View style={{ gap: 12 }}>
              {packedMaterialPackaging.map((item, index) => {
                const leadingIcon = getPackedLeadingIcon(item);
          {/* PACKED */}
          {stock.category === "packed" && Array.isArray(stock.packaging) && (
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

          {!stock.packaging && <EmptyState stateData={emptyStateData} />}
        </View>
          {!stock.packaging && <EmptyState stateData={emptyStateData} />}
        </View>
      </View>
    </View>
  );
};
    </View>
  );
};

export default StockDetail;
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
