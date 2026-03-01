import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "@/src/components/ui/Buttons/BackButton";
import { useParams } from "@/src/hooks/useParams";
import { useEffect, useMemo, useState } from "react";
import DatabaseIcon from "@/src/components/icons/page/DatabaseIcon";
import { formatDate } from "date-fns";
import { ChamberData, OrderProps, OtherClientHistory } from "@/src/types";
import SupervisorOrderDetailsCard from "@/src/components/ui/Supervisor/SupervisorOrderDetailsCard";
import Tabs from "@/src/components/ui/Tabs";
import { useFormValidator } from "@/src/sbc/form";
import Button from "@/src/components/ui/Buttons/Button";
import {
  useOtherProductHistoryById,
  useOtherProductStockById,
  useOthersProductsById,
  useUpdateOtherProduct,
} from "@/src/hooks/othersProducts";
import ItemsRepeater from "@/src/components/ui/ItemsRepeater";
import { useChamberById } from "@/src/hooks/useChambers";
import PriceInput from "@/src/components/ui/Inputs/PriceInput";
import { useToast } from "@/src/context/ToastContext";
import OverlayLoader from "@/src/components/ui/OverlayLoader";
import { useQueryClient } from "@tanstack/react-query";
import Require from "@/src/components/authentication/Require";
import { RefreshControl } from "react-native-gesture-handler";
import ActivitesFlatList from "@/src/components/ui/ActivitesFlatList";
import EmptyState, { EmptyStateStyles } from "@/src/components/ui/EmptyState";
import NoContractorBatchImg from "@/src/assets/images/illustrations/no-contractor-batch.png";

export type OthersProductForm = {
  name: string;
  add_quantity: Record<string, number>;
  sub_quantity: Record<string, number>;
  chambers: string[];
};

export type OthersProductPayload = Omit<OthersProductForm, "chambers"> & {
  chambers: { id: string; add_quantity: number; sub_quantity: number }[];
};

type OtherProductChamber = {
  id: string;
  quantity: string;
  rating?: string;
};

type StockChamber = {
  id: string;
  quantity: string;
  rating: string;
};

const sumRecordValues = (obj: Record<string, number> | undefined) =>
  Object.values(obj || {}).reduce((sum: number, val: number) => sum + val, 0);

const OthersProductScreen = () => {
  const { data } = useParams("other-products-detail", "data");
  const queryClient = useQueryClient();
  const toast = useToast();

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
  const [isLoading, setIsLoading] = useState(false);

  const updateMutation = useUpdateOtherProduct();
  const { data: otherProductData } = useOthersProductsById(otherProduct.id);

  const { data: stockData } = useOtherProductStockById(
    otherProductData?.product_id,
  );

  const {
    data: otherProductHistoryRaw = [],
    refetch: refetchOtherProductHistory,
    isLoading: refreshing,
  } = useOtherProductHistoryById(otherProductData?.id);

  const productIds: string[] | undefined = otherProduct?.chambers?.map(
    (product) => product?.id,
  );

  const queryIds = productIds ?? null;

  const { data: chamberData } = useChamberById(null, queryIds);

  const chamberMap: Record<string, ChamberData> = useMemo(() => {
    if (!chamberData || !Array.isArray(chamberData)) return {};
    return chamberData.reduce(
      (acc, chamber) => {
        acc[chamber.id] = chamber;
        return acc;
      },
      {} as Record<string, ChamberData>,
    );
  }, [chamberData]);

  const otherProductHistory = (otherProductHistoryRaw ??
    []) as OtherClientHistory[];

  const otherProductActivities = useMemo(() => {
    if (!otherProductHistory?.length) return [];

    return otherProductHistory
      .map((entry) => {
        const addQty = Number(entry.add_quantity || 0);
        const subQty = Number(entry.deduct_quantity || 0);

        const isAdd = addQty > 0;

        const quantity = isAdd ? addQty : subQty;

        const chamberName =
          chamberMap?.[entry.chamber_id]?.chamber_name ?? "Unknown Chamber";

        return {
          id: entry.id,
          itemId: entry.product_id,
          title: `${isAdd ? "+" : "-"} ${quantity} kg`,
          type: chamberName,
          createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
          extra_details: [`Remaining: ${entry.remaining_quantity} kg`],
          identifier: null,
          headerColor: isAdd ? ("green" as const) : ("red" as const),
        };
      })
      .reverse();
  }, [otherProductHistory, chamberMap]);

  const totalQuantity = useMemo(() => {
    if (!stockData?.chamber) return 0;

    return stockData.chamber.reduce(
      (sum: number, ch: StockChamber) => sum + Number(ch.quantity || 0),
      0,
    );
  }, [stockData?.chamber]);

  const orderDetail: OrderProps = useMemo(() => {
    return {
      title: otherProductData?.product_name ?? "",
      name: otherProductData?.company ?? "",
      description: [
        {
          name: "Quantity",
          value: `${totalQuantity} kg`,
          iconKey: "database",
        },
      ],
      helperDetails: [
        {
          name: "Stored",
          value: formatDate(new Date().toISOString(), "MMM d, yyyy"),
        },
        {
          name: "Est. Dis",
          value: formatDate(new Date().toISOString(), "MMM d, yyyy"),
        },
      ],
    };
  }, [
    otherProductData?.product_name,
    otherProductData?.company,
    totalQuantity,
  ]);

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
      },
    );

  const totalAdd = sumRecordValues(values.add_quantity);
  const totalSub = sumRecordValues(values.sub_quantity);

  const isAllZero = totalAdd === 0 && totalSub === 0;

  useEffect(() => {
    if (!stockData?.chamber) return;

    const addMap: Record<string, number> = {};
    const subMap: Record<string, number> = {};

    stockData.chamber.forEach((ch: StockChamber) => {
      addMap[ch.id] = 0;
      subMap[ch.id] = 0;
    });

    setField("add_quantity", addMap);
    setField("sub_quantity", subMap);
  }, [stockData?.chamber]);

  const onSubmit = () => {
    if (!otherProductData?.id) {
      toast.error("Product not loaded yet");
      return;
    }
    setIsLoading(true);
    const result = validateForm();
    if (!result.success) {
      setIsLoading(false);
      return;
    }

    const addMap = result.data.add_quantity || {};
    const subMap = result.data.sub_quantity || {};
    const chambersPayload = stockData!.chamber.map((ch: StockChamber) => ({
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
        onSuccess: (res, { othersItemId, id }) => {
          const { stock, item } = res;

          //Update STOCK query correctly
          queryClient.invalidateQueries({
            queryKey: ["other-product-stock", item.product_id],
          });

          //Update product details
          queryClient.setQueryData(
            ["others-product-by-id", othersItemId],
            (old: any) => {
              if (!old) return old;
              return {
                ...old,
                chambers: stock.chamber,
                stored_quantity: item.stored_quantity,
              };
            },
          );
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error("Failed to update quantity");
          console.error("Update error", error);
        },
      },
    );
  };

  if (!otherProductData) {
    return <OverlayLoader />;
  }

  return (
    <Require admin>
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
              <Tabs
                tabTitles={["Dispatch Entry", "Dispatch History"]}
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
                  {stockData?.chamber?.map((chamber: StockChamber) => (
                    <ItemsRepeater
                      key={chamber.id}
                      title={
                        chamberMap[chamber.id]?.chamber_name ??
                        "Unknown Chamber"
                      }
                      description={chamber.quantity + " kg"}
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
                <View
                  style={[
                    styles.flexGrow,
                    styles.VStack,
                    styles.gap8,
                    styles.mt16,
                  ]}
                >
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                      <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refetchOtherProductHistory}
                        tintColor={getColor("green", 500)}
                      />
                    }
                  >
                    {isLoading ? (
                      <OverlayLoader />
                    ) : otherProductActivities?.length > 0 ? (
                      <ActivitesFlatList
                        style={{ paddingHorizontal: 16 }}
                        onPress={() => {}}
                        isVirtualised={false}
                        activities={otherProductActivities}
                      />
                    ) : (
                      <View style={EmptyStateStyles.center}>
                        <EmptyState
                          stateData={{
                            title: "No dispatch history yet",
                            description: "No transactions recorded.",
                          }}
                          image={NoContractorBatchImg}
                          color="green"
                        />
                      </View>
                    )}
                  </ScrollView>
                </View>
              </Tabs>
            </View>
          </ScrollView>
          <Button
            variant="fill"
            onPress={onSubmit}
            disabled={!isValid || isAllZero || !otherProductData}
            style={styles.mx16}
          >
            Done
          </Button>
        </View>
        {isLoading && !updateMutation.isSuccess && <OverlayLoader />}
      </View>
    </Require>
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
  supervisroCard: {
    backgroundColor: getColor("light", 200),
    paddingHorizontal: 16,
  },
  pX16: {
    paddingHorizontal: 16,
  },
});

export default OthersProductScreen;
