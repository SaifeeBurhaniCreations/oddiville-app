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
import { TableColumn } from '@/src/components/ui/Table'

import { getColor } from '@/src/constants/colors'
import { OrderProps } from '@/src/types'

function parseDisplayCount(display?: string | null): {
  male: number
  female: number
} {
  if (!display || typeof display !== 'string') {
    return { male: 0, female: 0 }
  }

  const value = display.toLowerCase()

  const maleWord = value.match(/male\s*[:\-]?\s*(\d+)/)
  const femaleWord = value.match(/female\s*[:\-]?\s*(\d+)/)

  if (maleWord || femaleWord) {
    return {
      male: maleWord ? Number(maleWord[1]) : 0,
      female: femaleWord ? Number(femaleWord[1]) : 0,
    }
  }

  const maleShort = value.match(/(\d+)\s*m\b/)
  const femaleShort = value.match(/(\d+)\s*f\b/)

  if (maleShort || femaleShort) {
    return {
      male: maleShort ? Number(maleShort[1]) : 0,
      female: femaleShort ? Number(femaleShort[1]) : 0,
    }
  }

  const numericPair = value.match(/(\d+)\s*[\/,\-]\s*(\d+)/)

  if (numericPair) {
    return {
      male: Number(numericPair[1]),
      female: Number(numericPair[2]),
    }
  }

  // fallback
  return { male: 0, female: 0 }
}


/* ---------------------------------- */
/* TABLE CONFIG */
/* ---------------------------------- */

type WorkerRow = {
  label: string
  countMale: number
  countFemale: number
}

const columns: TableColumn<WorkerRow>[] = [
  { key: 'label', label: 'Type', flex: 2 },
  { key: 'countMale', label: 'Male', flex: 1 },
  { key: 'countFemale', label: 'Female', flex: 1 },
]


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

  return workLocations.map(loc => {

    return {
  label: loc.name,
  countMale: loc.maleCount,
  countFemale: loc.femaleCount,
}
  })
}, [workLocations])


const multipleTables = useMemo(() => {
  if (!contractors) return []

  return contractors.map(c => ({
    name: c.name,
    data: c.workLocations.map(loc => {

    return {
        label: loc.name,
        countMale: loc.maleCount,
        countFemale: loc.femaleCount,
        }
    }),
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
          <View style={styles.column}>

          <BackButton label="Detail" backRoute="labours" />

          {mode === 'single' && workerDetailSingle && (
            <>
              <SupervisorOrderDetailsCard
                order={workerDetailSingle}
                color="green"
                bgSvg={DatabaseIcon}
              />
              <Table columns={columns} content={singleTableData} />
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
                  <Table
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
          </View>
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
  column: {
   flexDirection: "column",
   gap: 24
  },
})