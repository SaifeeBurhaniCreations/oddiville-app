// src/screens/SupervisorWorkerDetailsScreen.tsx
import React, { useMemo, useState, useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import PageHeader from '@/src/components/ui/PageHeader'
import BottomSheet from '@/src/components/ui/BottomSheet'
import BackButton from '@/src/components/ui/Buttons/BackButton'
import SupervisorOrderDetailsCard from '@/src/components/ui/Supervisor/SupervisorOrderDetailsCard'
import Table from '@/src/components/ui/Table'
import Loader from '@/src/components/ui/Loader'
import DetailsToast from '@/src/components/ui/DetailsToast'

import DatabaseIcon from '@/src/components/icons/page/DatabaseIcon'
import MaleIcon from '@/src/components/icons/common/MaleIcon'
import FemaleIcon from '@/src/components/icons/common/FemaleIcon'
import UserIcon from '@/src/components/icons/page/UserIcon'
import Calendar12Icon from '@/src/components/icons/page/Calendar12Icon'

import { useParams } from '@/src/hooks/useParams'
import {
  useFormattedContractors,
  useContractorById,
  useContractorWorkLocations,
  useContractorSummary,
} from '@/src/hooks/useContractor'

import { getColor } from '@/src/constants/colors'
import { OrderProps } from '@/src/types'

/* ---------------------------------- */
/* TABLE CONFIG */
/* ---------------------------------- */

type WorkerRow = {
  label: string
  countMale: number
  countFemale: number
}

const columns = [
  { key: 'label', label: 'Type', flex: 2 },
  { key: 'countMale', label: 'Male', flex: 1 },
  { key: 'countFemale', label: 'Female', flex: 1 },
] as const

/* ---------------------------------- */
/* SCREEN */
/* ---------------------------------- */

const SupervisorWorkerDetailsScreen = () => {
  const { wId, mode = 'multiple' } = useParams(
    'labours-details',
    'wId',
    'mode'
  )

  const [toastVisible, setToastVisible] = useState(false)
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>(
    'info'
  )
  const [toastMessage, setToastMessage] = useState('')

  const {
    contractors,
    isLoading: contractorsLoading,
  } = useFormattedContractors()

  const {
    data: singleContractor,
    isLoading: singleLoading,
  } = useContractorById(wId || '')

  const {
    workLocations,
    isLoading: workLocationsLoading,
  } = useContractorWorkLocations(wId || '')

  const {
    totalWorkers,
    totalMaleWorkers,
    totalFemaleWorkers,
    isLoading: summaryLoading,
  } = useContractorSummary()

  /* ---------------------------------- */
  /* SINGLE MODE CARD */
  /* ---------------------------------- */

  const workerDetailSingle: OrderProps | null = useMemo(() => {
    if (!singleContractor) return null

    return {
      isImage: false,
      title: `${singleContractor.male_count + singleContractor.female_count} workers`,
      sepratorDetails: [
        {
          name: 'Contractor',
          value: singleContractor.name,
          icon: <UserIcon />,
        },
        {
          name: 'Date',
          value: new Date(singleContractor.updatedAt).toLocaleDateString(),
          icon: <Calendar12Icon />,
        },
      ],
      helperDetails: [
        { name: 'Male', value: String(singleContractor.male_count), icon: <MaleIcon /> },
        { name: 'Female', value: String(singleContractor.female_count), icon: <FemaleIcon /> },
      ],
      identifier: 'order-ready',
    }
  }, [singleContractor])

  /* ---------------------------------- */
  /* TABLE DATA */
  /* ---------------------------------- */

  const singleTableData: WorkerRow[] = useMemo(() => {
    if (!workLocations) return []

    return workLocations.map(loc => ({
      label: loc.name,
      countMale: Number(loc.male_count ?? 0),
      countFemale: Number(loc.female_count ?? 0),
    }))
  }, [workLocations])

  const multipleTables = useMemo(() => {
    if (!contractors) return []

    return contractors.map(c => ({
      name: c.name,
      data: c.workLocations.map(loc => ({
        label: loc.name,
        countMale: Number(loc.male_count ?? 0),
        countFemale: Number(loc.female_count ?? 0),
      })),
    }))
  }, [contractors])

  const isLoading =
    mode === 'single'
      ? singleLoading || workLocationsLoading
      : contractorsLoading || summaryLoading

  if (isLoading) {
    return (
      <View style={styles.pageContainer}>
        <PageHeader page="Contractor" />
        <View style={styles.wrapper}>
          <Loader />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.pageContainer}>
      <PageHeader page="Contractor" />

      <View style={styles.wrapper}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <BackButton label="Detail" backRoute="labours" />

          {mode === 'single' && workerDetailSingle && (
            <>
              <SupervisorOrderDetailsCard
                order={workerDetailSingle}
                color="green"
                bgSvg={DatabaseIcon}
              />
              <Table<WorkerRow> columns={columns} content={singleTableData} />
            </>
          )}

          {mode === 'multiple' && (
            <>
              <SupervisorOrderDetailsCard
                order={{
                  isImage: false,
                  title: `${totalWorkers} workers`,
                  sepratorDetails: [
                    { name: 'Male', value: String(totalMaleWorkers), icon: <MaleIcon /> },
                    { name: 'Female', value: String(totalFemaleWorkers), icon: <FemaleIcon /> },
                  ],
                  identifier: 'order-ready',
                }}
                color="green"
                bgSvg={DatabaseIcon}
              />

              {multipleTables.map((t, i) => (
                t.data.length > 0 && (
                  <Table<WorkerRow>
                    key={`${t.name}-${i}`}
                    columns={columns}
                    content={t.data}
                  >
                    {t.name}
                  </Table>
                )
              ))}
            </>
          )}
        </ScrollView>
      </View>

      <DetailsToast
        type={toastType}
        message={toastMessage}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />

      <BottomSheet color="green" />
    </View>
  )
}

export default SupervisorWorkerDetailsScreen

/* ---------------------------------- */
/* STYLES */
/* ---------------------------------- */

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor('green', 500),
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor('light', 200),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
})