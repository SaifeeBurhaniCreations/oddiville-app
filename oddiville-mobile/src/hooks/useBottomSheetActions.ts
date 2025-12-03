import { useDispatch, useSelector } from "react-redux";
import { closeBottomSheet } from "@/src/redux/slices/bottomsheet.slice";
import { AppDispatch, RootState } from "@/src/redux/store";
import { useAppNavigation } from "./useAppNavigation";
import {
  AddPackageSizeForm,
  AddProductPackageForm,
} from "../components/ui/bottom-sheet/InputWithSelectComponent";
import { useGlobalFormValidator } from "../sbc/form/globalFormInstance";
import { useCreatePackage, useUpdatePackage } from "./Packages";
import { useUpdateOrder } from "./dispatchOrder";
import { AddPackageQuantityForm } from "../components/ui/bottom-sheet/InputComponent";
import { setIsChamberSelected } from "../redux/slices/chamber.slice";
import { StoreMaterialForm } from "../components/ui/bottom-sheet/AddonInputComponent";
import { useChamber } from "./useChambers";
import {
  clearChambers,
  clearRawMaterials,
} from "../redux/slices/bottomsheet/raw-material.slice";
import { useCompleteProduction } from "./production";
import { resetProductStore } from "../redux/slices/store-product.slice";
import { splitValueAndUnit } from "../utils/common";
import { reset as chamberRatingReset } from "../redux/slices/bottomsheet/chamber-ratings.slice";
import { reset as chamberReset } from "../redux/slices/chamber.slice";
import { StoreProductProps } from "../types";
import { setIsLoadingPackage } from "../redux/slices/fill-package.slice";
import { setIsLoadingPackageSize } from "../redux/slices/package-size.slice";
import { clearUnit } from "../redux/slices/unit-select.slice";
import { setIsProductLoading } from "../redux/slices/product.slice";
import { setProductionLoading } from "../redux/slices/production.slice";
import { useChamberStock } from "./useChamberStock";
import { setChambersAndTotal } from "../redux/slices/production-begin.slice";
import { clearFilter } from "../redux/slices/bottomsheet/filters.slice";

export const useBottomSheetActions = (meta?: { id: string; type: string }) => {
  const { packages } = useSelector(
    (state: RootState) => state.packageSizePackaging
  );
  const productName = useSelector(
    (state: RootState) => state.productionBegins.productName
  );
  const metaBottomSheet = useSelector(
    (state: RootState) => state.bottomSheet.meta
  );

  const dispatch = useDispatch<AppDispatch>();
  const { goTo } = useAppNavigation();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();
  const updateOrder = useUpdateOrder();
  const completeProduction = useCompleteProduction();
  const { data: chambers } = useChamber();
  const chamberRatingsById = useSelector(
    (state: RootState) => state.chamberRatings.byId
  );

  const { data: chambersY } = useChamber();
  const { data: stocksY } = useChamberStock();

  type Chamber = {
    id: string;
    chamber_name: string;
    capacity: number;
  };

  type ChamberGoods = {
    id: string;
    chamber: { id: string; quantity: string }[];
  };

  function getRemainingChamberQuantities(
    chambersY: Chamber[] | undefined,
    stocksY: ChamberGoods[] | undefined
  ) {
    return (chambersY ?? []).map((chamber) => {
      const quantities = (stocksY ?? []).flatMap((stock) =>
        stock.chamber
          ?.filter((ch) => ch.id === chamber.id)
          ?.map((ch) => parseFloat(ch.quantity))
      );
      const totalOccupied = quantities.reduce((acc, val) => acc + val, 0);
      const remaining = chamber.capacity - totalOccupied;

      return {
        chamber_id: chamber.id,
        chamber_name: chamber.chamber_name,
        capacity: chamber.capacity,
        occupied: totalOccupied,
        remaining,
      };
    });
  }

  const productPackageForm = useGlobalFormValidator<AddProductPackageForm>(
    "add-product-package"
  );

  const packageSizeForm =
    useGlobalFormValidator<AddPackageSizeForm>("add-package-size");

  const packageQuantityForm = useGlobalFormValidator<AddPackageQuantityForm>(
    "add-package-quantity"
  );

  const storeQuantityForm =
    useGlobalFormValidator<StoreMaterialForm>("store-product");

  function formatStoreProduct(data: any) {
    const finalData: StoreProductProps = {
      wastage_quantity: Number(data.wastage_quantity || 0),
      end_time: new Date(),
      chambers: [],
    };

    for (const key in data) {
      if (key.toLowerCase().startsWith("chamber")) {
        const chamberName = key.trim();
        const quantity = Number(data[key].value);
        const rating = data[key].rating;

        const matchedChamber =
          chambers &&
          chambers.find(
            (chamber: { chamber_name: string }) =>
              chamber.chamber_name === chamberName
          );

        if (matchedChamber) {
          finalData.chambers.push({
            id: matchedChamber.id,
            quantity,
            rating,
          });
        }
      }
    }

    return finalData;
  }

  const chamberSummaries = getRemainingChamberQuantities(chambersY, stocksY);

  const chambersSummary = (chamberSummaries ?? []).map((chamber) => ({
    chamberName: chamber.chamber_name,
    quantity: String(chamber.occupied),
  }));

  const chamberCapacityWithName = (chamberSummaries ?? []).map((chamber) => ({
    chamberName: chamber.chamber_name,
    chamberCapacity: String(chamber.capacity),
  }));

  const total =
    chamberSummaries?.reduce((sum, chamber) => sum + chamber.occupied, 0) ?? 0;

  const message =
    chamberSummaries && chamberSummaries.length === 0
      ? "No chamber data available"
      : undefined;

  const actions: Record<string, () => void | Promise<void>> = {
    "add-raw-material": () => {
      if (!meta?.id) {
        console.warn("No ID for this action");
        return;
      }
      try {
        // console.log("selected Raw Materials", selectedRawMaterials);
      } catch (error: any) {
        console.log("error in add-raw-material", error.message);
      }
    },

    "add-product-package": async () => {
      try {
        const quantity = Number(productPackageForm.values.quantity);
        const sizeValue = Number(productPackageForm.values.size.trim());

        const finalQty = !isNaN(sizeValue) ? quantity * sizeValue : quantity;

        const productPackagePayload = {
          ...productPackageForm.values,
          quantity: String(finalQty),
        };

        const result = productPackageForm?.validateForm(productPackagePayload);

        if (result.success) {
          const {
            raw_materials,
            quantity,
            size,
            product_name,
            unit,
            chamber_name,
          } = result.data;

          dispatch(setIsProductLoading(true));
          createPackage.mutate(
            {
              product_name,
              types: [
                {
                  quantity,
                  size,
                  unit: (unit === "null" ? null : unit) as "kg" | "gm" | null,
                },
              ],
              raw_materials: raw_materials?.map((val: any) => val.name),
              chamber_name,
            },
            {
              onSuccess: (result) => {
                productPackageForm?.resetForm();
                dispatch(clearUnit());
                dispatch(clearRawMaterials());
                dispatch(setIsProductLoading(false));
              },
              onError: (error) => {
                console.log("error in onSuccess create");
                dispatch(setIsProductLoading(false));
              },
            }
          );
        } else {
          console.log("validation failed");
        }
      } catch (error: any) {
        console.log("error in add-product-package", error.message);
      }
    },

    "add-package": async () => {
      if (!meta?.id) {
        console.warn("No ID for this action");
        return;
      }
      try {
        const quantity = Number(packageSizeForm.values.quantity);
        const sizeValue = Number(packageSizeForm.values.size.trim());

        const finalQty = !isNaN(sizeValue) ? quantity * sizeValue : quantity;

        const packageSizePayload = {
          ...packageSizeForm.values,
          quantity: String(finalQty),
        };

        const result_package_form = packageSizeForm?.validateForm(packageSizePayload);

        if (result_package_form.success) {
          dispatch(setIsLoadingPackageSize(true));

          let unit: string | null;
          let rest: any;

          if (
            result_package_form?.data &&
            result_package_form?.data.unit !== "null"
          ) {
            ({ unit, ...rest } = result_package_form.data);
          } else {
            unit = null;
            rest = result_package_form?.data || {};
          }
          updatePackage.mutate(
            { id: meta?.id, data: { ...rest, unit } },
            {
              onSuccess: (result) => {
                packageSizeForm.resetForm();
                dispatch(clearUnit());
                dispatch(setIsLoadingPackageSize(false));
              },
              onError: (error) => {
                console.log("error in onSuccess update [add-package]", error);
              },
            }
          );
        } else {
          console.log("validation failed");
        }
      } catch (error: any) {
        console.log("error in add-product-size", error.message);
      }
    },

    "add-package-quantity": async () => {
      try {
        dispatch(setIsLoadingPackage(true));
        const { weight, id } = packages;
        if (!id) {
          console.warn("No ID for this action");
          return;
        }

        const { number, unit } = splitValueAndUnit(weight);

         const quantity = Number(packageQuantityForm.values.quantity);
        const sizeValue = Number(packageQuantityForm.values.size.trim());

        const finalQty = !isNaN(sizeValue) ? quantity * sizeValue : quantity;

        const packageQuantityPayload = {
          quantity: String(finalQty),
        };

        const result = packageQuantityForm?.validateForm(packageQuantityPayload);

        if (result.success) {
          await new Promise((resolve, reject) => {
            updatePackage.mutate(
              {
                id,
                data: {
                  quantity: packageQuantityForm?.values?.quantity,
                  size: String(number),
                  unit,
                },
              },
              {
                onSuccess: (result) => {
                  packageSizeForm?.resetForm();
                  resolve(result);
                },
                onError: (error) => {
                  console.log(
                    "error in onSuccess update [add-package-quantity]"
                  );
                  reject(error);
                },
              }
            );
          });
        } else {
          console.log("validation failed");
        }
      } catch (error: any) {
        console.log("error in add-package-count", error.message);
      } finally {
        packageQuantityForm.resetForm();
      }
    },

    "choose-chamber": () => {
      if (!meta?.id) {
        console.warn("No ID for this action");
        return;
      }

      dispatch(
        setChambersAndTotal({
          productName,
          chambers: chambersSummary,
          chamberCapacityWithName,
          total: total,
          ...(message ? { message } : {}),
        })
      );

      try {
        dispatch(setIsChamberSelected(true));
      } catch (error: any) {
        console.log("error in add-raw-material", error.message);
      }
    },

    "store-product": async () => {
      if (!meta?.id) {
        console.warn("No ID for this action");
        return;
      }
      try {
        const updatedValues: typeof storeQuantityForm.values = {
          ...storeQuantityForm.values,
        };

        Object.keys(updatedValues).forEach((chamber) => {
          if (chamber === "discard_quantity") return;

          const prevValue = updatedValues[chamber];
          const rating = chamberRatingsById[chamber]?.rating ?? 0;

          updatedValues[chamber] = {
            value: prevValue,
            rating,
          };
        });
        const result_store_quantity_form =
          storeQuantityForm?.validateForm(updatedValues);

        if (result_store_quantity_form.success) {
          dispatch(setProductionLoading(true));

          const formData = formatStoreProduct(result_store_quantity_form?.data);

          try {
            await completeProduction.mutateAsync({
              id: meta.id,
              data: formData,
            });
            dispatch(clearChambers());
            dispatch(setProductionLoading(false));
            dispatch(resetProductStore());
            dispatch(chamberRatingReset());
            dispatch(chamberReset());
            storeQuantityForm.resetForm();
            goTo("supervisor-production");
          } catch (e) {
            dispatch(setProductionLoading(false));
          }
        }
      } catch (error: any) {
        console.log("error in add-raw-material", error.message);
      }
    },

    "ship-order": () => {
      if (!meta?.id) {
        console.warn("No order ID provided for ship-order action");
        return;
      }
      try {
        goTo("shipping-details", { orderId: meta?.id });
        dispatch(closeBottomSheet());
      } catch (error: any) {
        console.log("error in ship-order", error.message);
      }
    },

    "order-reached": async () => {
      if (!meta?.id) {
        console.warn("No order ID provided for order-reached action");
        return;
      }
      try {
        updateOrder.mutate(
          {
            id: meta?.id,
            data: {
              status: "completed",
              delivered_date: JSON.stringify(new Date()),
            },
          },
          {
            onSuccess: (result) => {
              dispatch(closeBottomSheet());
            },
            onError: (error) => {
              console.log("error in updateOrder");
            },
          }
        );
      } catch (error: any) {
        console.log("error in order-reached", error.message);
      }
    },

    "clear-filter": () => {
      const { mainSelection, subSelection } = metaBottomSheet || {};
      // dispatch(clearFilter())
      console.log("mainSelection, subSelection", mainSelection, subSelection);
    },
    "edit-order": () => {
      if (meta?.id) {
        // goTo("Packaging", { id: meta.id });
      }
    },

    "cancel-order": () => {
      dispatch(closeBottomSheet());
    },

    cancel: () => {
      dispatch(closeBottomSheet());
    },
  };

  const runAction = (key?: string) => {
    if (!key || !actions[key]) {
      console.warn("No bottom sheet action found for:", key);
      return;
    }
    actions[key]();
  };

  return { runAction };
};
