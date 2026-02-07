import { StyleSheet, View } from 'react-native'
import React from 'react'
import Select from '../../Select';
import { FilterComponentProps } from '@/src/types/export/types';
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/redux/store';
import { setSource } from '@/src/redux/slices/bottomsheet/raw-material.slice';
import { getPlaceholder } from '@/src/utils/inputUtils';
import { useChamber } from '@/src/hooks/useChambers';

const Chambers = ({ state, setState }: FilterComponentProps) => {
    const dispatch = useDispatch();
    const { selectedChambers } = useSelector((state: RootState) => state.rawMaterial)
    const { validateAndSetData } = useValidateAndOpenBottomSheet();
    const { data: chambers } = useChamber();

    const handleSelect = () => {
        dispatch(setSource("export-chamber"))
        validateAndSetData("nothing", "multiple-chamber-list");
        console.log("selectedChambers", selectedChambers);

        // const chamberIds: string[] = [];
        // (chambers || []).forEach((chamber) => {
        //     selectedChambers.forEach((selectedChamber) => {
        //         if (chamber.chamber_name === selectedChamber) {
        //             chamberIds.push(chamber.id)
        //         }
        //     }) 
        // })

        // console.log("chambers", chambers);
        // console.log("chamberIds", chamberIds);
        
    }

    const joined = selectedChambers.join(", ");
    const truncated = joined?.length > 60 ? joined.slice(0, 60) + "..." : joined;

    const placeholder = getPlaceholder("Select chambers", truncated)

    return (
        <View>
            <Select
                style={{ flex: 1 }}
                value={placeholder}
                options={[]}
                onPress={handleSelect}
                showOptions={false}
            >
                Chambers
            </Select>
        </View>
    )
}

export default Chambers

const styles = StyleSheet.create({})