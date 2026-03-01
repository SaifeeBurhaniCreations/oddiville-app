import { StyleSheet, View } from "react-native";
import React, { ReactNode } from "react";
import { getColor } from "@/src/constants/colors";
import { B2, H5 } from "../typography/Typography";
import CustomImage from "./CustomImage";
import noProductImage from "@/src/assets/images/fallback/colourful/product.png";
import Accordian from "./Accordian";

const ItemsRepeater = ({
  description,
  title,
  children,
  showToast,
  noValue = false,
  noImage = false,
  accodian,
  ...props
}: {
  description?: string;
  title: string;
  noValue?: boolean;
  noImage?: boolean;
  children?: ReactNode;
  accodian?: {
    open: boolean;
    onPress: () => void;
  };
  showToast?: (type: "success" | "error" | "info", message: string) => void;
}) => {
  return (
    <View style={styles.card} {...props}>
      <View style={styles.cardHeader}>
        <View style={styles.Hstack}>
          {!noImage && (
            <CustomImage
              borderRadius={8}
              width={32}
              height={32}
              src={noProductImage}
            />
          )}
          <H5 color={getColor("light")}>{title}</H5>
        </View>
        {!noValue && <B2 color={getColor("light")}>{description}</B2>}
        {accodian && (
          <Accordian open={accodian.open} onPress={accodian.onPress} />
        )}
      </View>

      <View style={styles.cardBody}>{children}</View>
    </View>
  );
};

export default ItemsRepeater;

const styles = StyleSheet.create({
  card: {
    backgroundColor: getColor("green"),
    borderRadius: 16,
  },
  cardHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardBody: {
    backgroundColor: getColor("light"),
    borderRadius: 16,
    padding: 12,
    flexDirection: "column",
    gap: 12,
  },
  labelInput: {
    flexDirection: "column",
    gap: 16,
  },
  justifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  flexGrow: {
    flex: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderColor: getColor("green", 100),
    paddingBottom: 16,
  },
  Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
