import { AppDispatch } from "@/src/redux/store";
import { validRouteOptionList } from "../types";
import {
  setCity,
  setCitySearched,
  setState,
  setStateSearched,
} from "../redux/slices/bottomsheet/location.slice";
import { closeBottomSheet } from "../redux/slices/bottomsheet.slice";
import { setProductName } from "../redux/slices/product.slice";
import { selectChamber } from "../redux/slices/chamber.slice";

export function setReduxRoute(
  route: validRouteOptionList,
  dispatch: AppDispatch,
  item: string | { name: string; isoCode: string },
) {
  switch (route) {
    case "state":
      if (
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        "isoCode" in item
      ) {
        dispatch(setState(item));
        dispatch(setStateSearched(""));
      } else {
        console.warn("Invalid item for setState; expected object");
      }
      break;

    case "city":
      if (typeof item === "string") {
        dispatch(setCity(item));
        dispatch(setCitySearched(""));
      } else if (typeof item === "object" && item !== null && "name" in item) {
        dispatch(setCity(item.name));
        dispatch(setCitySearched(""));
      } else {
        console.warn(
          "Invalid item for setCity; expected string or name property",
        );
      }
      break;

    case "product":
      dispatch(setProductName(item));
      dispatch(closeBottomSheet());
      break;

    case "chamber":
      dispatch(selectChamber(item));
      dispatch(closeBottomSheet());
      break;

    default:
      console.log("redux > state-city-product-chamber > Route not found");
      break;
  }
}
