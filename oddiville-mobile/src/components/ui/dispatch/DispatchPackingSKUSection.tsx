import { StyleSheet, View } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { B4, H6 } from '../../typography/Typography';
import { getColor } from '@/src/constants/colors';
import Select from '../Select';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { useProductPackage } from '@/src/hooks/productItems';
import PackingSizeList from './components/PackingSizeList';
import { DispatchPackagingChambers } from '@/src/types/domain/packing/packing.types';

type Props = {
    setIsLoading: (v: boolean) => void;
    isCurrentProduct: boolean;
};
const DispatchPackingSKUSection = ({ setIsLoading, isCurrentProduct }: Props) => {
    const { validateAndSetData } = useValidateAndOpenBottomSheet();

    const [chambers, setChambers] = useState<DispatchPackagingChambers[]>([
        {
            chamberName: "Chamber 1",
            packages: [
                {
                    size: 100,
                    unit: "gm",
                    count: 38,
                }
            ]
        },
        {
            chamberName: "Chamber 2",
            packages: [
                {
                    size: 500,
                    unit: "gm",
                    count: 55,
                },
                {
                    size: 250,
                    unit: "gm",
                    count: 70,
                },
            ]
        },
    ])
    const {
        productPackages,
        isLoading: productPackagesLoading,
        refetch: productPackageRefetch,
        isFetching: productPackageFetching,
    } = useProductPackage();

    useEffect(() => {
        setIsLoading(productPackagesLoading || productPackageFetching)
    }, [productPackagesLoading, productPackageFetching, setIsLoading])
    

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
                        <View style={{ flex: 0.7 }}>
                            <Select
                                showOptions={false}
                                options={["Pouch size"]}
                                onPress={handleTogglePackageSizeBottomSheet}
                                disabled={false}
                            />
                        </View>
                        <View
                            style={[
                                styles.quantityCard,
                                {
                                    borderColor: getColor("green", 500),
                                },
                            ]}
                        >
                            <View style={{ alignItems: "center" }}>
                                <H6>Packed Qty</H6>
                                <B4 style={{ color: getColor("green", 500) }}>
                                    kg
                                </B4>
                            </View>

                            <View style={{ alignItems: "center" }}>
                                <H6>RM Used</H6>
                                <B4 style={{ color: getColor("green", 500) }}>
                                    kg
                                </B4>
                            </View>
                        </View>
                    </View>

                    <PackingSizeList chambers={chambers} />
                </View>
            </>
        )
    }
}

export default DispatchPackingSKUSection

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
})