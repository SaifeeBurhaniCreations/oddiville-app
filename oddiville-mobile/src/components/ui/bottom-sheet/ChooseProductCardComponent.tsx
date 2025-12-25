import { Pressable, StyleSheet, View } from "react-native";
import { C1, H4 } from "@/src/components/typography/Typography";
import { getColor } from "@/src/constants/colors";
import CustomImage from "@/src/components/ui/CustomImage";
import Checkbox from "@/src/components/ui/Checkbox";
import { getImageSource } from "@/src/utils/arrayUtils";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import {
  selectProduct,
  removeProduct,
} from "@/src/redux/slices/multiple-product.slice";
import {
  ChamberProduct,
  multipleProductCardDataProps,
  multipleProductCardProps,
} from "@/src/types";
import PackedItemFallbackImg from "@/src/assets/images/fallback//raw-material-fallback.png";

const ChooseProductCardComponent: React.FC<multipleProductCardProps> = ({
  data,
}) => {
  const dispatch = useDispatch();
console.log("redux data", JSON.stringify(data));

  const selectedProducts = useSelector(
    (state: RootState) => state.multipleProduct.selectedProducts
  );

  const isSelected = (productId: string) =>
    selectedProducts.some((p) => p.id === productId);

  const handleToggle = (item: multipleProductCardDataProps) => {
    const chambersRecord = item.chambers.reduce<Record<string, ChamberProduct>>(
      (acc, chamber) => {
        acc[chamber.id] = chamber;
        return acc;
      },
      {}
    );

    if (isSelected(item.id)) {
      dispatch(removeProduct(item.id));
    } else {
      dispatch(
        selectProduct({
          id: item.id,
          product_name: item.product_name ?? "",
          rating: 5,
          packages: item.packages,
          chambers: chambersRecord,
        })
      );
    }
  };

  return (
    <View style={styles.listContainer}>
      {data.map((item) => {
        const { image, isCustomImage } = getImageSource({
          image: item.image,
          options: {
            isPackedItem: true,
          },
        });

        return (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => handleToggle(item)}
          >
            <View style={styles.titleWithImageSection}>
              <View
                style={[
                  styles.imageWrapper,
                  isCustomImage ? styles.productImage : styles.fallbackImage,
                ]}
              >
                <CustomImage
                  src={image}
                  resizeMode="contain"
                  width="100%"
                  height="100%"
                  fallback={PackedItemFallbackImg}
                />
              </View>

              <View>
                <H4>{item.product_name}</H4>
                <C1 color={getColor("green", 400)}>{item.description ?? ""}</C1>
              </View>
            </View>

            <Checkbox
              checked={isSelected(item.id)}
              onChange={() => handleToggle(item)}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

export default ChooseProductCardComponent;

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
    borderRadius: 8,
    padding: 4,
  },
  fallbackImage: {
    backgroundColor: "#ededed",
    borderRadius: 8,
    padding: 4,
  },

  titleWithImageSection: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
});
