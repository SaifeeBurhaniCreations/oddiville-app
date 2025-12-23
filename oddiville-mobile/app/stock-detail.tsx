import { StyleSheet, View, RefreshControl, ScrollView, FlatList } from "react-native";
import React, { useState } from "react";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import { getColor } from "@/src/constants/colors";
import { useParams } from "@/src/hooks/useParams";
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { ChamberStock, useChamberStockByName } from "@/src/hooks/useChamberStock";
import ChamberCard from "@/src/components/ui/ChamberCard";
import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";
import EmptyState from "@/src/components/ui/EmptyState";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import BoxIcon from "@/src/components/icons/common/BoxIcon";
import { B4 } from "@/src/components/typography/Typography";
import StarIcon from "@/src/components/icons/page/StarIcon";

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
    const { product_name } = useParams("stock-detail", "product_name")

      const [searchValue, setSearchValue] = useState("");
    
const { chamberStock, refetch, isFetching } = useChamberStockByName([product_name ?? ""]);

      // console.log("chamberStock", JSON.stringify(chamberStock, null, 2));
    const stock = chamberStock?.[0];
// const stock =  {
//         "id": "a8604231-ad46-47bf-83f2-74e4046fa532",
//         "product_name": "Frozen Peas",
//         "image": "https://c1e1fba659f7.ngrok-free.app/chamber-stock/packed-item/packaging.png",
//         "category": "packed",
//         "unit": "kg",
//         "packaging": [
//             {
//                 "size": {
//                     "value": 500,
//                     "unit": "gm"
//                 },
//                 "type": "pouch",
//                 "count": 600
//             },
//             {
//                 "size": {
//                     "value": 1,
//                     "unit": "kg"
//                 },
//                 "type": "pouch",
//                 "count": 300
//             }
//         ],
//         "chamber": [
//             {
//                 "id": "8cd93b32-b694-4c5d-b541-0034152010bc",
//                 "quantity": "600",
//                 "rating": "5"
//             }
//         ],
//         "packages": [
//             {
//                 "size": "500",
//                 "unit": "gm",
//                 "rawSize": "500 gm",
//                 "quantity": "600",
//                 "dry_item_id": "73611ea9-4fd3-43bd-a851-607704c537a2"
//             },
//             {
//                 "size": "1",
//                 "unit": "kg",
//                 "rawSize": "1 kg",
//                 "quantity": "600",
//                 "dry_item_id": "2381d1af-4fd3-43bd-a851-607704c537a2"
//             }
//         ],
//         "createdAt": "2025-12-23T13:33:13.554Z",
//         "updatedAt": "2025-12-23T13:33:13.554Z"
//     } as ChamberStock

    const emptyStateData = getEmptyStateData("no-stock-detail");

    if (!stock) return <EmptyState stateData={emptyStateData} />;
    
  const materialByRating =
  stock?.category === "material" &&
  !Array.isArray(stock.packaging)
    ? stock.chamber.reduce((acc, ch) => {
        const rating = ch.rating;
        const qty = Number(ch.quantity);

        if (!acc[rating]) acc[rating] = 0;
        acc[rating] += qty;

        return acc;
      }, {} as Record<string, number>)
    : {};

    const materialPackaging =
  stock.category === "material" && !Array.isArray(stock.packaging)
    ? stock.packaging
    : null;

const LeadingIcon =
  materialPackaging
    ? mapPackageIcon({
        size: materialPackaging.size.value,
        unit: materialPackaging.size.unit as "kg" | "gm" | "qn",
        quantity: materialPackaging.count.toString(),
        rawSize: materialPackaging.size.value.toString(),
      })
    : BoxIcon;

       const packedMaterialPackaging = stock?.category === "packed" && Array.isArray(stock.packaging)
    ? stock.packaging
    : [];

  return (
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
        <ScrollView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}>
        {materialPackaging &&
  Object.entries(materialByRating).map(([rating, quantity]) => {
    const bagSize = materialPackaging.size.value; // 30
    const bagUnit = materialPackaging.size.unit;  // kg
    const bagCount = quantity / bagSize;

    return (
      <View key={`rating-${rating}`} style={{ gap: 8, marginBottom: 16 }}>
      <View style={{ gap: 4 }}>

        <View style={{ gap: 4, flexDirection: "row", alignItems: "center" }}>
          <StarIcon color={getColor("green", 700)} size={16}/>
        <B4 style={{ fontWeight: "700" }}>
          Rating: {rating}
        </B4>
        </View>

        <ChamberCard
          id={`${stock.id}-${rating}`}
          name={`${Math.floor(bagCount)} ${materialPackaging.type}`}
          category="material"
          description={`${bagSize} ${bagUnit}`}
          plainDescription
          onPressOverride={() => {}}
          leadingIcon={LeadingIcon}
        />
      </View>
      </View>
    );
  })}
        </ScrollView>

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

        {!stock.packaging && <EmptyState stateData={emptyStateData} />}

      </View>
   </View>
        </View>
  )
}

export default StockDetail


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
