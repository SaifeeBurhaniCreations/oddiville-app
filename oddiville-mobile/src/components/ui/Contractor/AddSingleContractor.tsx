import { StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Button from "../Buttons/Button";
import Table from "../Table";
import Input from "../Inputs/Input";
import { useLocations } from "@/src/hooks/useFetchData";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import addContractorSchema, {
  ContractorData,
} from "@/src/schemas/AddContractorSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContractor } from "@/src/services/contractor.service";
import Loader from "../Loader";
import { renameKey } from "@/src/hooks/renameKey";
import { WorkLocation } from "@/src/hooks/useContractor";

const columns = [
  { label: "Locations", key: "location" },
  { label: "Count", key: "enterCount" },
];

const AddSingleContractor = ({
  setToast,
  onContractorAdded,
  onSubmit: OnParentSubmit,
  isSubmitting= false,
}: {
  setToast?: (val: boolean) => void;
  onContractorAdded?: (success: boolean, message: string) => void;
  onSubmit: (contractorPayload: { name: string; male_count: number; female_count: number; work_location: WorkLocation[]; }) => Promise<void>;
  isSubmitting: boolean;
}) => {
  const { data } = useLocations();

  // local work rows seeded from locations
  const [workAssigned, setWorkAssigned] = useState<
    Array<{
      location: string;
      enterCount: boolean;
      notNeeded: boolean;
      countMale: string;
      countFemale: string;
      count: string;
    }>
  >([]);

  // seed rows once when locations arrive
  useEffect(() => {
    if (!Array.isArray(data)) return;

    const mapped = data.map((location: any) => ({
      location: location.location_name,
      enterCount: false,
      notNeeded: true,
      countMale: "",
      countFemale: "",
      count: "",
    }));

    setWorkAssigned((prev) => (prev.length ? prev : mapped));
  }, [data]);

  const [contractorName, setContractorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [workerCount, setworkerCount] = useState({
    male: 0,
    female: 0,
  });

  const handleRadioChange = (rowIndex: number, field: string) => {
    setWorkAssigned((prev) => {
      const updated = [...prev];
      updated[rowIndex] = {
        ...updated[rowIndex],
        enterCount: field === "enterCount",
        notNeeded: field === "notNeeded",
        countMale: field === "notNeeded" ? "" : updated[rowIndex].countMale ?? "",
        countFemale: field === "notNeeded" ? "" : updated[rowIndex].countFemale ?? "",
      };
      return updated;
    });
  };

  const handleInputChange = (
    rowIndex: number,
    field: "male" | "female",
    value: string
  ) => {
    const num = Number(value);
    if (isNaN(num) || num < 0) return;

    const current = workAssigned[rowIndex] ?? {
      location: "",
      enterCount: false,
      notNeeded: true,
      countMale: "",
      countFemale: "",
      count: "",
    };

    const nextRow = {
      ...current,
      countMale: field === "male" ? value : current.countMale ?? "",
      countFemale: field === "female" ? value : current.countFemale ?? "",
    };

    const rowMale = Number(nextRow.countMale || 0) || 0;
    const rowFemale = Number(nextRow.countFemale || 0) || 0;
    const nextRowCount = rowMale + rowFemale;

    const otherTotal = workAssigned.reduce((acc, row, idx) => {
      if (idx === rowIndex) return acc;
      const c = Number(row.count || 0) || 0;
      return acc + c;
    }, 0);

    const totalWorkerCount = (Number(workerCount.male) || 0) + (Number(workerCount.female) || 0);
    const prospectiveTotal = otherTotal + nextRowCount;

    if (prospectiveTotal > totalWorkerCount) {
      setToast?.(true);
      return;
    }

    setWorkAssigned((prev) => {
      const updated = [...prev];
      updated[rowIndex] = { ...nextRow, count: String(nextRowCount) } as any;
      return updated as any;
    });
  };

  const totalAssignedCount = workAssigned.reduce((acc, row) => {
    const countNum = Number(row.count || 0) || 0;
    return acc + countNum;
  }, 0);

  const totalWorkerCount =
    (Number(workerCount.male) || 0) + (Number(workerCount.female) || 0);

  const isAddDisabled =
    !contractorName ||
    totalAssignedCount === 0 ||
    totalAssignedCount > totalWorkerCount ||
    totalWorkerCount !== totalAssignedCount;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContractorData>({
    resolver: zodResolver(addContractorSchema),
    mode: "onChange",
  });

  const clearLocalState = () => {
    // reset counts and name and workAssigned to initial mapping (if data exists)
    setContractorName("");
    setworkerCount({ male: 0, female: 0 });
    if (Array.isArray(data)) {
      const mapped = data.map((location: any) => ({
        location: location.location_name,
        enterCount: false,
        notNeeded: true,
        countMale: "",
        countFemale: "",
        count: "",
      }));
      setWorkAssigned(mapped);
    } else {
      setWorkAssigned([]);
    }
  };

  const onSubmit: SubmitHandler<ContractorData> = async (formData: any) => {
    // Build final payload: an array (your API expects array)
    const workLocationPayload = workAssigned.map((loc) =>
      renameKey(loc, "location", "name")
    );

    const finalData = [
      {
        ...formData,
        work_location: workLocationPayload,
      },
    ];

    try {
      setLoading(true);
      const response = await createContractor(finalData);
      if (response && (response.status === 201 || response.status === 200)) {
        onContractorAdded?.(true, "Successfully added contractor");
        OnParentSubmit?.({
          name: formData.name,
          male_count: formData.male_count,
          female_count: formData.female_count,
          work_location: workLocationPayload,
        });
        reset();
        clearLocalState();
      } else {
        onContractorAdded?.(false, "Failed to add contractor");
      }
    } catch (error: any) {
      console.log("Create contractor failed:", error?.response?.data || error?.message);
      onContractorAdded?.(false, error?.message || "Failed to add contractor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.flexGrow, styles.single]}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="Enter name"
            value={value}
            onChangeText={(name: string) => {
              setContractorName(name);
              onChange(name);
            }}
            onBlur={onBlur}
            error={errors.name?.message}
          >
            Contractor name
          </Input>
        )}
      />

      <View style={styles.count}>
        <Controller
          control={control}
          name="male_count"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter male"
              keyboardType="number-pad"
              value={value?.toString() ?? ""}
              onChangeText={(male: string) => {
                const parsed = parseInt(male, 10);
                const finalValue = isNaN(parsed) ? 0 : parsed;
                setworkerCount((prev) => ({ ...prev, male: finalValue }));
                onChange(finalValue);
              }}
              onBlur={onBlur}
              error={errors.male_count?.message}
              style={{ flex: 1 }}
            >
              Male Count
            </Input>
          )}
        />

        <Controller
          control={control}
          name="female_count"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Enter female"
              keyboardType="number-pad"
              value={value?.toString() ?? ""}
              onChangeText={(female: string) => {
                const parsed = parseInt(female, 10);
                const finalValue = isNaN(parsed) ? 0 : parsed;
                setworkerCount((prev) => ({ ...prev, female: finalValue }));
                onChange(finalValue);
              }}
              onBlur={onBlur}
              error={errors.female_count?.message}
              style={{ flex: 1 }}
            >
              Female Count
            </Input>
          )}
        />
      </View>

      <Table
        columns={columns}
        content={workAssigned}
        mergableRows={[[1, 2]]}
        onRadioChange={handleRadioChange}
        onInputChange={handleInputChange}
      />

      <Button
        disabled={isAddDisabled || loading || isSubmitting}
        onPress={handleSubmit(onSubmit)}
      >
        {loading && <Loader size={20} />}{" "}
        {loading ? "Adding contractor..." : "Add contractor"}
      </Button>
    </View>
  );
};

export default AddSingleContractor;

const styles = StyleSheet.create({
  flexGrow: {
    flex: 1,
  },
  count: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  single: {
    flexDirection: "column",
    gap: 16,
    padding: 16,
  },
});