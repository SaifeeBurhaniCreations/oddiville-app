// 1. React and React Native core
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// 2. Third-party dependencies
import { useDispatch, useSelector } from 'react-redux';

// 3. Project components
import BackButton from '@/src/components/ui/Buttons/BackButton';
import PageHeader from '@/src/components/ui/PageHeader';
import Button from '@/src/components/ui/Buttons/Button';
import PackagingSizeCard from "@/src/components/ui/Packaging/PackgingSizeCard";
import BottomSheet from '@/src/components/ui/BottomSheet';
import Loader from '@/src/components/ui/Loader';
import EmptyState from '@/src/components/ui/EmptyState';

// 4. Project hooks
import useValidateAndOpenBottomSheet from '@/src/hooks/useValidateAndOpenBottomSheet';
import { useParams } from '@/src/hooks/useParams';
import { usePackageById, usePackageSocketSync } from '@/src/hooks/Packages';

// 5. Project constants/utilities
import { getColor } from '@/src/constants/colors';
import { chunkCards } from '@/src/utils/arrayUtils';
import { formatPackageParams } from '@/src/constants/Packets';
import { getEmptyStateData, PackageIconInput } from '@/src/utils/common';
import { PackageIconKey, setPackageSize } from '@/src/redux/slices/package-size.slice';
import { setCurrentProductId } from '@/src/redux/slices/current-product.slice';
import { sortBy } from '@/src/utils/numberUtils';

// 6. Types
import { RootState } from '@/src/redux/store';

// 7. Schemas
// No items of this type

// 8. Assets 
// No items of this type

import { useAuth } from '@/src/context/AuthContext';
import { resolveAccess } from '@/src/utils/policiesUtils';
import { PACKAGE_BACK_ROUTES, resolveBackRoute, resolveDefaultRoute } from '@/src/utils/backRouteUtils';
import { getTareWeight, parseWeightBoth } from '@/src/utils/packing/weightutils';
import PaperRollIcon from "@/src/components/icons/packaging/PaperRollIcon";
import BagIcon from "@/src/components/icons/packaging/BagIcon";
import BigBagIcon from "@/src/components/icons/packaging/BigBagIcon";
import OverlayLoader from '@/src/components/ui/OverlayLoader';


export const PACKAGE_ICON_MAP: Record<PackageIconKey, React.ComponentType<any>> =
{
  "paper-roll": PaperRollIcon,
  "bag": BagIcon,
  "big-bag": BigBagIcon,
};

export const mapPackageIconKey = (item: PackageIconInput): PackageIconKey => {
  if (!item.unit) return "bag";

  const size = Number(item.size);
  if (Number.isNaN(size)) return "bag";

  const grams =
    item.unit === "kg" ? size * 1000 :
    item.unit === "gm" ? size :
    0;

  if (grams <= 250) return "paper-roll";
  if (grams <= 500) return "bag";
  return "big-bag";
};

const PackagingDetailsScreen = () => {
    usePackageSocketSync();
  const { role, policies } = useAuth();

  const safeRole = role ?? "guest";
  const safePolicies = policies ?? [];
  const access = resolveAccess(safeRole, safePolicies);
  
  const { id: packageId, name: packageName } = useParams('packaging-details', 'id', "name");
  const { data: packageData, isFetching: packageLoading } = usePackageById(packageId!);
  const isLoadingPackage = useSelector((state: RootState) => state.fillPackage.isLoading);
  const isLoadingPackageSize = useSelector((state: RootState) => state.packageSizePackaging.isLoadingPackageSize);

  const packages = useMemo(() => {
    return formatPackageParams({ types: packageData?.types });
  }, [packageData]);

const uiPackages = useMemo(() => {
  if (!packages) return [];

  return packages.map((pkg) => {
    const qtyKg = Number(pkg.quantity) || 0;

    const { value: sizeValue, unit: sizeUnit } = parseWeightBoth(pkg.weight);

    const tare = getTareWeight("pouch", sizeValue, sizeUnit);
    const packetCount =
      tare > 0 ? Math.floor((qtyKg * 1000) / tare) : 0;

    return {
      ...pkg,
      quantityKg: qtyKg,
      displayQuantity: String(packetCount),
    };
  });
}, [packages]);

  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { validateAndSetData } = useValidateAndOpenBottomSheet();

  const handleOpen = (id: string) => {
    const match = packages?.find(pkg => pkg.weight === id);
    if (!match) return;

    const { value, unit } = parseWeightBoth(match.weight);
    const tare = getTareWeight("pouch", value, unit);

    const qtyKg = Number(match.quantity) || 0;
    const packetCount =
      tare > 0 ? Math.floor((qtyKg * 1000) / tare) : 0;

        dispatch(setPackageSize({
          ...match,
            iconKey: mapPackageIconKey({
            size: value,
            unit,
            // rawSize: match.weight,
          }),
          id: packageId,
        }));

    const fillPackage = {
      sections: [
        {
          type: 'title-with-details-cross',
          data: {
            title: 'Add package count',
            description: `${match.weight} • ${packetCount} packets`,
            details: { icon: "pencil" }
          },
        },
        {
          type: 'input',
          data: {
            placeholder: 'Enter counts',
            label: 'Add package',
            keyboardType: 'number-pad',
            formField: "quantity"
          },
        },
      ],
      buttons: [
        {
          text: 'Add',
          variant: 'fill',
          color: 'green',
          alignment: "full",
          disabled: false,
          actionKey: "add-package-quantity"
        },
      ],
    };

    setIsLoading(true);
    validateAndSetData(id, "fill-package", fillPackage);
    setIsLoading(false);
  };

  const handleOpenAddNewSize = () => {
    dispatch(setCurrentProductId(packageId));
    setIsLoading(true);
    validateAndSetData(`${packageId}:${packageName}`, "add-package");
    setIsLoading(false);
  };

  const emptyStateData = getEmptyStateData("packaging-details");

  const backRoute = resolveBackRoute(access, PACKAGE_BACK_ROUTES, resolveDefaultRoute(access));
  // console.log("uiPackages", JSON.stringify(uiPackages, null, 2));
  
  return (
    <View style={styles.pageContainer}>
      <PageHeader page={'SKU'} />
      <View style={styles.wrapper}>
        <View style={[styles.HStack, styles.justifyBetween, styles.alignCenter]}>
          <BackButton
            label={packageName ? packageName : "UnTitled"}
            backRoute={backRoute}
          />

          <Button variant='outline' size='md' onPress={handleOpenAddNewSize}>
            Add new size
          </Button>
        </View>

        <View style={styles.cardList}>
          {!uiPackages ? ( <OverlayLoader />) : uiPackages?.length > 0 ? (
            chunkCards(sortBy([...uiPackages], "weight"), 2).map((pair, index) => (
              <View key={index} style={styles.cardRow}>
                {pair.map((item, i) => (
                  <View key={i} style={styles.cardWrapper}>
                    <PackagingSizeCard
                      icon={item.icon ? item.icon : BagIcon}
                      weight={item.weight || ""}
                      quantity={item.displayQuantity || ""}
                      disabled={item.disabled || false}
                      onPress={() => handleOpen(item?.weight)}
                    />
                  </View>
                ))}
                {pair?.length === 1 && <View style={styles.cardWrapper} />}
              </View>
            ))
          ) : (
            <EmptyState stateData={emptyStateData} />
          )}
        </View>

        <BottomSheet color='green' />
          {(isLoadingPackageSize || isLoadingPackage || packageLoading) && <OverlayLoader /> }
      </View>
    </View>
  );
};

export default PackagingDetailsScreen;

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: getColor('green', 500),
    position: "relative",
  },
  wrapper: {
    flex: 1,
    flexDirection: "column",
    gap: 24,
    backgroundColor: getColor('light', 200),
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    padding: 16,
  },
  flexGrow: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: getColor('green', 500, 0.1),
    zIndex: 2,
  },
  content: {
    flexDirection: "column",
    gap: 16,
    height: "100%"
  },
  HStack: {
    flexDirection: "row"
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center"
  },
  gap8: {
    gap: 8,
  },
  cardList: {
    flexDirection: "column",
    gap: 16,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
  },
});