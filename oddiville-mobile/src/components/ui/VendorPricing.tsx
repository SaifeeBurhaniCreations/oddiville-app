import { StyleSheet, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { getColor } from '@/src/constants/colors';
import { B2, H3, H5 } from '../typography/Typography';
import PriceInput from './Inputs/PriceInput';
import { VendorInputState } from '@/src/types';

const VendorPricing = ({
    values,
    totalWeight,
    onChangeVendors,
    showToast,
    vendorCount = 0,
}: {
    values: VendorInputState[];
    totalWeight: number;
    vendorCount: number;
    onChangeVendors: (vendors: VendorInputState[]) => void;
    showToast: (type: "success" | "error" | "info", message: string) => void;
}) => {
    const prevVendorCountRef = useRef<number | null>(null);

    // treat empty if quantity is undefined / null / '' / 0
    const qtyNum = (q: any) => {
        if (q === '' || q === undefined || q === null) return 0;
        return Number(q) || 0;
    };

    useEffect(() => {
        if (!values || values.length === 0) {
            prevVendorCountRef.current = vendorCount;
            return;
        }
    
        const activeCount = Math.min(vendorCount, values.length);
        if (activeCount === 0) {
            prevVendorCountRef.current = vendorCount;
            return;
        }
    
        const qtyNum = (q: any) => {
            if (q === '' || q === undefined || q === null) return 0;
            return Number(q) || 0;
        };
    
        // Check only the *active* vendors
        const activeSlice = values.slice(0, activeCount);
        const anyHasValueInActive = activeSlice.some(v => qtyNum(v.quantity) > 0);
        const allEmptyInActive = activeSlice.every(v => qtyNum(v.quantity) === 0);
    
        if (activeCount === 1) {
            const updated = [...values];
            if (qtyNum(updated[0].quantity) === 0) {
                updated[0] = { ...updated[0], quantity: totalWeight };
                onChangeVendors(updated);
            }
            prevVendorCountRef.current = vendorCount;
            return;
        }
    
        if (activeCount > 1 && allEmptyInActive) {
            if (totalWeight < activeCount) {
                prevVendorCountRef.current = vendorCount;
                return;
            }
    
            const updated = [...values];
            const base = Math.floor(totalWeight / activeCount);
            let remainder = totalWeight - base * activeCount;
    
            for (let i = 0; i < activeCount; i++) {
                updated[i] = { ...updated[i], quantity: base + (remainder > 0 ? 1 : 0) };
                if (remainder > 0) remainder--;
            }
            onChangeVendors(updated);
        }
    
        prevVendorCountRef.current = vendorCount;
    }, [vendorCount, totalWeight, values]);
    
    const enforceEachHasAtLeastOne = (currentValues: VendorInputState[]) => {
        const updated = [...currentValues];
        const n = updated.length;

        if (totalWeight < n) {
            showToast(
                'error',
                `Total weight (${totalWeight} Kg) is less than number of vendors (${n}). Some vendors cannot be assigned at least 1 Kg.`
            );
            return updated;
        }

        let sum = updated.reduce((s, v) => s + qtyNum(v.quantity), 0);

        // assign 1 to empties
        for (let i = 0; i < n; i++) {
            if (qtyNum(updated[i].quantity) === 0) {
                updated[i].quantity = 1;
                sum += 1;
            }
        }

        if (sum > totalWeight) {
            let over = sum - totalWeight;
            for (let i = n - 1; i >= 0 && over > 0; i--) {
                const q = qtyNum(updated[i].quantity);
                if (q > 1) {
                    const canTake = Math.min(q - 1, over);
                    updated[i].quantity = q - canTake;
                    over -= canTake;
                }
            }
            if (over > 0) {
                showToast('error', 'Unable to ensure every vendor has >=1 Kg without exceeding totalWeight.');
            }
        } else if (sum < totalWeight) {
            let remaining = totalWeight - sum;
            for (let i = 0; i < n && remaining > 0; i++) {
                updated[i].quantity = qtyNum(updated[i].quantity) + 1;
                remaining--;
            }
        }

        return updated;
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <H5 color={getColor('light')}>Enter price for each vendor</H5>
                <B2 color={getColor('light')}>
                    {totalWeight - (values || [])?.reduce((sum, v) => sum + qtyNum(v.quantity), 0)} Kg left
                </B2>
            </View>

            <View style={styles.cardBody}>
                {(values || [])?.map((data, index) => (
                    <View
                        key={data.name}
                        style={[
                            styles.labelInput,
                            index < values?.length - 1 && styles.separator,
                        ]}
                    >
                        <H3>{data?.name}</H3>

                        <View style={styles.justifyRow}>
                            <PriceInput
                                value={data.price === 0 ? '' : String(data.price ?? '')}
                                keyboardType="decimal-pad"
                                onChangeText={(priceText: string) => {
                                    const updated = [...values];
                                    
                                    // allow empty
                                    if (priceText === '') {
                                    updated[index].price = 0; // number
                                    onChangeVendors(updated);
                                    return;
                                    }

                                    const cleaned = priceText.replace(/[^0-9.]/g, '');

                                    const parsed = cleaned;
                                    console.log(!Number.isNaN(cleaned));
                                    if (!Number.isNaN(parsed)) {
                                    updated[index].price = parsed;  
                                    onChangeVendors(updated);
                                    }
                                }}
                                placeholder="Price"
                                addonText="Rs"
                                style={styles.flexGrow}
                            />


                            <PriceInput
                                value={qtyNum(data.quantity) === 0 ? '' : String(qtyNum(data.quantity))}
                                onChangeText={(quantity: string) => {
                                    const updated = [...values];
                                    if (quantity === '') {
                                        updated[index].quantity = 0;
                                        onChangeVendors(updated);
                                        return;
                                    }

                                    const newQty = Number(quantity);
                                    if (isNaN(newQty) || newQty < 0) {
                                        return;
                                    }

                                    const totalQtyExcludingCurrent = values.reduce((sum, v, i) => {
                                        if (i !== index) return sum + qtyNum(v.quantity);
                                        return sum;
                                    }, 0);

                                    const remainingQty = totalWeight - totalQtyExcludingCurrent;

                                    if (newQty > remainingQty) {
                                        updated[index].quantity = remainingQty;
                                        onChangeVendors(updated);
                                        showToast('error', `Only ${remainingQty} Kg left to assign. Value has been adjusted.`);
                                    } else {
                                        updated[index].quantity = newQty;
                                        onChangeVendors(updated);
                                    }
                                }}
                                onBlur={() => {
                                    if (vendorCount > 1) {
                                        const updated = enforceEachHasAtLeastOne(values);
                                        onChangeVendors(updated);
                                    }
                                }}
                                placeholder="Enter qty."
                                addonText="Kg"
                                style={styles.flexGrow}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default VendorPricing;

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor('green'),
        borderRadius: 16,
    },
    cardHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardBody: {
        backgroundColor: getColor('light'),
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        gap: 12,
    },
    labelInput: {
        flexDirection: 'column',
        gap: 16,
    },
    justifyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    flexGrow: {
        flex: 1,
    },
    separator: {
        borderBottomWidth: 1,
        borderColor: getColor('green', 100),
        paddingBottom: 16,
    },
});