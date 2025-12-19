  // 1. React and React Native core
  import React, { useState, useMemo, useCallback } from "react";
  import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    RefreshControl,
  } from "react-native";

  // 2. Third-party dependencies
  // No items of this type

  // 3. Project components
  import PageHeader from "@/src/components/ui/PageHeader";
  import Tabs from "@/src/components/ui/Tabs";
  import RadioGroup from "@/src/components/ui/RadioGroup";
  import BottomSheet from "@/src/components/ui/BottomSheet";
  import ActivitesFlatList from "@/src/components/ui/ActivitesFlatList";
  import AddSingleContractor from "@/src/components/ui/Contractor/AddSingleContractor";
  import AddMultipleContractor from "@/src/components/ui/Contractor/AddMultipleContractor";
  import DetailsToast from "@/src/components/ui/DetailsToast";
  import Loader from "@/src/components/ui/Loader";

  // 4. Project hooks
  import { useAppNavigation } from "@/src/hooks/useAppNavigation";
  import {
    useFormattedContractors,
    useContractorSummary,
    useCreateContractor,
    WorkLocation,
    FormattedContractor,
  } from "@/src/hooks/useContractor";

  // 5. Project constants/utilities
  import { getColor } from "@/src/constants/colors";

  // 6. Types
  import { ActivityProps } from "@/src/types";
  import { BottomSheetSchemaKey } from "@/src/schemas/BottomSheetSchema";
  import { B2 } from "@/src/components/typography/Typography";
  import EmptyState from "@/src/components/ui/EmptyState";

  // 7. Schemas
  // No items of this type

  // 8. Assets
  import NoContractorBatchImg from "@/src/assets/images/illustrations/no-contractor-batch.png"
  import BackButton from "@/src/components/ui/Buttons/BackButton";

  const options = [{ text: "Add multiple" }, { text: "Add single" }];

  const SupervisorContractorScreen = () => {
    const { goTo } = useAppNavigation();
    const {
      createContractors,
      isLoading: creating,
      isError: createError,
    } = useCreateContractor();

    // Toast state
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | "info">(
      "info"
    );
    const [toastMessage, setToastMessage] = useState("");

    // Refresh state
    const [refreshing, setRefreshing] = useState(false);

    // Data hooks
    const {
      contractors,
      isLoading: contractorsLoading,
      error: contractorsError,
      refetch,
    } = useFormattedContractors();

    const showToast = useCallback(
      (type: "success" | "error" | "info", message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
      },
      []
    );

    const handleAddSingleContractor = useCallback(
      async (contractorPayload: {
        name: string;
        male_count: number;
        female_count: number;
        work_location: WorkLocation[];
      }) => {
        // contractorPayload should be { name, male_count, female_count, work_location? }
        try {
          await createContractors([
            {
              name: contractorPayload.name,
              male_count: Number(contractorPayload.male_count) || 0,
              female_count: Number(contractorPayload.female_count) || 0,
              work_location: contractorPayload.work_location || [],
            },
          ]);

          showToast("success", "Contractor created");
          await refetch?.();
        } catch (err: any) {
          showToast("error", err?.message || "Failed to create contractor");
        }
      },
      [createContractors, showToast, refetch]
    );

    const handleToggleToast = useCallback(
      (isError: boolean) => {
        if (isError)
          showToast(
            "error",
            "Total assigned count exceeds available worker count!"
          );
        else showToast("success", "Updated successfully!");
      },
      [showToast]
    );

    const handleContractorAdded = useCallback(
      (success: boolean, message: string) => {
        if (success) {
          showToast("success", message || "Contractor added successfully!");
        } else {
          showToast("error", message || "Failed to add contractor!");
        }
      },
      [showToast]
    );

    // Error handling
    const handleError = useCallback(
      (error: any) => {
        console.error("Contractor Screen Error:", error);
        showToast("error", "Failed to load contractor data. Please try again.");
      },
      [showToast]
    );

    const onRefresh = useCallback(async () => {
      try {
        setRefreshing(true);
        await refetch?.();
      } catch (err) {
        handleError(err);
      } finally {
        setRefreshing(false);
      }
    }, [refetch, handleError]);

    const activities = useMemo((): ActivityProps[] => {
      if (contractorsLoading || !contractors?.length) return [];

      return contractors.map((contractor: FormattedContractor) => ({
        id: contractor.id,
        itemId: contractor.id,
        title: `${contractor.displayTotalCount} workers`,
        type: contractor.name,
        createdAt: Number(contractor.updatedAt)
          ? new Date(contractor.updatedAt)
          : new Date(),
        extra_details: [
          `male: ${contractor.displayMaleCount}`,
          `female: ${contractor.displayFemaleCount}`,
          ...(contractor.workLocations?.length > 0
            ? [`locations: ${contractor.workLocations?.length}`]
            : []),
        ],
        identifier:
          contractor.totalCount > 20
            ? "order-ready"
            : contractor.totalCount > 10
            ? "in-progress-order"
            : "choose-product",
      }));
    }, [contractors, contractorsLoading]);

    const handleContractorPress = (
      id: string
    ) => {
      if (id) {
        goTo("labours-details", {
          wId: id,
          mode: "single",
        });
      } else {
        showToast("error", "Unable to view contractor details");
      }
    };

    const isLoading = contractorsLoading;

    if (contractorsError && !contractors?.length) {
      return (
        <View style={styles.pageContainer}>
          <PageHeader page={"Labour"} />
          <View style={styles.wrapper}>
            <View style={[styles.paddingTLR16]}>
              <BackButton label="Labours" backRoute="home" />
            </View>
            <View style={styles.errorContainer}>
              <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                <B2 color={getColor("light")}>Retry</B2>
              </TouchableOpacity>
            </View>
          </View>
          <BottomSheet color="green" />
          <DetailsToast
            type={toastType}
            message={toastMessage}
            visible={toastVisible}
            onHide={() => setToastVisible(false)}
          />
        </View>
      );
    }

    return (
      <View style={styles.pageContainer}>
        <PageHeader page={"Labour"} />
        <View style={styles.wrapper}>
          <View style={[styles.paddingTLR16]}>
            <BackButton label="Labours" backRoute="home" /> 
            </View>
          <Tabs
            tabTitles={["Today's worker", "History"]}
            headerStyle={{ padding: 16 }}
            color="green"
            style={styles.flexGrow}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={getColor("green", 500)}
                />
              }
            >
              <Tabs
                color="green"
                variant="ghost"
                renderTabHeader={({ activeTab, setActiveTab }) => (
                  <RadioGroup
                    style={{ paddingHorizontal: 16 }}
                    options={options}
                    selected={activeTab}
                    onSelect={(selected) =>
                      setActiveTab(
                        options.findIndex((opt) => opt.text === selected)
                      )
                    }
                  />
                )}
              >
                <AddMultipleContractor
                  setToast={handleToggleToast}
                />
                <AddSingleContractor
                  setToast={handleToggleToast}
                  onSubmit={handleAddSingleContractor}
                  isSubmitting={creating}
                />
              </Tabs>
            </ScrollView>

            {/* History Tab */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={getColor("green", 500)}
                />
              }
            >
              {isLoading ? (
                <View style={styles.loaderContainer}>
                  <Loader />
                </View>
              ) : activities?.length > 0 ? (
                <ActivitesFlatList
                  style={{paddingHorizontal: 16}}
                  onPress={handleContractorPress}
                  isVirtualised={false}
                  activities={activities}
                />
              ) : (
                <View style={styles.emptyState}>
                  <EmptyState
                              stateData={{
                                  title: "No contractor batches selected",
                                  description: "No Contractors yet.",
                              }}
                              image={NoContractorBatchImg}
                              color="green"
                          />
                </View>
              )}
            </ScrollView>
          </Tabs>
        </View>

        <BottomSheet color="green" />

        {/* Overlay for loading states if needed */}
        {false && <TouchableOpacity style={styles.overlay} activeOpacity={1} />}

        {/* Toast notifications */}
        <DetailsToast
          type={toastType}
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </View>
    );
  };

  export default SupervisorContractorScreen;

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
    },
    flexGrow: {
      flex: 1,
    },
    count: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    single: {
      flexDirection: "column",
      gap: 16,
      padding: 16,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: getColor("green", 500, 0.05),
      zIndex: 2,
    },
    emptyState: {
      flex: 1,
      flexDirection: "column",
      height: 200,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    retryButton: {
      padding: 12,
      backgroundColor: getColor("green", 500),
      borderRadius: 8,
      minWidth: 120,
      alignItems: "center",
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      minHeight: 200,
    },
      paddingTLR16: {
          paddingTop: 16,
          paddingLeft: 16,
          paddingRight: 16,
      },
  });
