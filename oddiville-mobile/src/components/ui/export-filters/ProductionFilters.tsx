import { StyleSheet } from 'react-native'
import React from 'react'
import TimeRange from './components/TimeRange'
import { FilterComponentProps } from '@/src/types/export/types'
import LaneSelector from './components/LaneSelector'
import StatusSelector from './components/StatusSelector'

const ProductionFilters = ({ state, setState }: FilterComponentProps) => {
  return (
      <>
          <TimeRange state={state} setState={setState} />
          <LaneSelector state={state} setState={setState} />
          <StatusSelector state={state} setState={setState} />
      </>
  )
}

export default ProductionFilters

const styles = StyleSheet.create({});