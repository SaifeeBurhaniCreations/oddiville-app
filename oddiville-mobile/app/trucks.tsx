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
import Loader from '@/src/components/ui/Loader';
import { truckBackRoute } from '@/src/constants/backRoute';

// 4. Project hooks
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import { TruckDetailsProps, useTrucks } from '@/src/hooks/truck';
import { useAuth } from '@/src/context/AuthContext';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { RootStackParamList, TruckProps } from '@/src/types';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type


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
    const { role } = useAuth();

    const { goTo } = useAppNavigation()
    const { data: trucksData, isLoading: trucksLoading } = useTrucks();

    const formattedTrucks = trucksData ? formatTruckData(trucksData) : [];
    
    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'Trucks'} />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>

                    <BackButton label={`Trucks (${formattedTrucks.length ?? 0})`} backRoute={truckBackRoute[role ?? "supervisor"] as keyof RootStackParamList} />

                    <Button variant='outline' onPress={() => goTo('truck-create')} size='md'>Add Truck</Button>
                </View>
                <View style={styles.content}>
                    <SearchWithFilter onFilterPress={() => { }} placeholder={"Search truck by name"} value='' onChangeText={() => { }} />
                    <TruckFlatList
                        trucks={formattedTrucks}
                        fetchMore={() => {}}
                        hasMore={false}
                        isLoading={false}
                    />
                </View>
            </View>
            {trucksLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </View>
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.05),
        zIndex: 2,
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