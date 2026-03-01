// 1. React and React Native core
import { StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import PageHeader from '@/src/components/ui/PageHeader';
import Button from '@/src/components/ui/Buttons/Button';
import SearchWithFilter from '@/src/components/ui/Inputs/SearchWithFilter';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import TruckFlatList from '@/src/components/ui/TruckComps/TruckFlatList';

// 4. Project hooks
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { TruckDetailsProps, useTrucks } from '@/src/hooks/truck';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { TruckProps } from '@/src/types';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

import { TRUCKS_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';
import { useAppCapabilities } from '@/src/hooks/useAppCapabilities';
import { useToast } from '@/src/context/ToastContext';
import Require from '@/src/components/authentication/Require';
import { useOverlayLoader } from '@/src/context/OverlayLoaderContext';
import { useEffect, useMemo } from 'react';

const formatTruckData = (truckData: TruckDetailsProps[]): TruckProps[] => {
    return truckData.map((truck) => ({
        name: truck.number || "Unknown",
        id: truck.id,
        badgeText: truck.isMyTruck ? "Mine" : "",
        profileImg: truck?.challan,
        arrival_date: truck.arrival_date ? new Date(truck.arrival_date) : new Date(),
        extra_details: truck.agency_name || "Unknown Agency",
        bottomConfig: {
            title: 'Truck details',
            description: `${truck.type || 'Truck'} • ${truck.size || '0'} Kg`
        },
        disabled: false,
        href: 'truck-detail'
    }));
};

const TrucksScreen = () => {
  const caps = useAppCapabilities();
  const toast = useToast();
    const loader = useOverlayLoader();
    const { goTo } = useAppNavigation()
    const { data: trucksData, isLoading: trucksLoading } = useTrucks();

const formattedTrucks = useMemo(() => {
  return trucksData ? formatTruckData(trucksData) : [];
}, [trucksData]);

    const backRoute = resolveBackRoute(
    caps.access,
    TRUCKS_BACK_ROUTES,
    resolveDefaultRoute(caps.access)
    );

    useEffect(() => {
        loader.bind(trucksLoading)
    }, [trucksLoading]);

    return (
         <Require view="trucks">
        <View style={styles.pageContainer}>
            <PageHeader page={'Trucks'} />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>

                    <BackButton label={`Trucks (${formattedTrucks.length ?? 0})`} backRoute={backRoute} />

                <Button
                    variant='outline'
                    onPress={() => {
                        caps.trucks.edit ? 
                        goTo('truck-create')
                        : 
                        toast.error('Permission Denied')
                    }}
                    size='md'
                     disabled={!caps.trucks.edit}>
                    Add Truck
                </Button>

                </View>
                <View style={styles.content}>
                    <SearchWithFilter onFilterPress={() => {}} placeholder={"Search truck by name"} value='' onChangeText={() => {}} />
                    <TruckFlatList
                        trucks={formattedTrucks}
                        fetchMore={() => {}}
                        hasMore={false}
                        isLoading={false}
                    />
                </View>
            </View>
        </View>
        </Require>
    )
}

export default TrucksScreen

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: getColor('green', 500),
        position: "relative",
    },
    wrapper: {
        flex: 1,
        flexDirection: "column",
        gap: 24,
        backgroundColor: getColor('light', 200),
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
        padding: 16,
    },
    flexGrow: {
        flex: 1,
    },
    content: {
        flexDirection: "column",
        gap: 16,
        height: "100%"
    },

    HStack: {
        flexDirection: "row"
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});