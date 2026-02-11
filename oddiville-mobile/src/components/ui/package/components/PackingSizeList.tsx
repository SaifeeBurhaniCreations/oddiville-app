import { Pressable, StyleSheet, View } from "react-native";
import React, { memo, useCallback, useEffect, useMemo } from "react";
import {
    PackageInputsByKey,
    PackageInputState,
    PackingPackages,
} from "@/src/types/domain/packing/packing.types";
import Input from "../../Inputs/Input";
import { getColor } from "@/src/constants/colors";
import TrashIcon from "@/src/components/icons/common/TrashIcon";
import { B1, B4 } from "@/src/components/typography/Typography";
import { IconProps } from "@/src/types";
import ChamberIcon from "@/src/components/icons/common/ChamberIcon";
import { OutputBagPackaging, Packaging } from "@/src/hooks/useChamberStock";
import { usePackingChambersForSKU } from "@/src/hooks/packing/usePackingChambersForSKU";
import { normalizeKgToGrams, toChamberPackage } from "@/src/utils/packing/normalizers";

type StockChamber = {
    id: string;
    name: string;
    quantity: number;
    rating: number;
};

const ChamberRow = memo(
    ({
        chamber,
        packaging,
        value,
        onChange,
    }: {
        chamber: StockChamber;
        packaging: OutputBagPackaging;
        value: number | undefined;
        onChange: (chamberId: string, value: string) => void;
    }) => {
        const existingKg = chamber.quantity;

        const packetKg =
            normalizeKgToGrams(packaging.size.value, packaging.size.unit) / 1000;

        const kgPerBag = packetKg * packaging.packetsPerBag;

            const existingBags = Math.floor(existingKg / kgPerBag);
            const addedBags = Number(value || 0);

            const totalBags = existingBags + addedBags;
            const totalKg = existingKg + addedBags * kgPerBag;


        // utils
        const fmtKg = (v: number) => v.toFixed(2);
        const fmtBags = (v: number) => Math.floor(v);

        return (
            <View style={[styles.chamberCard, styles.borderBottom]}>
                <View style={styles.Hstack}>
                    <View style={styles.iconWrapper}>
                        <ChamberIcon color={getColor("green")} size={32} />
                    </View>

                    <View style={styles.Vstack}>
                        <B1>{String(chamber.name).slice(0, 12)}...</B1>
                        <B4 numberOfLines={1}>
                            {fmtKg(existingKg)} → {fmtKg(totalKg)}kg ({fmtBags(totalBags)}b)
                        </B4>
                    </View>
                </View>

                <View style={{ flex: 0.85 }}>
                    <Input
                        placeholder="Count"
                        addonText="bags"
                        mask="addon"
                        post
                        keyboardType="numeric"
                        value={String(value ?? "")}
                        onChangeText={(text: string) => onChange(chamber.id, text)}
                    />
                </View>
            </View>
        );
    }
);

const PackingSizeList = ({
    pkg,
    isLastItem,
    isFirstItem,
    inputs, 
    onChangeInput,
    handleRemovePackage,
    Icon,
    productName,
    packageErrors,
    onOverPackChange,
}: {
    pkg: PackingPackages;
    isLastItem: boolean;
    isFirstItem: boolean;
    inputs: PackageInputsByKey;
    packageErrors: Record<string, string>;
    onChangeInput: (
        packageKey: string,
        field: keyof PackageInputState,
        value: number | undefined | Record<string, number> | ((prev: any) => any)
    ) => void;
    handleRemovePackage: (packageKey: string) => void;
    Icon: React.FC<IconProps> | null;
    productName: string;
    onOverPackChange: (key: string, value: boolean) => void;

}) => {
    const packageKey = `${pkg.size}-${pkg.unit}`;

    const skuError = packageErrors[packageKey];

    const bagCount = inputs[packageKey]?.bagCount ?? 0;
    const packetsPerBag = inputs[packageKey]?.packetsPerBag ?? 0;
    // const usedPackets = bagCount * packetsPerBag;
    const usedPackets = useMemo(
        () => bagCount * packetsPerBag,
        [bagCount, packetsPerBag]
    );

    const remainingPackets = useMemo(
        () => Math.max(pkg.count - usedPackets, 0),
        [pkg.count, usedPackets]
    );

    // const totalPackets = Math.max(pkg.count - usedPackets, 0);

    const chamberPackage = toChamberPackage(pkg, packetsPerBag);

    const { data: chamberOptions, isLoading } = usePackingChambersForSKU({
        productName,
        sku: pkg,
        packetsPerBag,
    });

    const overPacked = usedPackets > pkg.count;

    const updateChamberBags = useCallback(
        (chamberId: string, value: string) => {
            const num = Number(value);

            onChangeInput(packageKey, "chambers", prev => ({
                ...(prev ?? {}),
                [chamberId]: Number.isNaN(num) ? 0 : num,
            }));
        },
        [onChangeInput, packageKey]
    );
    useEffect(() => {
        onOverPackChange(packageKey, overPacked);
    }, [overPacked]);


    return (
        <View
            key={`${pkg.size}-${pkg.unit}`}
            style={[
                styles.PkgGroup,
                isLastItem && styles.lastPkgGroup,
                isFirstItem && styles.firstPkgGroup,
                skuError && {
                    borderColor: getColor("red", 500),
                },
            ]}
        >
            <View style={styles.packageRow}>
                <View style={styles.row}>
                    <View style={styles.iconWrapper}>
                        {Icon && <Icon color={getColor("green")} size={28} />}
                    </View>
                    <B1>
                        {pkg.size}
                        {pkg.unit}
                        {` (${remainingPackets})`}
                    </B1>
                </View>

                <View style={[styles.Hstack, { flex: 0.8 }]}>
                    <Input
                        placeholder="Enter count"
                        keyboardType="numeric"
                        value={String(bagCount ?? "")}
                        onChangeText={(text: string) => {
                            if (text === "") {
                                onChangeInput(packageKey, "bagCount", undefined);
                                return;
                            }

                            const value = Number(text);
                            if (!Number.isNaN(value)) {
                                onChangeInput(packageKey, "bagCount", value);
                            }
                        }}
                    />
                    <Pressable onPress={() => handleRemovePackage(packageKey)}>
                        <TrashIcon color={getColor("green")} />
                    </Pressable>
                </View>
            </View>
            <Input
                placeholder="Enter packet per bag"
                keyboardType="numeric"
                value={String(packetsPerBag ?? "")}
                onChangeText={(text: string) =>
                    onChangeInput(packageKey, "packetsPerBag", Number(text))
                }
            />
            {skuError && <B4 color={getColor("red")}>{skuError}</B4>}
            {chamberOptions.map((chamber) => (
                <ChamberRow
                    key={chamber.chamberId}
                    chamber={{
                        id: chamber.chamberId,
                        name: chamber.chamberName,
                        quantity: chamber.availableKg,
                        rating: 5,
                    }}
                    packaging={chamberPackage}
                    value={inputs[packageKey]?.chambers?.[chamber.chamberId]}
                    onChange={updateChamberBags}
                />
            ))}
        </View>
    );
};

export default PackingSizeList;

const styles = StyleSheet.create({
    accordianBody: {
        flexDirection: "column",
        backgroundColor: getColor("light"),
    },
    packageRow: {
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconWrapper: {
        padding: 4,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: getColor("green", 100, 0.3),
    },
    Hstack: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    seprator: {
        borderColor: getColor("green", 100),
        borderBottomWidth: 1,
    },
    PkgGroup: {
        flexDirection: "column",
        gap: 8,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        padding: 8,
        borderColor: getColor("green", 100),
    },
    lastPkgGroup: {
        borderBottomWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    firstPkgGroup: {
        borderTopWidth: 1,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderColor: getColor("green", 100),
        paddingBottom: 16,
    },
    cardBody: {
        backgroundColor: getColor("light"),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        paddingHorizontal: 8,
        flexDirection: "column",
        gap: 16,
    },
    chamberCard: {
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row",
        flex: 1,
        paddingTop: 16,
    },
    Vstack: {
        flexDirection: "column",
    },
    JustifyBetween: {
        justifyContent: "space-between",
    },
});
