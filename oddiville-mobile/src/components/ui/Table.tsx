import { getColor } from '@/src/constants/colors'
import { TableProps } from '@/src/types'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { B3, H6 } from '../typography/Typography'
import React, { useMemo } from 'react'
import Radio from './Radio'
import { labelMap } from '@/src/utils/arrayUtils'
import Input from './Inputs/Input'
import { isNumber } from 'lodash'

export type TableColumn<T> = {
  label: string
  key: keyof T
  align?: 'left' | 'center' | 'right'
  flex?: number,
  width?: number
}

const { width: screenWidth } = Dimensions.get('screen')

// Constants for better maintainability
const MERGE_COLUMN_PADDING_RATIO = 0.22
const INPUT_GAP = 12
const CONTENT_GAP = 12

/**
 * Checks if an index falls within any of the provided ranges
 */
const isIndexInAnyRange = (
  index: number,
  mergableRows: [number, number][]
): boolean => {
  return mergableRows.some(([start, end]) => index >= start && index <= end)
}

/**
 * Calculates the maximum width for cell content based on its value
 */
const getCellMaxWidth = (value: any): string => {
  if (value === undefined) return '100%'
  if (Number(value) === 0) return '60%'
  if (isNumber(value)) return '100%'
  return '60%'
}

/**
 * Formats cell display value
 */
const formatCellValue = (value: any): string => {
  if (value === undefined) return '0'
  if (Number(value) === 0) return 'Not needed'
  return String(value)
}

const Table = ({
  columns,
  content,
  mergableRows = [],
  children,
  color = 'green',
  style,
  onRadioChange,
  onInputChange,
  ...props
}: TableProps) => {
  // Memoize total count calculation for performance
  const totalCount = useMemo(() => {
    return content.reduce(
      (acc, current) =>
        acc + Number(current.countMale || 0) + Number(current.countFemale || 0),
      0
    )
  }, [content])

  const renderHeaderCell = (col: any, colIndex: number) => {
    const mergeRange = mergableRows.find(([start]) => start === colIndex)

    if (mergeRange) {
      const [start, end] = mergeRange
      return (
        <View
          key={colIndex}
          style={[
            styles.mergedHeaderCell,
            {
              flex: end - start + 1,
              paddingRight: screenWidth * MERGE_COLUMN_PADDING_RATIO,
            },
          ]}
        >
          <H6>{columns[start]?.label}</H6>
        </View>
      )
    }

    if (isIndexInAnyRange(colIndex, mergableRows)) return null

    return (
      <View key={colIndex} style={styles.headerCell}>
        <H6>{col.label}</H6>
      </View>
    )
  }

  const renderMergedCell = (
    row: any,
    rowIndex: number,
    colIndex: number,
    mergeRange: [number, number]
  ) => {
    const [start, end] = mergeRange
    const slicedColumns = Object.keys(row).slice(start, end + 1)

    const options = slicedColumns.map((key) => ({
      label: labelMap[key] ?? key,
      key,
    }))

    return (
      <View key={colIndex} style={styles.mergedCell}>
        {options.map((option, i) => {
          const key = slicedColumns[i]
          const isChecked = row[key]

          return (
            <Radio
              key={`${colIndex}-${i}`}
              isChecked={isChecked}
              onPress={() => {
                if (
                  typeof key === 'string' &&
                  ['enterCount', 'notNeeded'].includes(key)
                ) {
                  onRadioChange?.(rowIndex, key as 'enterCount' | 'notNeeded')
                }
              }}
            >
              {option.label}
            </Radio>
          )
        })}
      </View>
    )
  }

  const renderStandardCell = (row: any, col: any, colIndex: number) => {
    const cellValue = row[col.key]
    const maxWidth = getCellMaxWidth(cellValue)
    const displayValue = formatCellValue(cellValue)

    return (
      <View key={colIndex} style={styles.standardCell}>
        <B3 style={[styles.cellText, { maxWidth }]}>{displayValue}</B3>
      </View>
    )
  }

  const renderRowContent = (row: any, rowIndex: number) => {
    return columns?.map((col, colIndex: number) => {
      const mergeRange = mergableRows.find(([start]) => start === colIndex)

      if (mergeRange) {
        return renderMergedCell(row, rowIndex, colIndex, mergeRange)
      }

      return renderStandardCell(row, col, colIndex)
    })
  }

  const renderInputFields = (row: any, rowIndex: number) => {
    if (!row.enterCount) return null

    return (
      <View style={styles.inputContainer}>
        <Input
          value={String(row.countMale ?? '')}
          onChangeText={(text: string) =>
            onInputChange?.(rowIndex, 'male', text)
          }
          placeholder="Enter male"
          keyboardType="number-pad"
          style={styles.input}
        />
        <Input
          value={String(row.countFemale ?? '')}
          onChangeText={(text: string) =>
            onInputChange?.(rowIndex, 'female', text)
          }
          placeholder="Enter female"
          keyboardType="number-pad"
          style={styles.input}
        />
      </View>
    )
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tableWithLabel}>
        {/* Label and Total Count Header */}
        {children && (
          <View style={styles.labelWithCount}>
            <B3 color={getColor('yellow', 700)} style={styles.labelText}>
              {children}
            </B3>
            {totalCount > 0 && <H6>Total worker: {totalCount}</H6>}
          </View>
        )}

        {/* Table */}
        <View style={[styles.table, style]} {...props}>
          {/* Table Header */}
          <View style={styles.header}>
            {columns?.map((col, colIndex) => renderHeaderCell(col, colIndex))}
          </View>

          {/* Table Body */}
          <View style={styles.body}>
            {content?.map((row, rowIndex: number) => (
              <View
                key={rowIndex}
                style={[
                  styles.content,
                  rowIndex !== content.length - 1 && styles.withBorder,
                ]}
              >
                {/* Row Data */}
                <View style={styles.rows}>{renderRowContent(row, rowIndex)}</View>

                {/* Input Fields (if applicable) */}
                {renderInputFields(row, rowIndex)}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default Table

const styles = StyleSheet.create({
  tableWithLabel: {
    flexDirection: 'column',
    gap: 12,
  },
  labelWithCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  labelText: {
    textTransform: 'uppercase',
  },
  table: {
    borderWidth: 1,
    borderColor: getColor('green', 100),
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: getColor('green', 100),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerCell: {
    justifyContent: 'center',
  },
  mergedHeaderCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  body: {
    flexDirection: 'column',
  },
  content: {
    flexDirection: 'column',
    gap: CONTENT_GAP,
    padding: 12,
  },
  rows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  standardCell: {
    justifyContent: 'center',
  },
  cellText: {
    flexWrap: 'wrap',
  },
  mergedCell: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: INPUT_GAP,
  },
  input: {
    flex: 1,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: getColor('green', 100),
  },
})