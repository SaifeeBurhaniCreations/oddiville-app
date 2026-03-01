import { StyleSheet } from 'react-native'
import React from 'react'
import { FilterComponentProps } from '@/src/types/export/types'
import TimeRange from './components/TimeRange'
import ProductSelector from './components/ProductSelector'
import StatusSelector from './components/StatusSelector'

const DispatchFilters = ({ state, setState }: FilterComponentProps) => {
  return (
      <>
          <TimeRange state={state} setState={setState} />
          <ProductSelector state={state} setState={setState} />
          <StatusSelector state={state} setState={setState} />
      </>
  )
}

export default DispatchFilters

const styles = StyleSheet.create({})