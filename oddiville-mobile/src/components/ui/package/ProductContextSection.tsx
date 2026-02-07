// Later have to resovle dispatch dep issue
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import Select from "@/src/components/ui/Select";
import FiveStarIcon from "@/src/components/icons/page/Rating/FiveStarIcon";
import FourStarIcon from "@/src/components/icons/page/Rating/FourStarIcon";
import ThreeStarIcon from "@/src/components/icons/page/Rating/ThreeStarIcon";
import TwoStarIcon from "@/src/components/icons/page/Rating/TwoStarIcon";
import OneStarIcon from "@/src/components/icons/page/Rating/OneStarIcon";

import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";

import { RootState } from "@/src/redux/store";
import { updateProduct } from "@/src/redux/slices/packingDraft.slice";
import { setSource } from "@/src/redux/slices/bottomsheet/raw-material.slice";
import { setRawMaterials } from "@/src/redux/slices/product.slice";

import { useRawMaterialByProduct } from "@/src/hooks/productItems";
import { IconRatingProps } from "@/src/types";
import { PackingFormController } from "@/src/hooks/packing/usePackingForm";

type Props = {
  setIsLoading: (v: boolean) => void;
  form: PackingFormController;
  setIsCurrentProduct: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProductContextSection = ({ setIsLoading, form, setIsCurrentProduct }: Props) => {

  const dispatch = useDispatch();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const productRating = useSelector(
    (state: RootState) => state.packageProductRating.packageProductRating
  );

  const selectedProductName = useSelector(
    (state: RootState) => state.product.product
  );

  const { rawMaterials, isLoading: rmLoading } =
    useRawMaterialByProduct(selectedProductName);

  const RatingIconMap: Record<number, React.FC<IconRatingProps>> = {
    5: FiveStarIcon,
    4: FourStarIcon,
    3: ThreeStarIcon,
    2: TwoStarIcon,
    1: OneStarIcon,
  };

  const ProductRatingIcon = RatingIconMap[productRating.rating] ?? FiveStarIcon;

  /* -------------------------------
      🔑 Sync PRODUCT NAME
  -------------------------------- */
  useEffect(() => {
    if (!selectedProductName) return;
    if (form.values.product.productName === selectedProductName) return;

    setIsCurrentProduct(true);

    dispatch(updateProduct({ productName: selectedProductName }));

    form.setField("product.productName", selectedProductName);
  }, [selectedProductName, form.setField, dispatch]);

      // Sync PRODUCT RATING
  useEffect(() => {
    if (!productRating?.rating) return;

    dispatch(updateProduct({ finalRating: productRating.rating }));
    form.setField("product.finalRating", productRating.rating);
  }, [productRating.rating, form.setField]);

  // Raw materials (unchanged)
  useEffect(() => {
    if (!rawMaterials || rawMaterials.length === 0) return;
    dispatch(setRawMaterials(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    setIsLoading(rmLoading);
  }, [rmLoading, setIsLoading]);

  async function handleToggleProductBottomSheet() {
    setIsLoading(true);
    dispatch(setSource("choose"));
    await validateAndSetData("Abc1", "add-product");
    setIsLoading(false);
  }

  return (
    <>
      <Select
        value={selectedProductName || "Select product"}
        style={{ paddingHorizontal: 8 }}
        showOptions={false}
        onPress={handleToggleProductBottomSheet}
        hasError={form.hasError("product.productName")}
        errorMessage={form.getError("product.productName")}
      >
        Product name
      </Select>

      <Select
        value={productRating.message}
        showOptions={false}
        preIcon={ProductRatingIcon}
        selectStyle={{ paddingHorizontal: 8 }}
        onPress={() =>
          validateAndSetData(
            `product:${productRating.rating}`,
            "storage-rm-rating"
          )
        }
        hasError={form.hasError("product.finalRating")}
        errorMessage={form.getError("product.finalRating")}
      />
    </>
  );
};

export default ProductContextSection;

const styles = StyleSheet.create({});