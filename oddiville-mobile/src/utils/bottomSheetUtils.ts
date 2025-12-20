import { FilterEnum, BottomSheetSchemaKey } from "../schemas/BottomSheetSchema";
import { ButtonConfig } from "../types";

type SectionType = "title-with-checkbox" | "optionList";
interface CheckboxData { text: string; isChecked: boolean; }
interface SectionData { key: FilterEnum; options: CheckboxData[]; }
interface OptionListData { isCheckEnable: boolean; options: string[]; }
interface Section { type: SectionType; data: SectionData | OptionListData; }
interface Filter { sections: Section[]; buttons?: ButtonConfig[] }

const filterDataMap: Record<FilterEnum, CheckboxData[]> = {
    "chamber:detailed": [
        { text: "Material", isChecked: false },
        { text: "Others", isChecked: false },
        { text: "Packed", isChecked: false },
    ],
    "home:activities": [
        { text: "Last 14 hours", isChecked: false },
        { text: "Today", isChecked: false },
        { text: "Last 7 days", isChecked: false },
        { text: "Last 30 days", isChecked: false },
    ],
    "order:upcoming": [
        { text: "Est order date", isChecked: false },
        { text: "Price", isChecked: false },
        { text: "Destination", isChecked: false },
    ],
    "order:inprogress": [
        { text: "Scheduled dispatch date", isChecked: false },
        { text: "Price", isChecked: false },
        { text: "Under time", isChecked: false },
        { text: "Destination", isChecked: false },
    ],
    "order:completed": [
        { text: "Delivered within SLA", isChecked: false },
        { text: "Price", isChecked: false },
        { text: "Delayed/Exceeded ETA", isChecked: false },
        { text: "Destination", isChecked: false },
    ],
    "raw-material:overview": [
        { text: "Name", isChecked: false },
    ],
    "raw-material:detailed": [
        { text: "Name", isChecked: false },
        { text: "Total quantity", isChecked: false },
        { text: "Remaining quantity", isChecked: false },
        { text: "Category", isChecked: false },
    ],
    "vendor:order": [
        { text: "Vendor name", isChecked: false },
        { text: "Raw material", isChecked: false },
        { text: "Order date", isChecked: false },
        { text: "Price", isChecked: false },
        { text: "Quantity", isChecked: false },
    ],
    "vendor:overview": [
        { text: "Vendor name", isChecked: false },
        { text: "Raw material", isChecked: false },
    ],
    "user:overview": [
        { text: "Role", isChecked: false },
        { text: "User name", isChecked: false },
    ],
};

const filterDataDetailMap: Record<FilterEnum, string[]> = {
    "order:upcoming": ["Name", "quantity"],
    "order:inprogress": ["Name", "quantity"],
    "order:completed": ["Name", "quantity"],
    "raw-material:overview": ["Name", "quantity"],
    "raw-material:detailed": ["Name", "quantity"],
    "vendor:order": ["Name", "quantity"],
    "vendor:overview": ["Name", "quantity"],
    "user:overview": ["Name", "quantity"],
    "chamber:detailed": ["Name", "quantity"],
    "home:activities": ["Name", "quantity"],
};

function buildSection(
  key: FilterEnum,
  options: CheckboxData[] | string[],
  mode: "select-main" | "select-detail"
): Section {
  if (mode === "select-main") {
    const checkboxOptions = options as CheckboxData[];

    return {
      type: "optionList",
      data: {
        isCheckEnable: false,
        options: checkboxOptions.map(o => o.text),
      },
    };
  } else if (mode === "select-detail") {
    return {
      type: "optionList",
      data: {
        isCheckEnable: false,
        options: options as string[],
      },
    };
  }
  throw new Error(`Unhandled mode: ${mode}`);
}

// function buildSection(
//     key: FilterEnum,
//     options: CheckboxData[] | string[],
//     mode: "select-main" | "select-detail"
// ): Section {
//     if (mode === "select-main") {
//         return { type: "title-with-checkbox", data: { key, options: options as CheckboxData[] } };
//     } else if (mode === "select-detail") {
//         return { type: "optionList", data: { isCheckEnable: false, options: options as string[] } };
//     }
//     throw new Error(`Unhandled mode: ${mode}`);
// }

export const runFilter = ({
    key,
    validateAndSetData,
    mode,
    filterData,
    extraMeta,
}: {
    key: FilterEnum;
    validateAndSetData: (id: string, type: BottomSheetSchemaKey, overrideConfig?: any) => void;
    mode: "select-main" | "select-detail";
    filterData?: any;
    extraMeta?: Record<string, any>
}) => {
    const options = mode === "select-main" ? filterDataMap[key] : (filterData ?? filterDataDetailMap[key]);

    if (!options) throw new Error("No filter data found for key: " + key);
    const currentFilter: Filter = mode === "select-main" ? {
        sections: [buildSection(key, options, mode)], buttons: [
            { text: 'Cancel', variant: 'outline', color: 'green', alignment: "half", disabled: false },
            { text: 'Clear', variant: 'fill', color: 'green', alignment: "half", disabled: false, actionKey: "clear-filter" },
        ],
    } : { sections: [buildSection(key, options, mode)] };
    
    validateAndSetData(key, "filter", { ...currentFilter, mode, ...extraMeta });
}