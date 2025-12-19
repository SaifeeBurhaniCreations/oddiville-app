// src/components/ui/Table.tsx
import React, { useMemo } from 'react'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { B3, H6 } from '../typography/Typography'
import { getColor } from '@/src/constants/colors'

/* ---------------------------------- */
/* TYPES */
/* ---------------------------------- */

export type TableColumn<T> = {
  key: keyof T
  label: string
  flex?: number
}

export interface TableProps<T extends Record<string, any>> {
  columns: TableColumn<T>[]
  content: T[]
  children?: React.ReactNode
}

/* ---------------------------------- */
/* COMPONENT */
/* ---------------------------------- */

const Table = <T extends { countMale?: number; countFemale?: number }>({
  columns,
  content,
  children,
}: TableProps<T>) => {
  /* ✅ FIX: correct total calculation */
  const totalCount = useMemo(() => {
    return content.reduce(
      (sum, row) =>
        sum +
        Number(row.countMale ?? 0) +
        Number(row.countFemale ?? 0),
      0
    )
  }, [content])

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tableWithLabel}>
        {/* LABEL + TOTAL */}
        {children && (
          <View style={styles.labelWithCount}>
            <B3 color={getColor('yellow', 700)} style={styles.labelText}>
              {children}
            </B3>
            <H6>Total worker: {totalCount}</H6>
          </View>
        )}

        {/* TABLE */}
        <View style={styles.table}>
          {/* HEADER */}
          <View style={styles.header}>
            {columns.map((col, idx) => (
              <View
                key={idx}
                style={[styles.headerCell, { flex: col.flex ?? 1 }]}
              >
                <H6>{col.label}</H6>
              </View>
            ))}
          </View>

          {/* BODY */}
          {content.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={[
                styles.row,
                rowIndex !== content.length - 1 && styles.withBorder,
              ]}
            >
              {columns.map((col, colIndex) => (
                <View
                  key={colIndex}
                  style={[styles.cell, { flex: col.flex ?? 1 }]}
                >
                  <B3
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    style={styles.cellText}
                  >
                    {String(row[col.key] ?? 0)}
                  </B3>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default Table

/* ---------------------------------- */
/* STYLES */
/* ---------------------------------- */

const styles = StyleSheet.create({
  tableWithLabel: {
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
    flexDirection: 'row',
    backgroundColor: getColor('green', 100),
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerCell: {
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
  },
  cell: {
    justifyContent: 'center',
  },
  cellText: {
    flexWrap: 'nowrap', // ✅ name wraps via flex, number stays intact
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: getColor('green', 100),
  },
})