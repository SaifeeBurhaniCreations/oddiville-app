// 1. React and React Native core
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

// 2. Third-party dependencies
import { formatDate } from "date-fns";
import { useDispatch, useSelector } from "react-redux";

// 3. Project components
import BottomSheet from "@/src/components/ui/BottomSheet";
import PageHeader from "@/src/components/ui/PageHeader";
import SupervisorOrderDetailsCard from "@/src/components/ui/Supervisor/SupervisorOrderDetailsCard";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import ChipGroup from "@/src/components/ui/ChipGroup";
import FileUploadGallery from "@/src/components/ui/FileUploadGallery";
import Button from "@/src/components/ui/Buttons/Button";
import DetailsToast from "@/src/components/ui/DetailsToast";
import Loader from "@/src/components/ui/Loader";

// 4. Project hooks
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { useLanes } from "@/src/hooks/useFetchData";
import { useParams } from "@/src/hooks/useParams";
import { useProductionById, useUpdateProduction } from "@/src/hooks/production";
import { useRawMaterialOrderById } from "@/src/hooks/rawMaterialOrders";
import { useAppNavigation } from "@/src/hooks/useAppNavigation";

// 5. Project constants/utilities
import { getColor } from "@/src/constants/colors";
import { useFormValidator } from "@/src/sbc/form";
import FormField from "@/src/sbc/form/FormField";

// 6. Types
import { OrderProps, RootStackParamList } from "@/src/types";
import { RootState } from "@/src/redux/store";

// 7. Schemas & Redux slices
import { setCurrentProduct } from "@/src/redux/slices/store-product.slice";
import { initFromSelection } from "@/src/redux/slices/bottomsheet/chamber-ratings.slice";
import { setId } from "@/src/redux/slices/bottomsheet/store-productId.slice";
import { setProductName } from "@/src/redux/slices/production-begin.slice";
import { Chamber, useChamber, useFrozenChambers } from "@/src/hooks/useChambers";
import { options } from "axios";
import { useAuth } from "@/src/context/AuthContext";
import { productionCompletedBackRoute } from "@/src/constants/backRoute";

// 8. Assets
// No items of this type

type DuringProduction = {
  lane: string;
  sample_images: File[] | null | string[];
};

function toUrlArray(sample: any): string[] {
  if (!sample) return [];

  if (Array.isArray(sample)) {
    return sample
      .map((x: any) => (typeof x === "string" ? x : x?.url))
      .filter(Boolean);
  }

  if (Array.isArray(sample.urls)) {
    return sample.urls.filter(Boolean);
  }
  if (Array.isArray(sample.files)) {
    return sample.files
      .map((f: any) => (typeof f === "string" ? f : f?.url))
      .filter(Boolean);
  }

  return [];
}

const getChamberName = (chambers: Chamber[]) => chambers?.filter(ch => ch.tag !== "dry").map(ch => ch.chamber_name)

const ProductionStartScreen = () => {
  const selectedChambers = useSelector(
    (state: RootState) => state.rawMaterial.selectedChambers
  );
  const { data: frozenChambers, isLoading: frozenLoading, refetch: frozenChambersRefetch, isFetching: frozenChambersFetching } =
    useFrozenChambers();
  const { isLoading: productionLoading } = useSelector(
    (state: RootState) => state.production
  );

  const dispatch = useDispatch();
  const { role } = useAuth();
  
  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");
  const [existingImage, setExistingImage] = useState<string[]>([]);

  const { id } = useParams("production-start", "id");

  const { data: productionData } = useProductionById(id!);
  const rawOrderId = productionData?.raw_material_order_id;
  const { data: rawMaterialOrderData } = useRawMaterialOrderById(rawOrderId);

  const { goTo } = useAppNavigation();

  const { data: lanesRaw = [] } = useLanes();
  const formattedLanes = lanesRaw.map((lane: any) => ({
    ...lane,
    value: lane.id,
    label: lane.name,
  }));

  const disabledLaneIds = formattedLanes
    .filter((lane: any) => !!lane.production_id && lane.production_id !== id)
    .map((lane: any) => lane.value);


  const orderDetail: OrderProps = useMemo(() => {
    return {
      title: productionData?.product_name || "--",
      name: rawMaterialOrderData?.vendor || "--",
      description: [
        {
          name: "Quantity",
          value: rawMaterialOrderData
            ? `${rawMaterialOrderData.quantity_received ?? "--"} ${
                rawMaterialOrderData.unit ?? ""
              }`
            : "--",
          icon: <DatabaseIcon color={getColor("green", 700)} size={16} />,
        },
      ],
      helperDetails: [
        {
          name: "Order",
          value: rawMaterialOrderData?.order_date
            ? formatDate(
                new Date(rawMaterialOrderData.order_date),
                "MMM d, yyyy"
              )
            : "--",
          icon: null,
        },
        {
          name: "Arrival",
          value: rawMaterialOrderData?.arrival_date
            ? formatDate(
                new Date(rawMaterialOrderData.arrival_date),
                "MMM d, yyyy"
              )
            : "--",
          icon: null,
        },
      ],
    };
  }, [productionData, rawMaterialOrderData]);

  useEffect(() => {
    dispatch(setProductName(productionData?.product_name));
  }, [productionData]);

  useEffect(() => {
    dispatch(initFromSelection(selectedChambers));
  }, [selectedChambers, dispatch]);

  useEffect(() => {
    id && dispatch(setId(id));
  }, [id, dispatch]);

  const { values, setField, errors, validateForm, resetForm } =
    useFormValidator<DuringProduction>(
      {
        lane: productionData?.lane || "",
        sample_images: [],
      },
      {
        lane: [],
        sample_images: [],
      },
      {
        validateOnChange: true,
        debounce: 300,
      }
    );

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };
  useEffect(() => {
    if (!productionData) return;
    setField("lane", productionData.lane || "");

    const urls = toUrlArray(productionData.sample_images);
    setExistingImage(urls);
  }, [productionData]);

  const openBottomSheet = () => {
    
    const supervisorProduction = {
      sections: [
        {
          type: "title-with-details-cross",
          data: {
            title: "Store material",
            description: "Pick chambers to store your materials in",
            details: {
              label: "Quantity",
              value: `${rawMaterialOrderData?.quantity_received} ${rawMaterialOrderData?.unit}`,
              icon: "database",
            },
          },
        },
        {
          type: "select",
          data: {
            placeholder: "Select chambers",
            label: "Select chambers",
            options: frozenChambers.map(fc => fc.chamber_name),
            key: "supervisor-production"
          },
        },
        ...selectedChambers.map((chamberName) => ({
          type: "input-with-select",
          conditionKey: "hideUntilChamberSelected",
          hasUniqueProp: {
            identifier: "addonInputQuantity",
            key: "label",
          },
          data: {
            placeholder: "Quantity",
            image: "",
            label: chamberName,
            label_second: "Rating",
            value: "",
            addonText: "Kg",
            key: "production",
            formField_1: chamberName,
            source: "supervisor-production",
          },
        })),
        {
          type: "addonInput",
          conditionKey: "hideUntilChamberSelected",
          data: {
            placeholder: "Enter quantity",
            label: "Discard quantity",
            value: "0",
            addonText: "Kg",
            formField: "discard_quantity",
          },
        },
      ],
      buttons: [
        {
          text: "Cancel",
          variant: "outline",
          color: "green",
          alignment: "half",
          disabled: false,
        },
        {
          text: "Store",
          variant: "fill",
          color: "green",
          alignment: "half",
          disabled: false,
          actionKey: "store-product",
        },
      ],
    };

    dispatch(setCurrentProduct(productionData));

    setIsLoading(true);

    if (id) {
      validateAndSetData(id, "supervisor-production", supervisorProduction);
      setIsLoading(false);
    }
  };

  const buildFormData = useCallback((form: DuringProduction) => {
    const formData = new FormData();
    formData.append("lane", form.lane);

    const existingUrls = toUrlArray(productionData?.sample_images);
    if (existingUrls.length > 0) {
      formData.append("existing_sample_images", JSON.stringify(existingUrls));
    }

    form.sample_images &&
      Array.isArray(form.sample_images) &&
      form.sample_images.forEach((img: any, idx: number) => {
        let fileData: any;
        if (typeof img === "string") {
          const name = img.split("/").pop() || `sample_image_${idx}.jpg`;
          const type = name.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
          fileData = { uri: img, name, type };
        } else if (img instanceof File) {
          fileData = img;
        }
        if (fileData) formData.append("sample_images", fileData);
      });

    return formData;
  }, []);

  const updateProduction = useUpdateProduction();

  const saved = async () => {
    const result = validateForm();
    if (!result.success) return;

    try {
      setIsLoading(true);
      const formData = buildFormData(result.data);

      updateProduction.mutate(
        { id: id!, data: formData },
        {
          onSuccess: (result) => {
            goTo("production");
            resetForm();
          },
          onError: (error) => {
            showToast("error", "Failed to update production");
          },
        }
      );
    } catch (err) {
      console.error("Production submission failed", err);
    } finally {
      setIsLoading(false);
    }
  };

const isStarted = !!productionData?.isStarted;

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Production"} />
      <View style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.VStack, styles.gap16]}>
            <BackButton label="Production Complete" backRoute={productionCompletedBackRoute[role ?? "supervisor"] as keyof RootStackParamList} />

            <SupervisorOrderDetailsCard
              order={orderDetail}
              color="green"
              bgSvg={DatabaseIcon}
            />

            <FormField name="lane" form={{ values, setField, errors }}>
              {({ value, onChange, error }) => (
                <ChipGroup
                  type="radio"
                  data={formattedLanes}
                  activeValue={value}
                  onChange={(selectedLaneId) => {
                    onChange(selectedLaneId);
                  }}
                  disabledValues={disabledLaneIds}
                >
                  Select lane
                </ChipGroup>
              )}
            </FormField>

            <FormField name="sample_images" form={{ values, setField, errors }}>
              {({ value = [], onChange }) => (
                <FileUploadGallery
                  fileStates={[Array.isArray(value) ? value : [], onChange]}
                  existingStates={[existingImage, setExistingImage]}
                   maxImage={10}
                >
                  Capture photo
                </FileUploadGallery>
              )}
            </FormField>
            
          </View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <Button
            onPress={saved}
            disabled={updateProduction.isPending || productionLoading}
            variant="outline"
          >
            {updateProduction.isPending ? isStarted ? "Saving..." : "Starting..." : isStarted ? "Save" : "Start"}
          </Button>
          <Button
            onPress={openBottomSheet}
            disabled={updateProduction.isPending || productionLoading}
            style={styles.flexGrow}
          >
            {productionLoading
              ? "Production completing..."
              : "Production completed"}
          </Button>
        </View>
      </View>
      <BottomSheet color="green" />
      {(isLoading || productionLoading || frozenLoading) && (
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        </View>
      )}
      <DetailsToast
        type={toastType}
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
  },
  flexGrow: {
    flex: 1,
  },
  searchinputWrapper: {
    height: 44,
    marginTop: 24,
    marginBottom: 24,
  },
  HStack: {
    flexDirection: "row",
  },
  VStack: {
    flexDirection: "column",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  gap8: {
    gap: 8,
  },
  gap16: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor("green", 500, 0.005),
    zIndex: 2,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ProductionStartScreen;
