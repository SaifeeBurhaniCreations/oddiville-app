// 1. React and React Native core
import { useState, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import BottomSheet from '@/src/components/ui/BottomSheet';
import PageHeader from '@/src/components/ui/PageHeader';
import SupervisorOrderDetailsCard from '@/src/components/ui/Supervisor/SupervisorOrderDetailsCard';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import MaleIcon from '@/src/components/icons/common/MaleIcon';
import FemaleIcon from '@/src/components/icons/common/FemaleIcon';
import UserIcon from '@/src/components/icons/page/UserIcon';
import Calendar12Icon from '@/src/components/icons/page/Calendar12Icon';
import Table from '@/src/components/ui/Table';
import Loader from '@/src/components/ui/Loader';

// 4. Project hooks
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { useParams } from '@/src/hooks/useParams';
import {
    useFormattedContractors,
    useContractorById,
    useContractorWorkLocations,
    useContractorSummary
} from '@/src/hooks/useContractor';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { OrderProps } from '@/src/types';
import DetailsToast from '@/src/components/ui/DetailsToast';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

const columns = [
    { label: "Locations", key: "name" },
    { label: "Count", key: "displayCount" },
] as { label: string, key: string }[];

const SupervisorWorkerDetailsScreen = () => {
    const { wId, mode = "multiple" } = useParams("supervisor-contractor-details", "wId", "mode");
    const [isLoading, setIsLoading] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastType, setToastType] = useState<"success" | "error" | "info">("info");
    const [toastMessage, setToastMessage] = useState("");

    const { goTo } = useAppNavigation();

    const {
        contractors,
        isLoading: contractorsLoading,
        error: contractorsError
    } = useFormattedContractors();

    const {
        data: singleContractor,
        isLoading: singleContractorLoading,
        error: singleContractorError
    } = useContractorById(wId || '');

    const {
        workLocations,
        isLoading: workLocationsLoading
    } = useContractorWorkLocations(wId || '');

    const {
        totalWorkers,
        totalMaleWorkers,
        totalFemaleWorkers,
        isLoading: summaryLoading
    } = useContractorSummary();

    const showToast = (type: "success" | "error" | "info", message: string) => {
        setToastType(type);
        setToastMessage(message);
        setToastVisible(true);
    };

    // Error handling effect
    const showErrorAlert = useCallback((error: any, context: string) => {
        console.error(`${context} Error:`, error);

        showToast("error", `Failed to load ${context.toLowerCase()}. Please try again.`);
    }, []);

    // Handle errors
    useMemo(() => {
        if (contractorsError) {
            showErrorAlert(contractorsError, "Contractors");
        }
        if (singleContractorError) {
            showErrorAlert(singleContractorError, "Contractor Details");
        }
    }, [contractorsError, singleContractorError, showErrorAlert]);


    // Memoized data transformations
    const workerDetail = useMemo((): OrderProps | null => {
        if (mode === "single" && singleContractor) {
            return {
                isImage: false,
                title: `${singleContractor.male_count + singleContractor.female_count} workers`,
                sepratorDetails: [
                    {
                        name: "Contractor",
                        value: singleContractor.name,
                        icon: <UserIcon />
                    },
                    {
                        name: "Date",
                        value: new Date(singleContractor.updatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        }),
                        icon: <Calendar12Icon />
                    }
                ],
                helperDetails: [
                    {
                        name: "Male",
                        value: `${singleContractor.male_count}`,
                        icon: <MaleIcon />
                    },
                    {
                        name: "Female",
                        value: `${singleContractor.female_count}`,
                        icon: <FemaleIcon />
                    }
                ],
                identifier: "order-ready"
            };
        }
        return null;
    }, [mode, singleContractor]);

    const workerDetailMultiple = useMemo((): OrderProps | null => {
        if (mode === "multiple" && !summaryLoading) {
            return {
                isImage: false,
                title: `${totalWorkers} workers`,
                sepratorDetails: [
                    {
                        name: "Male",
                        value: totalMaleWorkers.toString(),
                        icon: <MaleIcon color={getColor("green", 700)} />
                    },
                    {
                        name: "Female",
                        value: totalFemaleWorkers.toString(),
                        icon: <FemaleIcon color={getColor("green", 700)} />
                    }
                ],
                identifier: "order-ready"
            };
        }
        return null;
    }, [mode, summaryLoading, totalWorkers, totalMaleWorkers, totalFemaleWorkers]);

    const workDetailsMultiple = useMemo(() => {
        if (mode === "multiple" && contractors?.length > 0) {
            return contractors.map(contractor => ({
                name: contractor.name,
                data: contractor.workLocations.map(location => ({
                    name: location.name,
                    displayCount: location.displayCount
                }))
            }));
        }
        return [];
    }, [mode, contractors]);

    // Loading state check
    const isDataLoading = useMemo(() => {
        if (mode === "single") {
            return singleContractorLoading || workLocationsLoading;
        } else {
            return contractorsLoading || summaryLoading;
        }
    }, [mode, singleContractorLoading, workLocationsLoading, contractorsLoading, summaryLoading]);

    // Render loading overlay
    const renderLoadingOverlay = () => {
        if (isLoading || isDataLoading) {
            return (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            );
        }
        return null;
    };

    // Early return for loading state
    if (isDataLoading && !singleContractor && contractors?.length === 0) {
        return (
            <View style={styles.pageContainer}>
                <PageHeader page={'Contractor'} />
                <View style={styles.wrapper}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            </View>
        );
    }

    // Single contractor mode
    if (mode === "single") {
        if (!singleContractor) {
            return (
                <View style={styles.pageContainer}>
                    <PageHeader page={'Contractor'} />
                    <View style={styles.wrapper}>
                        <View style={styles.errorContainer}>
                            <BackButton label='Detail' backRoute="supervisor-contractor" />
                        </View>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.pageContainer}>
                <PageHeader page={'Contractor'} />
                <View style={styles.wrapper}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={[styles.VStack, styles.gap16]}>
                            <BackButton label='Detail' backRoute="supervisor-contractor" />

                            {workerDetail && (
                                <SupervisorOrderDetailsCard
                                    order={workerDetail}
                                    color="green"
                                    bgSvg={DatabaseIcon}
                                />
                            )}

                            {workLocations?.length > 0 ? (
                                <Table
                                    columns={columns}
                                    content={workLocations}
                                />
                            ) : (
                                <View style={styles.noDataContainer}>
                                    {/* Add your no data component here */}
                                </View>
                            )}
                        </View>
                    </ScrollView>
                </View>
                <DetailsToast
                    type={toastType}
                    message={toastMessage}
                    visible={toastVisible}
                    onHide={() => setToastVisible(false)}
                />
                <BottomSheet color='green' />
                {renderLoadingOverlay()}
            </View>
        );
    }

    // Multiple contractors mode
    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'Contractor'} />
            <View style={styles.wrapper}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.VStack, styles.gap16]}>
                        <BackButton
                            label='Detail'
                            backRoute="supervisor-contractor"
                        />

                        {workerDetailMultiple && (
                            <SupervisorOrderDetailsCard
                                order={workerDetailMultiple}
                                color="green"
                                bgSvg={DatabaseIcon}
                            />
                        )}

                        {workDetailsMultiple?.length > 0 ? (
                            workDetailsMultiple.map((table, index) => (
                                table.data?.length > 0 && (
                                    <Table
                                        key={`${table.name}-${index}`}
                                        columns={columns}
                                        content={table.data}
                                    >
                                        {table.name}
                                    </Table>
                                )
                            ))
                        ) : (
                            <View style={styles.noDataContainer}>
                                {/* Add your no data component here */}
                            </View>
                        )}
                        <DetailsToast
                            type={toastType}
                            message={toastMessage}
                            visible={toastVisible}
                            onHide={() => setToastVisible(false)}
                        />
                    </View>
                </ScrollView>
            </View>
            <BottomSheet color='green' />
            {renderLoadingOverlay()}
        </View>
    );
};

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    flexGrow: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
    },
    searchinputWrapper: {
        height: 44,
        marginTop: 24,
        marginBottom: 24,
    },
    HStack: {
        flexDirection: "row"
    },
    VStack: {
        flexDirection: "column"
    },
    justifyBetween: {
        justifyContent: "space-between",
    },
    alignCenter: {
        alignItems: "center"
    },
    gap8: {
        gap: 8,
    },
    gap16: {
        gap: 16,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        paddingTop: 20,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
    },
});

export default SupervisorWorkerDetailsScreen;