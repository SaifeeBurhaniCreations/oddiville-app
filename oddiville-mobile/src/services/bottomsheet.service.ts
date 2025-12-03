import api from "@/src/lib/axios";
import { BottomSheetSchemaKey } from "../schemas/BottomSheetSchema";

const getBottomSheetData = (id: string, type: BottomSheetSchemaKey) => {
    return api.get(`/bottomsheet/${type}/${id}`);
};


export { getBottomSheetData };