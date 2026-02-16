import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import PageHeader from "@/src/components/ui/PageHeader";
import { getColor } from "@/src/constants/colors";
import { H3 } from "@/src/components/typography/Typography";
import Select from "@/src/components/ui/Select";
import useValidateAndOpenBottomSheet from "@/src/hooks/useValidateAndOpenBottomSheet";
import { FILTER_COMPONENTS } from "@/src/constants/exportFilterComponents";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { ExportFiltersState } from "@/src/types/export/types";
import Button from "@/src/components/ui/Buttons/Button";
import {
  setLoading,
  setPreviewCount,
} from "@/src/redux/slices/export/exportFilters.slice";
import Alert from "@/src/components/ui/Alert";
import {
  downloadExportFile,
  fetchExportRowsCount,
} from "@/src/services/exportData.service";
import * as FileSystem from "expo-file-system/legacy";
import { Lane } from "@/src/types/lanes.dto";
import { useLanes } from "@/src/hooks/useFetchData";

function resolveLaneIds(filters: ExportFiltersState, lanes: Lane[]) {
  if (filters.selectAllLanes) {
    return lanes.map((l) => l.id);
  }
  return filters.laneIds;
}

const ExportData = () => {
  const dispatch = useDispatch();
  const { meta } = useSelector((state: RootState) => state.bottomSheet);
  const { data: lanes } = useLanes();

  const { validateAndSetData } = useValidateAndOpenBottomSheet();
  const { type, loading, previewCount } = useSelector(
    (state: RootState) => state.exportData,
  );
  const [filters, setFilters] = useState<ExportFiltersState>({
    type: null,
    range: "today",
    from: null,
    to: null,
    chamberIds: [],
    laneIds: [],
    selectAllLanes: true,
    status: [],
    vendors: [],
    materials: [],
  });

  // console.log("filters", filters);

  useEffect(() => {
    if (!type || !lanes) return;

    const timeout = setTimeout(async () => {
      const payload = {
        ...filters,
        lanes: resolveLaneIds(filters, lanes),
      };

      const data = await fetchExportRowsCount(type, payload);

      dispatch(setPreviewCount(data.count));

      setPreviewCount(data.count);
    }, 300);

    return () => clearTimeout(timeout);
  }, [type, filters]);

  const FilterComp = type ? FILTER_COMPONENTS[type] : null;

  const handlePress = () => {
    validateAndSetData("nothing", "choose-export-type");
  };

  const handleExport = async () => {
    if (!type || previewCount === 0 || !lanes) return;

    try {
      dispatch(setLoading(true));

      const payload = {
        ...filters,
        lanes: resolveLaneIds(filters, lanes),
      };
      const uri = await downloadExportFile(type, payload);

      const fileName = uri.split("/").pop()!;

      const info = await FileSystem.getInfoAsync(uri);

      let sizeKB = "0";

      if (info.exists && !info.isDirectory && typeof info.size === "number") {
        sizeKB = (info.size / 1024).toFixed(1);
      }

      const exportDataOptions = {
        sections: [
          {
            type: "header",
            data: {
              label: "Export options",
              title: fileName,
              value: "",
              icon: "calendar",
              description: "",
              color: "red",
            },
          },
          {
            type: "data",
            data: [
              {
                title: "Export Details",
                details: [
                  {
                    row_1: [
                      {
                        label: "Rows",
                        value: String(previewCount),
                        icon: "database",
                      },
                      {
                        label: "File size",
                        value: `${sizeKB} KB`,
                        icon: "file",
                      },
                    ],
                  },
                  {
                    row_2: [
                      {
                        label: "Type",
                        value: type,
                        icon: "truck-num",
                      },
                      {
                        label: "Range",
                        value: filters.range,
                        icon: "clock",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        buttons: [
          {
            text: "open",
            variant: "fill",
            color: "green",
            alignment: "half",
            disabled: false,
            actionKey: "export-open",
          },
          {
            text: "share",
            variant: "outline",
            color: "green",
            alignment: "half",
            disabled: false,
            actionKey: "export-share",
          },
        ],
      };

      validateAndSetData("nothing", "export-data-options", {
        ...exportDataOptions,
        data: {
          fileUri: uri,
          fileName,
          size: `${sizeKB} KB`,
          rows: previewCount,
          type,
          range: filters.range,
        },
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.rootContainer}>
      <PageHeader page="Export Reports" />

      <View style={styles.wrapper}>
       <ScrollView>
        <View style={styles.body}>
           <View style={styles.header}>
            <H3>Report Type: </H3>

            <View style={{ flex: 1 }}>
              <Select
                value={type || "Select type"}
                options={[]}
                onPress={handlePress}
                showOptions={false}
              />
            </View>
          </View>

          {FilterComp && <FilterComp state={filters} setState={setFilters} />}
        </View>
       </ScrollView>
        <View style={styles.footer}>
          {type && (
            <Alert
              color="blue"
              text={`${previewCount} rows will be exported`}
            />
          )}

          <Button
            onPress={handleExport}
            disabled={previewCount === 0 || !type || loading}
          >
            {loading ? "Exporting..." : "Export"}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ExportData;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: getColor("green", 500),
  },
  wrapper: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    backgroundColor: getColor("light", 200),
    gap: 16,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    paddingTop: 16,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  footer: {
    paddingBottom: 32,
    gap: 24,
  },
});
