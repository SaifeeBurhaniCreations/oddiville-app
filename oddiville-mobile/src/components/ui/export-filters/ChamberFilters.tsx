import { StyleSheet} from 'react-native'
import React from 'react'
import TimeRange from './components/TimeRange'
import { FilterComponentProps } from '@/src/types/export/types'
import Chambers from './components/Chamber'

const ChamberFilters = ({ state, setState }: FilterComponentProps) => {
  return (
      <>
          <TimeRange state={state} setState={setState} />
          <Chambers state={state} setState={setState} />
      </>
  )
}

export default ChamberFilters

const styles = StyleSheet.create({})