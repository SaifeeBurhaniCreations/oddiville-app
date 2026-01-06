import { closeBottomSheet } from "../redux/slices/bottomsheet.slice";
import { ButtonActionType } from "../types";

export const buttonActionMap: Record<
    ButtonActionType,
    ({goTo, dispatch, meta}: any) => void
> = {
    "alert-to-manager": () => {

    },
    "ship-order": ({goTo, dispatch, meta}) => {
        try {
            goTo('shipping-details', { orderId: meta?.id })
            dispatch(closeBottomSheet());
        }
        catch (error: any) {
            console.log("error in ship-order", error.message);
        }
    },
    "order-raw-material": () => {

    },
    "create-order": () => {

    },
    "package-comes-to-end": () => {

    },
};
