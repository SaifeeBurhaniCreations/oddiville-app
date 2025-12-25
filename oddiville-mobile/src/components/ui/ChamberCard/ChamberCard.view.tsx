import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { C1, H3 } from "@/src/components/typography/Typography";
import Tag from "@/src/components/ui/Tag";
import CustomImage from "@/src/components/ui/CustomImage";
import { getColor } from "@/src/constants/colors";
import { RawMaterialProps } from "@/src/types/ui";
import { getImageSource } from "@/src/utils/arrayUtils";
import StarIcon from "@/src/components/icons/page/StarIcon";
import ShopIcon from "@/src/components/icons/menu/ShopIcon";
import PaperRollIcon from "../../icons/packaging/PaperRollIcon";

type TagColor = "red" | "blue" | "green" | "yellow";

const CATEGORY_UI: Record<
  RawMaterialProps["category"],
  { color: TagColor; Icon: React.ComponentType<any> }
> = {
  other: { color: "blue", Icon: ShopIcon },
  packed: { color: "yellow", Icon: ShopIcon },
  material: { color: "green", Icon: StarIcon },
};

function normalizeRating(rating?: string) {
  return rating?.trim().replace(/(\d+(\.\d+)?) - \1/g, "$1") ?? "";
}

interface ViewProps extends RawMaterialProps {
  onPress: () => void;
}

const ChamberCardView = ({
  name,
  description,
  rating,
  category,
  image,
  disabled,
  plainDescription = false,
  leadingIcon: LeadingIcon,
  onPress,
}: ViewProps) => {
  const { color, Icon } = CATEGORY_UI[category];
  const normalizedRating = normalizeRating(rating);

  const imageResult = getImageSource({
    image,
    options: { isChamberItem: true },
  });

  const imageBgColor = !imageResult.isCustomImage
    ? "#f3e7cf"
    : getColor("green", 300);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      style={[
        styles.card,
        category === "other" && styles.otherItemsCard,
        disabled && styles.disabledCard,
      ]}
    >
      {LeadingIcon ? (
        <View
          style={[
            styles.productImage,
            {
              backgroundColor: getColor("green", 100, 0.3),
              paddingHorizontal: 8,
            },
          ]}
        >
          <LeadingIcon size={24} color={getColor("green")} />
        </View>
      ) : (
        <View style={[styles.productImage, { backgroundColor: imageBgColor }]}>
          <CustomImage
            src={imageResult.image}
            width={40}
            height={40}
            resizeMode="contain"
          />
        </View>
      )}

      <View style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <H3 color={getColor("green", disabled ? 200 : 700)}>{name}</H3>

          <Tag
            color={color}
            size="xs"
            style={styles.tag}
            icon={<Icon size={12} color={getColor("light")} />}
          >
            {category}
          </Tag>
        </View>

        <C1 color={getColor("green", 400)}>
          {plainDescription
            ? description
            : `${description ?? ""}${
                normalizedRating ? ` | ${normalizedRating}` : ""
              }`}
        </C1>
      </View>
    </TouchableOpacity>
  );
};

export default memo(ChamberCardView);

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: getColor("light"),
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
  },
  otherItemsCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: getColor("green", 100),
    borderRadius: 16,
    gap: 12,
    marginBottom: 0,
  },
  disabledCard: {
    opacity: 0.7,
  },
  productImage: {
    padding: 2,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  tag: {
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
