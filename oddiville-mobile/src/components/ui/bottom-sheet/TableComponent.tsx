import { TableComponentProps } from '@/src/types'
import { StyleSheet, View } from 'react-native'
import React from 'react'
import Table from '../Table';

const TableComponent = ({ data }: TableComponentProps) => {
    return (
        <View style={styles.column}>
            {
                data?.map((table, index) => (
                    <Table
                        key={index}
                        columns={table.tableHeader}
                        content={table.tableBody}
                    >{table.label}</Table>
                ))
            }
        </View>

    )
}

export default TableComponent

const styles = StyleSheet.create({
    column: {
        flexDirection: "column",
        gap: 12,
    }
})
