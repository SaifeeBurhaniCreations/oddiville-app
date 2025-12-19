import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { useParams } from "@/src/hooks/useParams";
import { useEffect, useMemo, useState } from "react";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";
import { format, formatDate } from "date-fns";
import {
  ActivityProps,
  ChamberData,
  ChamberEntry,
  OrderProps,
  OtherClientHistory,
} from "@/src/types";
import SupervisorOrderDetailsCard from "@/src/components/ui/Supervisor/SupervisorOrderDetailsCard";
import Tabs from "@/src/components/ui/Tabs";
import ActivitesFlatList from "@/src/components/ui/ActivitesFlatList";
import Input from "@/src/components/ui/Inputs/Input";
import FormField from "@/src/sbc/form/FormField";
import { useFormValidator } from "@/src/sbc/form";
import Button from "@/src/components/ui/Buttons/Button";
import DetailsToast from "@/src/components/ui/DetailsToast";
import {
  useOtherProductHistoryById,
  useOthersProductsById,
  useUpdateOtherProduct,
} from "@/src/hooks/othersProducts";
import { formatWeight } from "@/src/utils/common";
import ItemsRepeater from "@/src/components/ui/ItemsRepeater";
import { useChamberById } from "@/src/hooks/useChambers";
import Loader from "@/src/components/ui/Loader";
import PriceInput from "@/src/components/ui/Inputs/PriceInput";

export type OthersProductForm = {
  name: string;
  add_quantity: Record<string, number>;
  sub_quantity: Record<string, number>;
  chambers: string[];
};

export type OthersProductPayload = Omit<OthersProductForm, "chambers"> & {
  chambers: { id: string; add_quantity: number; sub_quantity: number }[];
};

const OthersProductScreen = () => {
  const { data } = useParams("other-products-detail", "data");

  if (!data) return;

  const otherProduct: {
    id: string;
    category: string;
    product_name: string;
    name: string;
    company: string;
    chambers: { id: string; quantity: string; rating: string }[];
  } = JSON.parse(data);

  if (!otherProduct) return;
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [toastMessage, setToastMessage] = useState("");

  const updateMutation = useUpdateOtherProduct();
  const { data: otherProductData } = useOthersProductsById(otherProduct.id);

  const { data: otherProductHistoryRaw = [] } = useOtherProductHistoryById(
    otherProductData?.id
  );

  const otherProductHistory = (otherProductHistoryRaw ??
    []) as OtherClientHistory[];

  const productIds: string[] | undefined = otherProduct?.chambers?.map(
    (product) => product?.id
  );

  const queryIds = productIds ?? null;

  const { data: chamberData } = useChamberById(null, queryIds);

  const chamberMap: Record<string, ChamberData> = useMemo(() => {
    if (!chamberData || !Array.isArray(chamberData)) return {};
    return chamberData.reduce((acc, chamber) => {
      acc[chamber.id] = chamber;
      return acc;
    }, {} as Record<string, ChamberData>);
  }, [chamberData]);

  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const totalQuantity = otherProduct.chambers
    ? otherProduct.chambers.reduce(
        (sum, chamber) => sum + Number(chamber.quantity),
        0
      )
    : 0;

  const orderDetail: OrderProps = useMemo(() => {
    return {
      title: otherProduct?.product_name,
      name: otherProduct.company,
      description: [
        {
          name: "Quantity",
          value: `${formatWeight(totalQuantity)}`,
          icon: <DatabaseIcon color={getColor("green", 700)} size={16} />,
        },
      ],
      helperDetails: [
        {
          name: "Stored",
          value: formatDate(new Date().toISOString(), "MMM d, yyyy"),
          icon: null,
        },
        {
          name: "Est. Dis",
          value: formatDate(new Date().toISOString(), "MMM d, yyyy"),
          icon: null,
        },
      ],
    };
  }, []);

  const activities = otherProductHistory?.map((history) => ({
    id: history.id,
    title: orderDetail.title,
    type: "",
    createdAt: new Date(),
    extra_details: [
      `${formatWeight(history?.remaining_quantity)}`,
      `${format(new Date(history?.createdAt), "MMM d, yyyy")}`,
      `${format(new Date(history?.createdAt), "hh:mm:ss a")}`,
      // `Quantity: ${formatWeight(history?.remaining_quantity)}`,
      // `Date: ${format(new Date(history?.createdAt), "MMM d, yyyy")}`,
      // `Time: ${format(new Date(history?.createdAt), "hh:mm:ss a")}`,
    ],
  })) as ActivityProps[];

  const { values, setField, errors, resetForm, validateForm, isValid } =
    useFormValidator<OthersProductForm>(
      {
        name: "",
        add_quantity: {},
        sub_quantity: {},
        chambers: [],
      },
      {
        name: [],
        add_quantity: [],
        sub_quantity: [],
        chambers: [],
      },
      {
        validateOnChange: true,
        debounce: 300,
      }
    );

    // sum all numbers in a Record<string, number>
    const sumRecordValues = (obj: Record<string, number> | undefined) =>
      Object.values(obj || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);

    const totalAdd = sumRecordValues(values.add_quantity);
    const totalSub = sumRecordValues(values.sub_quantity);

    // true when both add & sub have total 0
    const isAllZero = totalAdd === 0 && totalSub === 0;


  useEffect(() => {
    setField("name", orderDetail.title);
    setField("chambers", queryIds);

    if (otherProduct?.chambers?.length) {
      const addMap: Record<string, number> = { ...(values.add_quantity || {}) };
      const subMap: Record<string, number> = { ...(values.sub_quantity || {}) };

      otherProduct.chambers.forEach((ch) => {
        if (addMap[ch.id] === undefined) addMap[ch.id] = 0;
        if (subMap[ch.id] === undefined) subMap[ch.id] = 0;
      });

      setField("add_quantity", addMap);
      setField("sub_quantity", subMap);
    }
  }, []);

  const onSubmit = () => {
    setIsLoading(true);
    const result = validateForm();
    if (!result.success) {
      setIsLoading(false);
      return;
    }

    // Build per-chamber payload
    const addMap = result.data.add_quantity || {};
    const subMap = result.data.sub_quantity || {};
    const chambersPayload = otherProduct.chambers.map((ch) => ({
      id: ch.id,
      add_quantity: Number(addMap[ch.id] ?? 0),
      sub_quantity: Number(subMap[ch.id] ?? 0),
    }));

    updateMutation.mutate(
      {
        id: otherProduct.id,
        othersItemId: otherProductData.id,
        data: {
          ...result.data,
          chambers: chambersPayload,
        },
      },
      {
        onSuccess: (data) => {
          setIsLoading(false);
          showToast("success", "Quantity updated successfully");
          resetForm();
        },
        onError: (error) => {
          setIsLoading(false);
          showToast("error", "Failed to update quantity");
          console.error("Update error", error);
        },
      }
    );
  };

  return (
    <View style={styles.pageContainer}>
      <PageHeader page={"Third Party Booking"} />
      <View style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.VStack, styles.gap16]}>
            <BackButton
              label="Detail"
              backRoute="chambers"
              style={styles.pX16}
            />
            <View style={styles.supervisroCard}>
              <SupervisorOrderDetailsCard
                order={orderDetail}
                color="green"
                bgSvg={DatabaseIcon}
              />
            </View>
            {/* , "Dispatch History" */}
            <Tabs
              tabTitles={["Dispatch Entry"]}
              color="green"
              style={styles.flexGrow}
            >
              <View
                style={[
                  styles.flexGrow,
                  styles.VStack,
                  styles.gap8,
                  styles.mt16,
                ]}
              >
                {otherProduct.chambers?.map((chamber) => (
                  <ItemsRepeater
                    key={chamber.id}
                    title={
                      chamberMap[chamber.id]?.chamber_name ?? "Unknown Chamber"
                    }
                    description={chamber.quantity}
                  >
                    <PriceInput
                      value={String(values.add_quantity?.[chamber.id] ?? "")}
                      onChangeText={(text) => {
                        const num = Number(text) || 0;
                        setField("add_quantity", {
                          ...(values.add_quantity || {}),
                          [chamber.id]: num,
                        });
                      }}
                      placeholder="Enter quantity"
                      addonText="Kg"
                      error={(errors as any)?.add_quantity?.[chamber.id]}
                      style={styles.flexGrow}
                    >
                      (+) Add Quantity
                    </PriceInput>

                    <PriceInput
                      value={String(values.sub_quantity?.[chamber.id] ?? "")}
                      onChangeText={(text) => {
                        const num = Number(text) || 0;
                        setField("sub_quantity", {
                          ...(values.sub_quantity || {}),
                          [chamber.id]: num,
                        });
                      }}
                      placeholder="Enter quantity"
                      addonText="Kg"
                      error={(errors as any)?.sub_quantity?.[chamber.id]}
                      style={styles.flexGrow}
                    >
                      (-) Substract Quantity
                    </PriceInput>
                  </ItemsRepeater>
                ))}
              </View>
              {/* <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.pX16]}
              >
                <ActivitesFlatList
                  isVirtualised={false}
                  activities={activities}
                />
              </ScrollView> */}
            </Tabs>
          </View>
        </ScrollView>
        <Button
          variant="fill"
          onPress={onSubmit}
          disabled={!isValid || isAllZero}
          style={styles.mx16}
        >
          Done
        </Button>
      </View>
      {isLoading && !updateMutation.isSuccess && (
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
    paddingVertical: 16,
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
  mt16: {
    marginTop: 16,
  },
  mx16: {
    marginHorizontal: 16,
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
  supervisroCard: {
    backgroundColor: getColor("light", 200),
    paddingHorizontal: 16,
  },
  pX16: {
    paddingHorizontal: 16,
  },
});

export default OthersProductScreen;
