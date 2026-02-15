// 1. React and React Native core
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import PageHeader from '@/src/components/ui/PageHeader';
import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import Loader from '@/src/components/ui/Loader';
import TruckDetailsCard from '@/src/components/ui/TruckComps/TruckDetailsCard';
import TruckWeightCard from '@/src/components/ui/TruckWeightCard';
import { B3 } from '@/src/components/typography/Typography';

// 4. Project hooks
import { useParams } from '@/src/hooks/useParams';
import { useTruckById } from '@/src/hooks/truck';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { OrderProps } from '@/src/types';
import Require from '@/src/components/authentication/Require';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type


const formatDateTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    const time = date.toLocaleTimeString('en-US', timeOptions);
    
    const dateOptions: Intl.DateTimeFormatOptions = {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    };
    const formattedDate = date.toLocaleDateString('en-US', dateOptions);
    
    return `${time} • ${formattedDate}`;
};

const formatTruckData = (truckData: any): OrderProps => ({
    id: truckData?.id,
    title: truckData?.number,
    name: "Driver Details",
    address: `${truckData?.driver_name} • ${truckData?.phone}`,
    description: truckData?.agency_name,
    isImage: truckData?.challan,
    sepratorDetails: [
        {
            name: "Truck Type",
            value: truckData?.type,
        },
        {
            name: "Truck Size",
            value: `${truckData?.size} Tons`,
        }
    ],
    helperDetails: [{
        name: "Arrived at",
        value: formatDateTime(truckData?.arrival_date),
    }],
    identifier: undefined,
    sideIconKey: 'phone',
}) 

const TruckDetailScreen = () => {
    const { id } = useParams('truck-detail', 'id')

    if(!id) {
        return <View><B3>No Data Found</B3></View>
    }

    const { data: truckData, isLoading: truckLoading } = useTruckById(id)

    const [isLoading, setIsLoading] = useState(false);
    const formattedData = formatTruckData(truckData)


    return (
     <Require view='trucks'>
           <View style={styles.pageContainer}>
            <PageHeader page={'Truck Detail'} />
            <View style={styles.wrapper}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={[styles.VStack, styles.gap16]}>
                        <BackButton label="Detail" backRoute="trucks" />

                        <TruckDetailsCard truck={formattedData} color="green" bgSvg={DatabaseIcon} />

                        <TruckWeightCard    
                            title={`${truckData?.size} Tons`}
                            description="Truck Size"
                        />
                    </View>
                </ScrollView>
            </View>
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </View>
     </Require>
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
    buttonContainer: {
        flexDirection: "row",
        gap: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.005),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default TruckDetailScreen;