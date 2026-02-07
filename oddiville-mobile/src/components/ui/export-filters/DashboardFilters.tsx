import React from "react";
import { FilterComponentProps } from "../../../types/export/types";
import TimeRange from "./components/TimeRange";
import { StyleSheet } from "react-native";
import CustomTimeRange from "./components/CustomTimeRange";

const DashboardFilters = ({ state, setState }: FilterComponentProps) => {
    return <>
        <TimeRange state={state} setState={setState} />
        {state.range === "custom" && (
            <CustomTimeRange state={state} setState={setState} />
        )}
    </>;
};

export default DashboardFilters;

const styles = StyleSheet.create({})