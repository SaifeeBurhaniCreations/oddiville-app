import { StyleSheet } from 'react-native'
import React, { useEffect, useMemo } from 'react'
import ChipGroup from '../../ChipGroup';
import { FilterComponentProps } from '@/src/types/export/types';
import { useLanes } from '@/src/hooks/useFetchData';
import { useOverlayLoader } from '@/src/context/OverlayLoaderContext';

const BASE_RANGE_OPTIONS: { label: string; value: string }[] = [
    { label: "All", value: "all" },
];

const LaneSelector = ({ state, setState }: FilterComponentProps) => {
    const { data: lanes, isLoading } = useLanes();
    const loader = useOverlayLoader();

    type ChipOption = { label: string; value: string };

    const RANGE_OPTIONS: ChipOption[] = useMemo(() => {
        if (!lanes) return BASE_RANGE_OPTIONS;

        return [
            ...BASE_RANGE_OPTIONS,
            ...lanes.map(lane => ({
                label: lane.name,
                value: lane.id,
            })),
        ];
    }, [lanes]);

    useEffect(() => {
        loader.bind(isLoading)
    }, [isLoading])

    const handleChange = (values: string[]) => {
        if (values.includes("all")) {
            setState(prev => ({
                ...prev,
                selectAllLanes: true,
                laneIds: [],
            }));
            return;
        }

        setState(prev => ({
            ...prev,
            selectAllLanes: false,
            laneIds: values,
        }));
    };

    return (
        <ChipGroup
            type="multi"
            data={RANGE_OPTIONS}
            activeValue={state.selectAllLanes ? ["all"] : state.laneIds}
            onChange={handleChange}
        >
            Select Lane
        </ChipGroup>
    );
}

export default LaneSelector

const styles = StyleSheet.create({})