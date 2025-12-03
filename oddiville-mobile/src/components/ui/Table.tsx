import { getColor } from '@/src/constants/colors'
import { TableProps } from '@/src/types'
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native'
import { B2, B3, H6 } from '../typography/Typography'
import React from 'react'
import Radio from './Radio'
import { labelMap } from '@/src/utils/arrayUtils'
import Input from './Inputs/Input'

const isIndexInAnyRange = (index: number, mergableRows: [number, number][]) => {
    return mergableRows.some(([start, end]) => index >= start && index <= end);
};

const { width: screenWidth } = Dimensions.get("screen");

const Table = ({ columns, content, mergableRows = [], children, color = "green", style, onRadioChange, onInputChange, ...props }: TableProps) => {

    const totalCount = content.reduce(
        (acc, current) =>
            acc + Number(current.countMale || 0) + Number(current.countFemale || 0),
        0
    );

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.tableWithLabel}>
          {children && (
            <View style={styles.labelWithCount}>
              {
                <B3
                  color={getColor("yellow", 700)}
                  style={{ textTransform: "uppercase" }}
                >
                  {children}
                </B3>
              }
              {!!totalCount && <H6>Total worker: {totalCount}</H6>}
            </View>
          )}

          <View style={[styles.table, style]} {...props}>
            <View style={styles.header}>
              {columns?.map((col, colIndex: number) => {
                const mergeRange = mergableRows.find(
                  ([start]) => start === colIndex
                );

                if (mergeRange) {
                  const [start, end] = mergeRange;
                  return (
                    <View
                      key={colIndex}
                      style={{
                        flex: end - start + 1,
                        flexDirection: "row",
                        justifyContent: "flex-end",
                        paddingRight: screenWidth * 0.22,
                      }}
                    >
                      <H6>{columns[start]?.label}</H6>
                    </View>
                  );
                }

                if (isIndexInAnyRange(colIndex, mergableRows)) return null;

                return <H6 key={colIndex}>{col.label}</H6>;
              })}
            </View>

            <View style={styles.body}>
              {content?.map((row, rowIndex: number) => (
                <View
                  key={rowIndex}
                  style={[
                    styles.content,
                    rowIndex !== content?.length - 1 && styles.withBorder,
                  ]}
                >
                  <View style={styles.rows}>
                    {columns?.map((col, colIndex: number) => {
                      const mergeRange = mergableRows.find(
                        ([start]) => start === colIndex
                      );

                      if (mergeRange) {
                        const [start, end] = mergeRange;
                        const slicedColumns = Object.keys(row).slice(
                          start,
                          end + 1
                        );

                        const options = slicedColumns.map((key) => ({
                          label: labelMap[key] ?? key,
                          ...slicedColumns,
                        }));

                        return (
                          <View
                            key={colIndex}
                            style={{
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              flex: 1,
                              gap: 8,
                            }}
                          >
                            {options?.map((c, i) => {
                              const key = slicedColumns[i];
                              const isChecked = row[key];
                              return (
                                <Radio
                                  key={`${colIndex}-${i}`}
                                  isChecked={isChecked}
                                  onPress={() => {
                                    if (
                                      typeof key === "string" &&
                                      ["enterCount", "notNeeded"].includes(key)
                                    ) {
                                      onRadioChange?.(
                                        rowIndex,
                                        key as "enterCount" | "notNeeded"
                                      );
                                    }
                                  }}
                                >
                                  {c.label}
                                </Radio>
                              );
                            })}
                          </View>
                        );
                      }

                      return (
                        <View key={colIndex}>
                          <B3 style={{ width: "100%", flexWrap: "wrap" }}>
                            {row[col.key] === undefined
                              ? "0"
                              : Number(row[col.key]) === 0
                              ? "Not needed"
                              : String(row[col.key])}
                          </B3>
                        </View>
                      );
                    })}
                  </View>
                  {row.enterCount && (
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <Input
                        value={String(row.countMale ?? "")}
                        onChangeText={(text: string) =>
                          onInputChange?.(rowIndex, "male", text)
                        }
                        placeholder="Enter male"
                        keyboardType="number-pad"
                        style={{ flex: 1 }}
                      />
                      <Input
                        value={String(row.countFemale ?? "")}
                        onChangeText={(text: string) =>
                          onInputChange?.(rowIndex, "female", text)
                        }
                        placeholder="Enter female"
                        keyboardType="number-pad"
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    );
};

export default Table;

const styles = StyleSheet.create({
    tableWithLabel: {
        flexDirection: "column",
        gap: 12,
    },
    labelWithCount: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 4,
    },
    table: {
        borderWidth: 1,
        borderColor: getColor("green", 100),
        borderRadius: 12,
    },
    header: {
        backgroundColor: getColor("green", 100),
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    body: {
        flexDirection: "column",
    },
    content: {
        flexDirection: "column",
        gap: 12,
        padding: 12,
    },
    rows: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    withBorder: {
        borderBottomWidth: 1,
        borderBottomColor: getColor("green", 100),
    }

});
