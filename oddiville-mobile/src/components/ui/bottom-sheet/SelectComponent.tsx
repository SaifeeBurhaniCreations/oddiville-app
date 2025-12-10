import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { getColor } from '@/src/constants/colors';
import { B4, H4 } from '@/src/components/typography/Typography';
import DownChevron from '@/src/components/icons/navigation/DownChevron';
import { SelectComponentProps } from '@/src/types';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { RootState } from '@/src/redux/store';
import { useDispatch, useSelector } from 'react-redux';
import { getPlaceholder } from '@/src/utils/inputUtils';
import { setSource } from '@/src/redux/slices/bottomsheet/raw-material.slice';
import { useDryChambers } from '@/src/hooks/useChambers';
import { setIsChoosingChambers } from '@/src/redux/slices/bottomsheet/product-package-chamber.slice';

const SelectComponent = ({ data }: SelectComponentProps) => {
    const dispatch = useDispatch();
    const { selectedChambers } = useSelector((state: RootState) => state.rawMaterial);
    const total = useSelector((state: RootState) => state.productionBegins.total);
    // const chambers = useSelector((state: RootState) => state.chamberRatings.chamberQty);

    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    const { data: DryChambersRaw } = useDryChambers();
    const DryChambers = DryChambersRaw || [];
    const { placeholder, label, key } = data;

    const joined = selectedChambers.join(", ");
    const truncated = joined?.length > 60 ? joined.slice(0, 60) + "..." : joined;

    const placeholderOption = getPlaceholder(placeholder, truncated);

    const handlePress = () => {
        if(key === "product-package") {
            const CHAMBER_LIST = {
                sections: [
                    {
                        type: 'optionList',
                        data: {
                            isCheckEnable: false,
                            key: "product-package",
                            options: DryChambers.map(dc => dc.chamber_name)
                        }
                    },
                ]
            };
            dispatch(setIsChoosingChambers(true))
            validateAndSetData("temp123", "chamber-list", CHAMBER_LIST);

        } else {
            dispatch(setSource("chamber"));
            validateAndSetData("temp123", "multiple-chamber-list");
        }
    }

    const SelectedElement = (
        <View>
            <TouchableOpacity style={styles.selectContainer} onPress={handlePress}>
                <B4 color={getColor("green", 700)}>{placeholderOption}</B4>
                <DownChevron size={16} color={getColor("green", 700)} />
            </TouchableOpacity>
        </View>
    );

    // const userQuantity = sumBy({ array: findAllByKey(chambers, "quantity"), transform: "number" });

    // console.log("userQuantity", userQuantity);

    return label ? (
        <View style={styles.labelContainer}>
            <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <H4>{label}</H4>
                <B4 color={getColor('green', 500)}>
                    {total} Kg
                </B4>
            </View>
            {SelectedElement}
        </View>
    ) : (
        SelectedElement
    );
};

export default SelectComponent;

const styles = StyleSheet.create({
    labelContainer: {
        flexDirection: "column",
        gap: 8,
    },
    selectContainer: {
        backgroundColor: getColor("light"),
        borderWidth: 1,
        borderColor: getColor("green", 100),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        borderRadius: 12,
        height: 44,
    },
    dropdown: {
        backgroundColor: getColor("light", 200),
        borderWidth: 1,
        borderColor: getColor("green", 100),
        marginTop: 8,
        borderRadius: 12,
        maxHeight: 200,
    },
    option: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    optionText: {
        color: getColor("green", 700),
        fontSize: 16,
    },
});