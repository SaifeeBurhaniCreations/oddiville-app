import WindMillBg from '@/src/components/icons/card-bg/WindMill-bg';
import WorkerBg from '@/src/components/icons/card-bg/worker-bg';
import MoneyBg from '@/src/components/icons/card-bg/Money-bg';
import WarehouseBg from '@/src/components/icons/card-bg/Warehouse-bg';
// import TruckBg from '@/src/components/icons/card-bg/Truck-bg';
import TractorBg from '@/src/components/icons/card-bg/Tractor-bg';
import FarmhouseBg from '@/src/components/icons/card-bg/Farmhouse-bg';
import { BottomSheetSchemaKey } from '../schemas/BottomSheetSchema';
import chamberDefaultImg from "@/src/assets/images/warehouse/chamber-default.png"
import productionDefaultImg from "@/src/assets/images/fallback/colourful/product.png"

export function chunkArray<T,>(array: T[], size: number): T[][] {
  const result = [];
  for (let i = 0; i < array?.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};

const backgroundImages = [
  WindMillBg,
  WorkerBg,
  MoneyBg,
  WarehouseBg,
  TractorBg,
  FarmhouseBg,
];

export function getRandomBackground() {
  const randomIndex = Math.floor(Math.random() * backgroundImages?.length);
  return backgroundImages[randomIndex];
}

const imageMap: Record<string, any> = {
  Carrot: require('@/src/assets/images/item-icons/Carrot.png'),
  Carrots: require('@/src/assets/images/item-icons/Carrot.png'),
  Peas: require('@/src/assets/images/item-icons/Peas.png'),
  Potato: require('@/src/assets/images/item-icons/Potato.png'),
  Potatoes: require('@/src/assets/images/item-icons/Potato.png'),
  Onion: require('@/src/assets/images/item-icons/Onion.png'),
  Onions: require('@/src/assets/images/item-icons/Onion.png'),
  Radish: require('@/src/assets/images/item-icons/Radish.png'),
  Radishes: require('@/src/assets/images/item-icons/Radish.png'),
  Tomato: require('@/src/assets/images/item-icons/Tomato.png'),
  Tomatoes: require('@/src/assets/images/item-icons/Tomato.png'),
  Okra: require('@/src/assets/images/item-icons/Okra.png'),
  Okras: require('@/src/assets/images/item-icons/Okra.png'),
  Broccoli: require('@/src/assets/images/item-icons/Broccoli.png'),
  Broccolis: require('@/src/assets/images/item-icons/Broccoli.png'),
};

export const labelMap: Record<string, string> = {
  enterCount: 'Count',
  notNeeded: 'Not needed',
};

export const getImageSource = ({ image, bg = true, options }: { image?: string | number; bg?: boolean, options?: { isProductionItem?: boolean, isChamberItem?: boolean }}) => {
  const isValidUrl = typeof image === 'string' && image.startsWith("http");

  if (isValidUrl) {
    return { image, isRawMaterial: bg ? true : false };
  }

  if (options?.isChamberItem) {
    return { image: productionDefaultImg, isRawMaterial: false };
  }

  if (options?.isProductionItem) {
    return { image: productionDefaultImg, isRawMaterial: false };
  }

  return { image: chamberDefaultImg, isRawMaterial: false };
}

export function chunkCards<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr?.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function getMergedDetails(item: Record<string, any>) {
  return Object.entries(item)
    .filter(([key]) => key.startsWith("details"))
    .flatMap(([_, val]) => (Array.isArray(val) ? val : []));
};


// export function getLimitedMaterialNames(
//   selected: { name: string }[],
//   maxChars: number = 10
// ): string {
//   let result = '';
//   let count = 0;

//   for (const item of selected) {
//     const name = item.name;
//     if ((result + name)?.length + (result ? 2 : 0) > maxChars) break;
//     result += (result ? ', ' : '') + name;
//     count++;
//   }

//   const remaining = selected?.length - count;
//   return remaining > 0 ? `${result}, +${remaining} more` : result;
// }

export function getLimitedMaterialNames(
  selected: { name: string }[],
  charLimit: number = 10
): string {
  if (!selected || selected?.length === 0) return "";
  const firstName = selected[0].name || "";
  let result = firstName?.length > charLimit
    ? firstName.slice(0, charLimit) + "…"
    : firstName;
  if (selected?.length > 1) {
    result += ` +${selected?.length - 1} more`;
  }
  return result;
}

export function truncate(value: string, limit: number = 10) {
  if (!value) return "";
  return value?.length > limit ? value.substring(0, limit) + '…' : value;
}


export function getLimitedVendorNames(
  selected: { name: string }[],
  maxChars: number = 10
): string {
  let result = '';
  let count = 0;

  for (const item of selected) {
    const name = item.name;
    if ((result + name)?.length + (result ? 2 : 0) > maxChars) break;
    result += (result ? ', ' : '') + name;
    count++;
  }

  const remaining = selected?.length - count;
  return remaining > 0 ? `${result}, +${remaining} more` : result;
}

export function isActionableNotification(type: BottomSheetSchemaKey) {
    const validActionableTypes = ["order-ready"];

    return validActionableTypes.includes(type);
};
export function isTodaysNotification(type: BottomSheetSchemaKey) {
    const validTodaysTypes = ["calendar-event-scheduled"];

    return validTodaysTypes.includes(type);
};