import PageHeader from '@/src/components/ui/PageHeader';
import { getColor } from '@/src/constants/colors';
import { StyleSheet, View } from 'react-native';
import Tabs from '@/src/components/ui/Tabs';
import BottomSheet from '@/src/components/ui/BottomSheet';
import BackButton from '@/src/components/ui/Buttons/BackButton';
import { useAppNavigation } from '@/src/hooks/useAppNavigation';
import Button from '@/src/components/ui/Buttons/Button';
import RawMaterialDetailed from '@/src/components/ui/RawMaterialDetailed';
import RawMaterialOverview from '@/src/components/ui/RawMaterialOverview';

const SupervisorRawMaterialScreen = () => {
    const { goTo } = useAppNavigation();

    return (
        <View style={styles.pageContainer}>
            <PageHeader page={'Raw Material'} />
            <View style={styles.wrapper}>
                <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
                    <BackButton label='Raw Material' backRoute="home" />
                    <Button onPress={() => goTo('raw-material-order')} variant='outline' size='md'>Add Material</Button>
                </View>

                <Tabs tabTitles={['Overview', 'Detailed']} color='green' style={styles.flexGrow}>

                    {/* Overview Tab */}
                    <RawMaterialOverview />

                    {/* Detailed Tab */}
                    <RawMaterialDetailed />

                </Tabs>
            </View>
            <BottomSheet color='green' />
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
        gap: 16
    },
    searchinputWrapper: {
        height: 44,
    },
    cardContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        paddingBottom: 20,
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
});


export default SupervisorRawMaterialScreen;