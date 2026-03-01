import { StyleSheet, View } from "react-native";
import { ProductListComponentProps } from "@/src/types";
import { B3, B4, C1, H3 } from "../../typography/Typography";
import { getColor } from "@/src/constants/colors";
// import CustomSwitch from '../Switch';
import React, { useState } from "react";
// import DispatchProductList from '../DispatchProductList';
import BoxIcon from "../../icons/common/BoxIcon";
import CustomImage from "../CustomImage";
import ChipGroup from "../ChipGroup";
import { mapPackageIcon } from "@/src/utils/common";
import { isPackageUnit } from "@/src/utils/packageUtil";

const ProductListComponent = ({ data }: ProductListComponentProps) => {
  const [isChecked, setIsChecked] = useState(data.detailView.isDetailView);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <B3
          color={getColor("yellow", 700)}
          style={{ textTransform: "uppercase" }}
        >
          {data.label}
        </B3>

        {/* <CustomSwitch setIsChecked={setIsChecked} isChecked={isChecked} post>
                    {data.detailView.text}
                </CustomSwitch> */}
      </View>
      <View style={styles.column}>
        {data?.products?.map((product, index) => {

          return (
            <View style={styles.card} key={index}>
              <View style={[styles.gapedRow8, isChecked && styles.separator]}>
                {typeof product?.image === "string" &&
                product.image.includes("http") ? (
                  <CustomImage
                    src={product.image}
                    width={32}
                    height={32}
                    borderRadius={8}
                  />
                ) : (
                  <BoxIcon size={32} />
                )}

                <View style={styles.cardBody}>
                  <View>
                    <View style={styles.row}>
                      <H3>{product?.title}</H3>

                      <View style={styles.gapedRow}>
                        <B4>{product?.weight}</B4>
                        {/* <B4>{product?.price}</B4> */}
                      </View>
                    </View>

                    {product?.description && <C1 color={getColor("green", 400)}>
                      {product?.description}
                    </C1>}
                    
                  </View>

                  {/* {product?.packagesSentence && <C1 color={getColor("green", 400)}>{product?.packagesSentence}</C1>} */}
                </View>
              </View>
              {/* <ChipGroup size={"sm"} isClickable={false} data={
                                            product.skus?.map(value => ({
                                                title: `${String(value.size)} ${String(value.unit)} (${String(value.totalBags)})`
                                            }))
                                        }>Chambers</ChipGroup> */}
              <ChipGroup
                size={"sm"}
                isClickable={false}
                data={product.skus?.map((value) => {
                  const IconComp = mapPackageIcon({
                    size: value.size,
                    unit: isPackageUnit(value.unit) ? value.unit : undefined,
                  });
                  return {
                    title: `${value.size} ${value.unit}: ${value.totalBags} (★ ${value.skuId?.split("-")?.[2]})`,
                    icon: IconComp && (
                      <IconComp color={getColor("green", 700)} size={16} />
                    ),
                  };
                })}
              >
                SKU's
              </ChipGroup>
            </View>
          );
        })}
      </View>
      {/* <DispatchProductList products={data?.products} isChecked={isChecked} /> */}
    </View>
  );
};

export default ProductListComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 12,
  },
  column: {
    flexDirection: "column",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gapedRow: {
    flexDirection: "row",
    gap: 12,
  },
  gapedRow8: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    backgroundColor: getColor("light"),
    padding: 12,
    flexDirection: "column",
    gap: 8,
    borderRadius: 16,
    boxShadow: "0px 6px 12px -6px rgba(0, 17, 13, 0.06)",
  },
  cardBody: {
    flexDirection: "column",
    gap: 8,
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 8,
  },
});