import { getColor } from '@/src/constants/colors'
import { ContractorWorkLocationCardProps, workAssignedMultiple } from '@/src/types'
import { Pressable, StyleSheet, View } from 'react-native'
import { H5 } from '../typography/Typography'
import UpChevron from '../icons/navigation/UpChevron'
import DownChevron from '../icons/navigation/DownChevron'
import Input from './Inputs/Input'
import Table from './Table'
import { useEffect } from 'react'
import TrashIcon from '../icons/common/TrashIcon'
import { ContractorLocationRow } from './Contractor/AddMultipleContractor'

const ContractorWorkLocationCard = ({
  workAssigned,
  isFirst,
  contractorIndex,
  isOpen,
  columns,
  setIsAddDisabled,
  onPress,
  handleRadioChange,
  handleInputChange,
  setWorkAssigned,
  setworkerCount,
  onLabourRemove,
  ...props
}: ContractorWorkLocationCardProps) => {

  const isValidRadioKey = (key: string): key is "enterCount" | "notNeeded" =>
    key === "enterCount" || key === "notNeeded";

  const isAddDisabled =
    (Number(workAssigned?.male_count) + Number(workAssigned?.female_count)) <
    workAssigned?.locations?.reduce((total, loc) => {
      const count = Number(loc.count);
      return total + (isNaN(count) ? 0 : count);
    }, 0);

  useEffect(()=>{
    setIsAddDisabled(isAddDisabled) 
    setworkerCount(
      (Number(workAssigned?.male_count) + Number(workAssigned?.female_count))
    );   
  }, [isAddDisabled, handleInputChange, handleRadioChange, workAssigned])

  const isGenderField = (field: string): field is "male" | "female" =>
  field === "male" || field === "female"

  return (
    <View style={[styles.card, isFirst && styles.firstCard]} {...props}>
        <Pressable style={styles.cardHeader} onPress={onPress}>
        <H5 color={getColor("light")}>{workAssigned.contractorName}</H5>
            <View style={styles.Hstack}>
            <Pressable
              style={styles.dropdownIcon}
              onPress={(e) => {
                e.stopPropagation?.();
            onLabourRemove?.(contractorIndex)
              }}
            >
              <TrashIcon color={getColor("green")} />
            </Pressable>
        {
            isOpen ? <View style={styles.dropdownIcon}><UpChevron color={getColor("green")} /></View> : <View style={styles.dropdownIcon}><DownChevron color={getColor("green")} /></View>
        }
          </View>
      </Pressable>
      {isOpen && <View style={styles.cardBody}>
        <Input
          placeholder='Enter name'
          value={workAssigned.contractorName || ''}
          onChangeText={(name: string) => {
            setWorkAssigned((prev: workAssignedMultiple[]) => {
              const updated = [...prev];
              if (updated[contractorIndex]) {
                updated[contractorIndex] = { ...updated[contractorIndex], contractorName: name };
              }
              return updated;
            });
          }}
        >
          Contractor name
        </Input>
        <View style={styles.count}>
        <Input
          placeholder="Enter male"
          keyboardType="number-pad"
          style={{ flex: 1 }}
          value={workAssigned.male_count?.toString() || ''}
          onChangeText={(count: string) => {
            setWorkAssigned((prev: workAssignedMultiple[]) => {
              const updated = [...prev];
              if (updated[contractorIndex]) {
                updated[contractorIndex] = {
                  ...updated[contractorIndex],
                  male_count: count,
                };
              }
              return updated;
            });
          }}
        >
          Male count
        </Input>

        <Input
          placeholder="Enter female"
          keyboardType="number-pad"
          style={{ flex: 1 }}
          value={workAssigned.female_count?.toString() || ''}
          onChangeText={(count: string) => {
            setWorkAssigned((prev: workAssignedMultiple[]) => {
              const updated = [...prev];
              if (updated[contractorIndex]) {
                updated[contractorIndex] = {
                  ...updated[contractorIndex],
                  female_count: count,
                };
              }
              return updated;
            });
          }}
        >
          Female count
        </Input>

        </View>
        <Table
          columns={columns}
          content={workAssigned.locations}
          mergableRows={[[1, 2]]}
          onRadioChange={(
            locationIndex: number,
            field: keyof ContractorLocationRow
          ) => {
            if (!isValidRadioKey(field as string)) return
            handleRadioChange(
              contractorIndex,
              locationIndex,
              field as "enterCount" | "notNeeded"
            )
          }}
         onInputChange={(
          locationIndex: number,
          field: string,
          value: string
        ) => {
          if (!isGenderField(field)) return
          handleInputChange(contractorIndex, locationIndex, field, value)
        }}
        />
      </View>
      }
    </View>
  )
}

export default ContractorWorkLocationCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: getColor("green"),
    },
    firstCard: {
        borderTopStartRadius: 16,
        borderTopEndRadius: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    dropdownIcon: {
        padding: 8,
        backgroundColor: getColor("light"),
        borderRadius: "50%",
        alignItems: "center",
        justifyContent: "center",
    },
    cardBody: {
        backgroundColor: getColor("light"),
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "column",
        gap: 16
    },
    count: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
      },
    Hstack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})