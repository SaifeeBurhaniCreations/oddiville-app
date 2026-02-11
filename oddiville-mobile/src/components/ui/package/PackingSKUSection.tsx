    import { FlatList, StyleSheet, useWindowDimensions, View } from "react-native";
    import React, { useCallback, useEffect, useMemo, useState } from "react";
    import { B4, H6 } from "../../typography/Typography";
    import { getColor } from "@/src/constants/colors";
    import Select from "../Select";
    import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
    import { useProductPackage } from "@/src/hooks/productItems";
    import PackingSizeList from "./components/PackingSizeList";
    import { mapPackageIcon, toPackageIconInput } from "@/src/utils/common";
    import { buildPackagingPlan } from "@/src/utils/packing/builders";
    import { useDispatch, useSelector } from "react-redux";
    import { RootState } from "@/src/redux/store";
    import { usePackingPackages } from "@/src/hooks/packing/usePackageCounts";
    import { normalizeSelectedPackages } from "@/src/utils/packing/normalizers";
    import EmptyState, { EmptyStateStyles } from "../EmptyState";
    import { sortByNumber } from "@/src/utils/numberUtils";
    import { PackingFormController } from "@/src/hooks/packing/usePackingForm";
import { usePackageInputs } from "@/src/hooks/packing/usePackageInputs";

    type Props = {
        setIsLoading: (v: boolean) => void;
        isCurrentProduct: boolean;
        form: PackingFormController;
        onOverPackChange: (key: string, value: boolean) => void;
          rmUsed: any[];
    };

const PackingSKUSection = ({ setIsLoading, isCurrentProduct, form, onOverPackChange, rmUsed }: Props) => {
        const dispatch = useDispatch();
        const { width } = useWindowDimensions();
        const isCompact = width < 390;
        const rawSelectedPackages = useSelector(
            (state: RootState) => state.packageSize.selectedSizes
        );
        
        const selectedProductName = useSelector(
            (state: RootState) => state.product.productName
        );

        const { validateAndSetData } = useValidateAndOpenBottomSheet();

        const selectedPackages = useMemo(
            () => normalizeSelectedPackages(rawSelectedPackages),
            [rawSelectedPackages]
        );

        const isValidProduct =
            !!selectedProductName &&
            selectedProductName !== "Select product";

        const productName = isValidProduct
            ? selectedProductName
            : null;


        const { data: packages, isLoading } = usePackingPackages(
            isValidProduct ? productName : null,
            selectedPackages
        );

        const {
            productPackages,
            isLoading: productPackagesLoading,
            refetch: productPackageRefetch,
            isFetching: productPackageFetching,
        } = useProductPackage();

        const {
            packageInputs,
            updatePackageInput,
            removePackage,
            packageErrors,
        } = usePackageInputs();

        const packedBags = useMemo(() => {
            return form.values.packagingPlan.reduce(
                (sum, p) => sum + (p.bagsProduced || 0),
                0
            );
        }, [form.values.packagingPlan]);

        const packedPackets = useMemo(() => {
            return form.values.packagingPlan.reduce(
                (sum, p) => sum + (p.totalPacketsProduced || 0),
                0
            );
        }, [form.values.packagingPlan]);

// const rmUsedBags = useMemo(() => {
//   return Object.values(form.values.rmInputs || {})
//     .flatMap(rm => Object.values(rm))
//     .reduce((sum, v) => sum + Number(v || 0), 0);
// }, [form.values.rmInputs]);
//  const rmMatchStatus = useMemo(() => {
//             if (rmUsedBags === 0) return "neutral";
//             if (rmUsedBags < packedBags) return "less";
//             if (rmUsedBags > packedBags) return "more";
//             return "equal";
//         }, [rmUsedBags, packedBags]);

const rmUsedKg = useMemo(() => {
  return rmUsed.reduce((sum: number, rm) => {
    const kgPerBag =
      rm.packaging?.size?.unit === "kg"
        ? Number(rm.packaging.size.value)
        : 0;

    const usedBags =
      Object.values(form.values.rmInputs?.[rm.product_name] || {})
        .reduce((s, v) => s + Number(v || 0), 0);

    return sum + usedBags * kgPerBag;
  }, 0);
}, [rmUsed, form.values.rmInputs]);
       
        // const rmColor = {
        //     neutral: getColor("green", 700),
        //     less: getColor("red", 500),
        //     more: getColor("yellow", 500),
        //     equal: getColor("green", 500),
        // }[rmMatchStatus];

const packedKg = useMemo(() => {
  return form.values.packagingPlan.reduce((sum, p) => {
    const packetKg =
      p.packet.unit === "gm"
        ? p.packet.size / 1000
        : p.packet.size;

    const kgPerBag = p.packet.packetsPerBag * packetKg;

    return sum + kgPerBag * p.bagsProduced;
  }, 0);
}, [form.values.packagingPlan]);

const kgMatchStatus = useMemo(() => {
  if (rmUsedKg === 0 || packedKg === 0) return "neutral";
  if (rmUsedKg < packedKg) return "less";
  if (rmUsedKg > packedKg) return "more";
  return "equal";
}, [rmUsedKg, packedKg]);

        const kgColor = {
            neutral: getColor("green", 700),
            less: getColor("red", 500),
            more: getColor("yellow", 500),
            equal: getColor("green", 500),
        }[kgMatchStatus];

        useEffect(() => {
            setIsLoading(productPackagesLoading || productPackageFetching || isLoading);
        }, [productPackagesLoading, productPackageFetching, isLoading, setIsLoading]);

        useEffect(() => {
            const timeout = setTimeout(() => {
                const plan = buildPackagingPlan(packages, packageInputs);
                form.setPackagingPlan(plan);
            }, 400);

            return () => clearTimeout(timeout);
        }, [packages, packageInputs]);

        const handleRemovePackage = (packageKey: string) => {
            // dispatch();
        };

        const handleTogglePackageSizeBottomSheet = useCallback(async () => {
            if (!productPackages) return;
            const choosePackaging = {
                sections: [
                    {
                        type: "title-with-details-cross",
                        data: {
                            title: "Packaging size",
                        },
                    },
                    {
                        type: "search",
                        data: {
                            searchTerm: "",
                            placeholder: "Search size",
                            searchType: "add-package",
                        },
                    },
                    {
                        type: "package-size-choose-list",
                        data: {
                            list: productPackages?.map((pack) => {
                                const unit = pack?.unit?.toLowerCase();
                                let grams = Number(pack.size);

                                switch (unit) {
                                    case "kg":
                                        grams = Number(pack.size) * 1000;
                                        break;
                                    case "gm":
                                        grams = Number(pack.size);
                                        break;
                                    default:
                                        return null;
                                }

                                let icon = "paper-roll";

                                if (grams <= 250) {
                                    icon = "paper-roll";
                                } else if (grams <= 500) {
                                    icon = "bag";
                                } else {
                                    icon = "big-bag";
                                }
                                return {
                                    name: `${pack?.rawSize} ${pack?.unit}`,
                                    size: pack.size,
                                    unit: pack.unit,
                                    icon: icon,
                                    count: Number(pack?.quantity),
                                    isChecked: false,
                                };
                            }),
                            source: "package",
                        },
                    },
                ],
                buttons: [
                    {
                        text: "Add",
                        variant: "fill",
                        color: "green",
                        alignment: "full",
                        disabled: false,
                        actionKey: "add-package-by-product",
                    },
                ],
            };
            await validateAndSetData("Abc1", "choose-package", choosePackaging);
            setIsLoading(false);
        }, [productPackages, validateAndSetData]);

        if (isCurrentProduct) {
            return (
                <>
                    <View style={styles.packageWrapper}> 
                        <View style={[styles.sizeQtyRow]}>
                            <View style={{ flex: 0.45 }}>
                                <Select
                                    showOptions={false}
                                    options={["SKU's"]}
                                    onPress={handleTogglePackageSizeBottomSheet}
                                    disabled={false}
                                />
                            </View>
                            <View
                                style={[
                                    styles.quantityCard,
                                    isCompact && styles.quantityCardVertical,
                                    {
                                       borderColor:
                            kgMatchStatus === "equal"
                                ? getColor("green", 500)
                                : getColor("green", 100),

                                    },
                                ]}
                            >
                                <View style={{ alignItems: "center" }}>
                                    <H6>Packed Qty</H6>
                                    <B4 style={{ color: getColor("green", 500) }}>
                                        {packedBags} bags · {packedPackets} packets
                                    </B4>
                                </View>
                                {isCompact && <View style={styles.divider} />}
                                <View style={{ alignItems: "center" }}>
                                <H6>RM Used</H6>
                                <B4 style={{ color: kgColor }}>
                                    {rmUsedKg} kg / {packedKg} kg
                                </B4>
                                </View>

                            </View>
                        </View>
                        <FlatList
                            data={sortByNumber(packages, "size")}
                            keyExtractor={(item) => item.size + "-" + item.unit}
                            scrollEnabled={false}
                            renderItem={({ item, index }) => {
                                const Icon = mapPackageIcon(toPackageIconInput(item));

                                return (
                                    <PackingSizeList
                                        pkg={item}
                                        isLastItem={index === packages.length - 1}
                                        isFirstItem={index === 0}
                                        Icon={Icon}
                                        inputs={packageInputs}
                                        onChangeInput={updatePackageInput}
                                        handleRemovePackage={handleRemovePackage}
                                        productName={selectedProductName ?? "Select Product"}
                                        packageErrors={packageErrors}
                                        onOverPackChange={onOverPackChange}
                                    />
                                );
                            }}
                            ListEmptyComponent={() => (
                                <View style={EmptyStateStyles.center}>
                                    <EmptyState
                                        stateData={{
                                            title: "No packages found",
                                            description: "No packages found",
                                        }}
                                        compact
                                    />
                                </View>
                            )}
                        />
                    </View>
                </>
            );
        }
    };

    export default PackingSKUSection;

    const styles = StyleSheet.create({
        packageWrapper: {
            paddingHorizontal: 12,
            gap: 8,
        },
        sizeQtyRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        quantityCard: {
            boxShadow: "0px 6px 6px -3px rgba(0, 0, 0, 0.06)",
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: getColor("green", 100),
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: getColor("light", 400),
            flex: 1,
            gap: 16,
        },
        quantityCardVertical: {
  flexDirection: "column",
  gap: 12,
},

divider: {
  height: 1,
  width: "100%",
  backgroundColor: getColor("green", 100),
},

    });
