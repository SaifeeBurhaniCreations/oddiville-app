import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { RootState } from "@/src/redux/store";
import { setRatingForProductSize } from "@/src/redux/slices/bottomsheet/dispatch-rating.slice";
import { setRatingForRM } from "@/src/redux/slices/bottomsheet/storage.slice";
import { setPackageProductRating } from "@/src/redux/slices/bottomsheet/package-product-rating.slice";

type RatingMode = "dispatch-rating" | "storage-rating";

const StorageRMRatingComponent = ({
  data,
}: {
  data: { rating: string; message: string }[];
}) => {
  const dispatch = useDispatch();
  const meta = useSelector((state: RootState) => state.bottomSheet.meta);

  const mode = meta?.mode as RatingMode | undefined;

const intent = meta?.intent;

const handleSelect = (selectedRating: number) => {
  const rating = {
    rating: selectedRating,
    message: ratingToMessageMap[selectedRating],
  };

  switch (intent) {
    case "PACKED_PRODUCT_RATING":
      dispatch(
        setPackageProductRating(rating)
      );
      break;

    case "PACKING_RM_FILTER_RATING":
      dispatch(
        setRatingForRM({
          rawMaterial: meta?.id!.split(":")[0],
          rating,
        })
      );
      break;

      case "DISPATCH_PACKAGE_RATING": {
        if (!meta?.data) {
          console.warn("Missing meta.data for DISPATCH_PACKAGE_RATING", meta);
          break;
        }

        const { productId, size, unit } = meta.data;

        dispatch(
          setRatingForProductSize({
            productId,
            size,
            unit,
            rating,
          })
        );
        break;
      }

    default:
      console.warn("Unknown rating intent", meta);
  }

  dispatch(closeBottomSheet());
};

  const ratingToMessageMap: Record<number, string> = {
    5: "Excellent",
    4: "Good",
    3: "Average",
    2: "Poor",
    1: "Very Poor",
  };

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const Icon = {
          "5": FiveStarIcon,
          "4": FourStarIcon,
          "3": ThreeStarIcon,
          "2": TwoStarIcon,
          "1": OneStarIcon,
        }[item.rating];

        return (
          <TouchableOpacity
            key={item.rating}
            activeOpacity={0.7}
            style={styles.card}
            onPress={() => handleSelect(Number(item.rating))}
          >
            <View style={[styles.row, styles.justifyBetween]}>
              <View style={[styles.row, styles.gap12]}>
                {Icon && <Icon />}
                <H4 color={getColor("green", 700)}>
                  {item.message}
                </H4>
              </View>

              <View style={[styles.row, styles.gap12]}>
                <Tag color="red" icon={<StarIcon size={12} />}>
                  {item.rating}
                </Tag>
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
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  gap12: {
    gap: 12,
  },
});