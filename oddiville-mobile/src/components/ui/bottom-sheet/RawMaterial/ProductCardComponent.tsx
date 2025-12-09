import { ProductCardProps, RawMaterialProps } from "@/src/types";
import { Pressable, StyleSheet, View } from "react-native";
import { C1, H4 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import CustomImage from "../../CustomImage";
import { getImageSource } from "@/src/utils/arrayUtils";
import Checkbox from "../../Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import {
  setSource,
  toggleChambers,
  toggleRawMaterial,
} from "@/src/redux/slices/bottomsheet/raw-material.slice";

const toRawMaterial = (it: any): RawMaterialProps => ({
  id: it.id ?? `${it.name}-${Math.random().toString(36).slice(2, 9)}`,
  name: it.name,
  description: it.description ?? "",
  detailByRating: it.detailByRating ?? [],
  rating: typeof it.rating === "number" ? it.rating : 0,
  category: it.category ?? "",
  chambers: it.chambers ?? [],
});

const ProductCardComponent: React.FC<ProductCardProps> = ({ data }) => {
  const dispatch = useDispatch();

  const { selectedRawMaterials, selectedChambers, source } = useSelector(
    (state: RootState) => state.rawMaterial
  );

  const isSelected = (name: string) => {
    if (source === "chamber") {
      return selectedChambers?.some((item) => item === name);
    } else if (source === "product-chamber") {
      return selectedChambers?.some((item) => item === name);
    } else {
      return selectedRawMaterials?.some((item) => item.name === name);
    }
  };

  const handleToggle = (
    item: { name: string; description?: string; id?: string } & Record<
      string,
      any
    >
  ) => {
    // if (source === "chamber") {
    //     dispatch(toggleChambers(item.name));
    // } else {
    //     const rawMaterial = toRawMaterial(item);
    //     dispatch(toggleRawMaterial(rawMaterial));
    //     dispatch(setSource("add"));
    // }
    if (source === "chamber") {
      dispatch(toggleChambers(item.name));
    } else if (source === "packaging") {
      const rawMaterial = toRawMaterial(item);
      dispatch(toggleRawMaterial(rawMaterial));
    }else if (source === "product-chamber") {
      dispatch(toggleChambers(item.name));
    } else {
      const rawMaterial = toRawMaterial(item);
      dispatch(toggleRawMaterial(rawMaterial));
      dispatch(setSource("add"));
    }
  };

  return (
    <View style={styles.listContainer}>
      {data?.map((item, index) => {
        const { image, isRawMaterial } = getImageSource({
          image: item.image,
          bg: source === "chamber" || source === "product-chamber" ? false : true
        });

        return (
          <Pressable
            style={styles.card}
            key={item.name || index}
            onPress={() => handleToggle(item)}
          >
            <View style={styles.titleWithImageSection}>
              <View
                style={[
                  styles.imageWrapper,
                  isRawMaterial && styles.productImage,
                ]}
              >
                <CustomImage
                  src={image}
                  resizeMode="contain"
                  width="100%"
                  height="100%"
                />
              </View>

              <View>
                <H4>{item.name}</H4>
                <C1 color={getColor("green", 400)}>{item.description}</C1>
              </View>
            </View>
            <Checkbox
              checked={isSelected(item.name)}
              onChange={() => handleToggle(item)}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default ProductCardComponent;

const styles = StyleSheet.create({
  listContainer: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: getColor("light"),
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  imageWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",

  },
  productImage: {
    backgroundColor: getColor("green", 300),
    borderRadius: 32,
    padding: 4,
  },

  titleWithImageSection: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});
