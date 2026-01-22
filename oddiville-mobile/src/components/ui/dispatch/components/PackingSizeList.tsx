import { StyleSheet, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { H4 } from '@/src/components/typography/Typography'
import { getColor } from '@/src/constants/colors'
import { PackageFormState, PackageInputState, DispatchPackagingChambers } from '@/src/types/domain/packing/packing.types'
import ChamberAccordion from './ChamberAccordion'
import { useDispatch } from 'react-redux';

const PackingSizeList = ({ chambers }: { chambers: DispatchPackagingChambers[] }) => {
        const dispatch = useDispatch();
    
    const [accodian, setAccordian] = useState<Record<string, boolean>>({})
    const [packageInputs, setPackageInputs] = useState<PackageFormState>({})
    const toggleAccordian = useCallback((chamberName: string) => {
        setAccordian(prev => ({
            ...prev,
            [chamberName]: !prev[chamberName],
        }))
    }, [])

    const updatePackageInput = useCallback(
        (
            chamberName: string,
            packageKey: string,
            field: keyof PackageInputState,
            value: number
        ) => {
            setPackageInputs(prev => ({
                ...prev,
                [chamberName]: {
                    ...prev[chamberName],
                    [packageKey]: {
                        ...prev[chamberName]?.[packageKey],
                        [field]: value,
                    },
                },
            }))
        },
        []
    )

    const handleRemovePackage = (chamberName: string, packageKey: string) => {
        // dispatch();
    };

    return (
        <View style={styles.container}>
            <H4>Packing Size</H4>
            <View style={styles.chamberAccordian}>
                {chambers.map((chamber, index) => (
                    <ChamberAccordion
                        key={chamber.chamberName}
                        chamber={chamber}
                        isOpen={!!accodian[chamber.chamberName]}
                        isLastChamber={index === chambers.length - 1}
                        onToggle={toggleAccordian}
                        inputs={packageInputs[chamber.chamberName] || {}}
                        onChangeInput={updatePackageInput}
                        handleRemovePackage={handleRemovePackage}
                    />
                ))}
            </View>
        </View>
    )
}

export default PackingSizeList

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        gap: 8,
    },
    chamberAccordian: {
        flex: 1,
        flexDirection: "column",
    },
    accordianCard: {
        flexDirection: "column",
    },
    accordianHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: getColor("green"),
    },
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
    accordianGroup: {
        flexDirection: "column",
        gap: 8,
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        padding: 8,
        borderColor: getColor("green", 100),
    },
    lastAccordianGroup: {
        borderBottomWidth: 1,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    }
})