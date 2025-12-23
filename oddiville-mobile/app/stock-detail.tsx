import { StyleSheet, View, RefreshControl, ScrollView, FlatList } from "react-native";
import React, { useState } from "react";
import SearchWithFilter from "@/src/components/ui/Inputs/SearchWithFilter";
import { getColor } from "@/src/constants/colors";
import { useParams } from "@/src/hooks/useParams";
import PageHeader from "@/src/components/ui/PageHeader";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { useChamberStockByName } from "@/src/hooks/useChamberStock";
import ChamberCard from "@/src/components/ui/ChamberCard";
import { getEmptyStateData, mapPackageIcon } from "@/src/utils/common";
import EmptyState from "@/src/components/ui/EmptyState";
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import BoxIcon from "@/src/components/icons/common/BoxIcon";

const StockDetail = () => {
    const { product_name } = useParams("stock-detail", "product_name")

      const [searchValue, setSearchValue] = useState("");
    
const { chamberStock, refetch, isFetching } = useChamberStockByName([product_name ?? ""]);

      console.log("chamberStock", JSON.stringify(chamberStock, null, 2));
    const stock = chamberStock?.[0];

    const emptyStateData = getEmptyStateData("no-stock-detail");

    if (!stock) return <EmptyState stateData={emptyStateData} />;
    
const LeadingIcon =
  stock.category === "material" && !Array.isArray(stock.packaging)
    ? mapPackageIcon({
        size: stock.packaging.size.value,
        unit: stock.packaging.size.unit as "kg" | "gm" | "qn",
        quantity: stock.packaging.count.toString(),
        rawSize: stock.packaging.size.value.toString(),
      })
    : BoxIcon;
// const LeadingIcon =
//   stock.category === "material" && !Array.isArray(stock.packaging)
//     ? mapPackageIcon({
//         size: stock.packaging.size.value,
//         unit: stock.packaging.size.unit as "kg" | "gm" | "qn",
//         quantity: stock.packaging.count.toString(),
//         rawSize: stock.packaging.size.value.toString(),
//       })
//     : BoxIcon; 

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
            {stock.category === "material" && !Array.isArray(stock.packaging) && (
                <ChamberCard id={`${stock.id}-${stock.packaging.size.value}`} name={`${stock.packaging.size.value.toString()} ${stock.packaging.size.unit}`}  category={"material"} description={`${stock.packaging.count.toString()} | ${stock.packaging.type}`} plainDescription onPressOverride={() => {}} leadingIcon={LeadingIcon} />
            )}
        </ScrollView>

        {/* PACKED */}
        {stock.category === "packed" && Array.isArray(stock.packaging) && (
            <FlatList
          data={stock.packaging}
          keyExtractor={(item, index) =>
            item?.size?.value ? item.size.value.toString() : `${item.size.value}-${index}`
          }
          renderItem={({ item }) => <ChamberCard id={`${stock.id}-${item.size.value}`} name={`${item.size.value.toString()} ${item.size.unit}`}  category={"packed"} rating={item.count.toString()} onPressOverride={() => {}} leadingIcon={LeadingIcon} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.cardContainerV2}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={refetch}
              colors={[getColor("green")]}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center" }}>
              <EmptyState stateData={emptyStateData} />
            </View>
          }
        /> 
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
