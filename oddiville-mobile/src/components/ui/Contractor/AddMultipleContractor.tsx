import { StyleSheet, View } from 'react-native'
import Button from '../Buttons/Button'
import EmptyState from '../EmptyState'
import ContractorWorkLocationCard from '../ContractorWorkLocationCard'
import { useEffect, useState } from 'react'
import { useLocations } from '@/src/hooks/useFetchData'
import NoContractorBatchImg from "@/src/assets/images/illustrations/no-contractor-batch.png"
 
import { workAssignedMultiple } from '@/src/types'
import { createContractor } from '@/src/services/contractor.service'
import { useContractor } from '@/src/hooks/useContractor'
import { TableColumn } from '../Table'

export type ContractorLocationRow = {
  location: string
  enterCount: boolean
  notNeeded: boolean
  count: string
  countMale?: string
  countFemale?: string
}

const columns: TableColumn<ContractorLocationRow>[] = [
  { label: "Locations", key: "location" },
  { label: "Count", key: "enterCount" },
]


const AddMultipleContractor = ({ setToast, onContractorAdded }: { setToast?: (val: boolean) => void, onContractorAdded?: (success: boolean, message: string) => void }) => {

    const { data } = useLocations();

    const workLocation = Array.isArray(data) ? data?.map((location: any) => ({
        location: location.location_name,
        enterCount: false,
        notNeeded: true,
        countMale: '',
        countFemale: '',
        count: '',
    })) : [];
    
    const [workAssignedMultiple, setWorkAssignedMultiple] = useState<workAssignedMultiple[]>([]);
    const [selectedContractor, setSelectedContractor] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isAddDisabled, setIsAddDisabled] = useState<boolean>(false)
    const [workerCount, setworkerCount] = useState<number>(0)
    const { data: AllContractors } = useContractor();

    // useEffect(()=>{
    //     console.log(JSON.stringify(workAssignedMultiple));
    // },[workAssignedMultiple])

    useEffect(() => {
    if (!Array.isArray(AllContractors) || AllContractors.length === 0) return;
  
    const mapped = AllContractors.map((c: any, idx: number) => {
      const locations = Array.isArray(c.work_location)
        ? c.work_location.map((loc: any) => {
            const name = loc.name ?? loc.location ?? String(loc.location_name ?? '');
            const count = Number(loc.count ?? (Number(loc.countMale || 0) + Number(loc.countFemale || 0))) || 0;
            const countMale = loc.male_count ?? loc.countMale ?? '';
            const countFemale = loc.female_count ?? loc.countFemale ?? '';
            const notNeeded = !(count > 0);
            return {
              location: name,
              enterCount: !notNeeded,
              notNeeded,
              countMale: countMale !== undefined ? String(countMale) : '',
              countFemale: countFemale !== undefined ? String(countFemale) : '',
              count: count ? String(count) : '',
            };
          })
        : [];
  
      return {
        contractorName: c.name ?? `Contractor ${idx + 1}`,
        male_count: String(c.male_count ?? 0),
        female_count: String(c.female_count ?? 0),
        locations,
      } as any;
    });
  
    setWorkAssignedMultiple(mapped);
    if (mapped.length > 0) {
      setSelectedContractor(0);
      const firstTotal = Number(mapped[0].male_count || 0) + Number(mapped[0].female_count || 0);
      setworkerCount(firstTotal);
    }
    }, [AllContractors]);

  
    // useEffect(() => {
    //     // console.log(JSON.stringify(createInitialDataMultiple(contractor)));
    //     console.log('contractor===', JSON.stringify(workAssignedMultiple));
    // }, [workAssignedMultiple])

    const handleMultipleContractorRadioChange = (contractorIndex: number, locationIndex: number, field: "enterCount" | "notNeeded") => {
        setWorkAssignedMultiple(prev => {
            const updatedContractors = [...prev];
            const updatedLocations = [...updatedContractors[contractorIndex].locations];

            updatedLocations[locationIndex] = {
                ...updatedLocations[locationIndex],
                enterCount: field === 'enterCount',
                notNeeded: field === 'notNeeded',
                countMale: field === 'notNeeded' ? "" : (updatedLocations[locationIndex].countMale ?? ''),
                countFemale: field === 'notNeeded' ? "" : (updatedLocations[locationIndex].countFemale ?? ''),
                count: field === 'notNeeded' ? "" : (updatedLocations[locationIndex].count ?? ''),
            };

            updatedContractors[contractorIndex] = {
                ...updatedContractors[contractorIndex],
                locations: updatedLocations,
            };

            return updatedContractors;
        });
    };

    const handleMultipleContractorInputChange = (contractorIndex: number, locationIndex: number, field: "male" | "female", value: string) => {
        const num = Number(value);
        if (isNaN(num) || num < 0) return;

        setWorkAssignedMultiple(prev => {
            const updatedContractors = [...prev];
            const updatedLocations = [...updatedContractors[contractorIndex].locations];

            const currentRow = { ...updatedLocations[locationIndex] } as any;
            const nextRow = {
                ...currentRow,
                countMale: field === 'male' ? value : (currentRow.countMale ?? ''),
                countFemale: field === 'female' ? value : (currentRow.countFemale ?? ''),
            } as any;
            const nextRowMale = Number(nextRow.countMale || 0);
            const nextRowFemale = Number(nextRow.countFemale || 0);
            const nextRowCount = String((isNaN(nextRowMale) ? 0 : nextRowMale) + (isNaN(nextRowFemale) ? 0 : nextRowFemale));

            // compute total with this prospective row
            const otherTotal = updatedLocations.reduce((acc, row, idx) => {
                if (idx === locationIndex) return acc;
                const c = Number((row as any).count);
                return acc + (isNaN(c) ? 0 : c);
            }, 0);
            const prospectiveTotal = otherTotal + Number(nextRowCount);
            if (prospectiveTotal > workerCount) {
                setToast && setToast(true);
                return prev;
            }

            updatedLocations[locationIndex] = { ...nextRow, count: nextRowCount } as any;
            updatedContractors[contractorIndex] = {
                ...updatedContractors[contractorIndex],
                locations: updatedLocations,
            };
            return updatedContractors;
        });
    };

    const onSubmit = async () => {
        const finalPayload = workAssignedMultiple.map((contractor: any) => {
          const wl = (contractor.locations || [])
            .filter((loc: any) => !loc.notNeeded) 
            .map((loc: any) => {
              const count = Number(loc.count ?? (Number(loc.countMale || 0) + Number(loc.countFemale || 0))) || 0;
              const male_count = loc.countMale !== '' ? Number(loc.countMale) || 0 : undefined;
              const female_count = loc.countFemale !== '' ? Number(loc.countFemale) || 0 : undefined;
              const out: any = { name: loc.location, count };
              if (male_count !== undefined) out.male_count = male_count;
              if (female_count !== undefined) out.female_count = female_count;
              return out;
            });
      
          return {
            name: contractor.contractorName,
            male_count: Number(contractor.male_count) || 0,
            female_count: Number(contractor.female_count) || 0,
            work_location: wl,
          };
        });
      
        try {
          setLoading(true);
          const response = await createContractor(finalPayload);
          if (response.status === 201) {
            onContractorAdded && onContractorAdded(true, 'Successfully added contractor');
            setSelectedContractor(0);
            setWorkAssignedMultiple([]);
            setworkerCount(0);
          } else {
            // handle non-201 if needed
            onContractorAdded && onContractorAdded(false, 'Failed to add contractor');
          }
        } catch (error: any) {
          console.log('Create failed:', error?.response?.data || error?.message);
          onContractorAdded && onContractorAdded(false, error?.response?.data?.error || 'Error');
        } finally {
          setLoading(false);
        }
      };
      
    const handleAddContractor = () => {
        setWorkAssignedMultiple([
            ...workAssignedMultiple,
            {
                contractorName: `Contractor ${workAssignedMultiple?.length + 1}`,
                male_count: "",
                female_count: "",
                locations: Array.isArray(workLocation)
                    ? workLocation.map(loc => ({
                        location: loc.location,
                        enterCount: false,
                        notNeeded: true,
                        count: ""
                    }))
                    : []
            }
        ]);
    };

const handleLabourRemove = (contractorIndex: number) => {
  setWorkAssignedMultiple(prev =>
    prev.filter((_, idx) => idx !== contractorIndex)
  );
};

    return (
        <View style={[styles.flexGrow, { paddingTop: 16, gap: '24' }]}>
            {
                workAssignedMultiple?.length > 0 ? workAssignedMultiple?.map((workAssigned, index) => (
                 <ContractorWorkLocationCard
                            key={index}
                            workAssigned={workAssigned}
                            setIsAddDisabled={setIsAddDisabled}
                            setWorkAssigned={setWorkAssignedMultiple}
                            contractorIndex={index}
                            setworkerCount={setworkerCount}
                            isFirst={index === 0}
                            isOpen={selectedContractor === index}
                            onPress={() => setSelectedContractor(index)}
                            columns={columns}
                            handleRadioChange={handleMultipleContractorRadioChange}
                            handleInputChange={handleMultipleContractorInputChange}
                            onLabourRemove={handleLabourRemove}
                            />
                ))
                    :
                    <View style={[styles.flexGrow, styles.emptyState]}>
                        <EmptyState
                            stateData={{
                                title: "No contractor batches selected",
                                description: "No active batches right now. Enjoy the calm!",
                            }}
                            image={NoContractorBatchImg}
                            color="green"
                        />
                    </View>
            }
            <View style={[styles.Hstack, { marginBottom: 16 }]}>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Button
                        onPress={handleAddContractor}
                    >
                        Add Contractor
                    </Button>
                </View>
                <View style={{ flex: 1, marginRight: 16 }}>
                    <Button
                        onPress={() => onSubmit()}
                        disabled={loading || isAddDisabled}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </View>
            </View>
        </View>
    )
}

export default AddMultipleContractor

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        flexDirection: "row",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    flexGrow: {
        flex: 1,
    },
    Hstack: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        justifyContent: 'center'
    }
})