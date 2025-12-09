import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { setStorageRmRating } from "@/src/redux/slices/bottomsheet/storage.slice";
import { useDispatch } from "react-redux";
import { getColor } from "@/src/constants/colors";
import { H4 } from "../../typography/Typography";
import ForwardChevron from "../../icons/navigation/ForwardChevron";
import FiveStarIcon from "@/src/components/icons/page/Rating/FiveStarIcon";
import FourStarIcon from "@/src/components/icons/page/Rating/FourStarIcon";
import OneStarIcon from "@/src/components/icons/page/Rating/OneStarIcon";
import ThreeStarIcon from "@/src/components/icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "@/src/components/icons/page/Rating/TwoStarIcon";
import Tag from "../Tag";
import StarIcon from "../../icons/page/StarIcon";
import { closeBottomSheet } from "@/src/redux/slices/bottomsheet.slice";

const StorageRMRatingComponent = ({
  data,
}: {
  data: { rating: string; message: string }[];
}) => {
  const dispatch = useDispatch();
  return (
    <View style={[styles.container]}>
      {data.map((item, index) => {
        const Icon = {
          "5": FiveStarIcon,
          "4": FourStarIcon,
          "3": ThreeStarIcon,
          "2": TwoStarIcon,
          "1": OneStarIcon,
        }[item.rating];

        return (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.card]}
            onPress={() => {
                dispatch(setStorageRmRating(item));
                dispatch(closeBottomSheet());
            }}
            key={item.rating}
          >
            <View
              style={[
                styles.HStack,
                styles.justifyBetween,
                styles.alignItemsCenter,
                {
                    width: "100%"
                }
              ]}
            >
              <View style={[styles.HStack, styles.alignItemsCenter, styles.gap12]}>
                {Icon && <Icon />}
                <H4 color={getColor("green", 700)}>{item.message}</H4>
              </View>

              <View style={[styles.HStack, styles.alignItemsCenter, styles.gap12]}>
                <Tag color={"red"} icon={<StarIcon size={12} />}>{item.rating}</Tag>
                <ForwardChevron color={getColor("green", 700)} />
              </View>

            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default StorageRMRatingComponent;

const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingBottom: 8,
    },
  card: {
    backgroundColor: getColor("light", 500),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    elevation: 2,
    borderRadius: 16,
  },
  lastCardText: {
    color: getColor("red", 500),
  },
  HStack: {
    flexDirection: "row",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  gap12: {
    gap: 12,
  },
});
