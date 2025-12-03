// 1. React and React Native core
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
// No items of this type

// 3. Project components
import ActivitesFlatList from '@/src/components/ui/ActivitesFlatList';
import SearchWithFilter from '@/src/components/ui/Inputs/SearchWithFilter';
import Loader from '@/src/components/ui/Loader'

// 4. Project hooks
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';

// 6. Types
import { ActivityProps } from '@/src/types';

// 7. Schemas
import { BottomSheetSchemaKey } from '@/src/schemas/BottomSheetSchema';
import { runFilter } from '@/src/utils/bottomSheetUtils';

// 8. Assets 
// No items of this type

const InProgressOrders = ({ data }: { data: ActivityProps[] }) => {

    const [isLoading, setIsLoading] = useState(false);

    const { validateAndSetData } = useValidateAndOpenBottomSheet();

    const handleSearchFilter = () => {
        runFilter({
            key:"order:inprogress",
            validateAndSetData,
            mode: "select-main"
        });
    }

    const handleOpen = async (id: string, type: BottomSheetSchemaKey) => {
        setIsLoading(true);
        await validateAndSetData(id, type);
        setIsLoading(false);
    };

    return (
        <View style={styles.flexGrow}>
            <View style={styles.searchinputWrapper}>
                <SearchWithFilter
                    value=''
                    onChangeText={() => { }}
                    placeholder={"Search by name"}
                    onFilterPress={handleSearchFilter}
                />
            </View>
            <ActivitesFlatList isVirtualised={true} onPress={handleOpen} activities={data} />
            {isLoading && (
                <View style={styles.overlay}>
                    <View style={styles.loaderContainer}>
                        <Loader />
                    </View>
                </View>
            )}
        </View>
    )
}

export default InProgressOrders

const styles = StyleSheet.create({
    flexGrow: {
        flex: 1,
    },
    searchinputWrapper: {
        height: 44,
        marginTop: 24,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: getColor('green', 500, 0.1),
        zIndex: 2,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
})