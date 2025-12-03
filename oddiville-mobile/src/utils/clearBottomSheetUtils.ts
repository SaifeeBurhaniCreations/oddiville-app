import { Store } from '@reduxjs/toolkit';
import { BottomSheetSchemaKey } from '../schemas/BottomSheetSchema';
import { clearChambers, clearRawMaterials } from '../redux/slices/bottomsheet/raw-material.slice';
import { clearUnit } from '../redux/slices/unit-select.slice';
import { selectChamber, setIsChamberSelected } from '../redux/slices/chamber.slice';

export function clearInputBottomSheet(
    type: BottomSheetSchemaKey,
    dispatch: Store['dispatch'],
    resetForm?: () => void
) {
    switch (type) {
        case "add-raw-material":
            dispatch(clearRawMaterials());
            break;
        case "multiple-chamber-list":
            dispatch(clearChambers());
            break;
        case "chamber-list":
            dispatch(selectChamber(""));
            dispatch(setIsChamberSelected(false));
            break;
        case "add-product-package":
            dispatch(clearRawMaterials());
            dispatch(clearUnit());
            resetForm && resetForm();
            break;
        case "add-package":
            dispatch(clearUnit());
            resetForm && resetForm();
            break;

        default:
            console.log("No BottomSheet configured!")
            break;
    }
}
