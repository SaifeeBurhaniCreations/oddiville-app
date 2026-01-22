import { B1, H5 } from "@/src/components/typography/Typography"
import { getColor } from "@/src/constants/colors"
import { View } from "moti"
import { memo } from "react"
import { Pressable } from "react-native"
import ChevronComponent from "../../ChevronComponent"
import { PackageInputsByKey, PackageInputState, DispatchPackagingChambers } from "@/src/types/domain/packing/packing.types"
import { StyleSheet } from "react-native"
import Input from "../../Inputs/Input"
import TrashIcon from "@/src/components/icons/common/TrashIcon"
import { mapPackageIcon, toPackageIconInput } from "@/src/utils/common"

type ChamberAccordionProps = {
    chamber: DispatchPackagingChambers
    isOpen: boolean
    isLastChamber: boolean
    onToggle: (name: string) => void
    inputs: PackageInputsByKey
    onChangeInput: (
        chamberName: string,
        packageKey: string,
        field: keyof PackageInputState,
        value: number
    ) => void,
    handleRemovePackage: (chamberName: string, packageKey: string) => void
}

const ChamberAccordion = memo(
    ({ chamber, isOpen, isLastChamber, onToggle, inputs, onChangeInput, handleRemovePackage }: ChamberAccordionProps) => {
        const packages = chamber.packages;

        return (
            <View style={styles.accordianCard}>
                <Pressable
                    style={styles.accordianHeader}
                    onPress={() => onToggle(chamber.chamberName)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                >
                    <H5 style={{ color: getColor('light') }}>
                        {chamber.chamberName}
                    </H5>
                    <ChevronComponent open={isOpen} />
                </Pressable>

                {isOpen && (
                    <View style={styles.accordianBody}>
                        {packages.map((pkg, pkgIndex) => {
                            const isLastPackage = pkgIndex === packages.length - 1;
                            const isLastItem = isLastChamber && isLastPackage;
                            const Icon = mapPackageIcon(toPackageIconInput(pkg));

                            const packageKey = `${pkg.size}-${pkg.unit}`

                            return (
                                <View
                                    key={`${pkg.size}-${pkg.unit}`}
                                    style={[
                                        styles.accordianGroup,
                                        isLastItem && styles.lastAccordianGroup,
                                    ]}
                                >
                                        <View style={styles.packageRow}>
                                            <View style={styles.row}>
                                                <View style={styles.iconWrapper}>
                                                {Icon && <Icon color={getColor("green")} size={28} />}

                                                </View>
                                                <B1>
                                                    {pkg.size}{pkg.unit}
                                                    {` (${pkg.count})`}
                                                </B1>
                                            </View>

                                            <View style={[styles.Hstack, { flex: 0.8 }]}>
                                                <Input
                                                    placeholder="Enter count"
                                                    keyboardType="numeric"
                                                value={inputs[packageKey]?.bagCount?.toString() ?? ""}
                                                onChangeText={(text: string) =>
                                                    onChangeInput(
                                                        chamber.chamberName,
                                                        packageKey,
                                                        "bagCount",
                                                        Number(text)
                                                    )
                                                }
                                                />
                                                <Pressable
                                                onPress={() => handleRemovePackage(chamber.chamberName, packageKey)}
                                                >
                                                    <TrashIcon color={getColor("green")} />
                                                </Pressable>
                                            </View>
                                        </View>
                                        <Input
                                            placeholder="Enter packet per bag"
                                            keyboardType="numeric"
                                        value={inputs[packageKey]?.packetsPerBag?.toString() ?? ""}
                                        onChangeText={(text: string) =>
                                            onChangeInput(
                                                chamber.chamberName,
                                                packageKey,
                                                "packetsPerBag",
                                                Number(text)
                                            )
                                        }
                                        />
                                </View>
                            )
                        })}
                    </View>
                )}
            </View>
        )
    }
)

export default ChamberAccordion;

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