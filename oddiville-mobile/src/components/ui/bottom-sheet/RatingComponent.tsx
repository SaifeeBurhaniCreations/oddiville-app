import { RatingCardComponentProps } from "@/src/types";
import { StyleSheet, View } from "react-native";
import RatingCardEntity from "../RatingCard/RatingCardEntity";
import { H4 } from "@/src/components/typography/Typography";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setRating } from "@/src/redux/slices/rating.slice";

const ratings: (1 | 2 | 3 | 4 | 5)[] = [5, 4, 3, 2, 1];

const RatingComponent = ({ data }: RatingCardComponentProps) => {
  const dispatch = useDispatch();
  const { selectedRating } = useSelector((state: RootState) => state.rating);

  const { label, selected } = data;

  const ratingCard = (
    <View style={styles.card}>
      {ratings.map((rating) => (
        <RatingCardEntity
          key={rating}
          rating={rating}
          active={rating === selected}
          onPress={() => dispatch(setRating(rating))}
        />
      ))}
    </View>
  );

  return label ? (
    <View style={styles.wrapper}>
      <H4>{label}</H4>
      {ratingCard}
    </View>
  ) : (
    ratingCard
  );
};

export default RatingComponent;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "column",
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
});
