import peasPacketImg from "@/src/assets/images/packaging/packaging-1.png"
import peasPacketBundleImg from "@/src/assets/images/packaging/packaging-1-bundle.png"
import { mapPackageIcon } from "../utils/common"
import { kConverter } from "../utils/common"
import { PackageItem, PackageItemProp, RootStackParamList } from "../types"

interface FormatParamsOptions {
    types?: PackageItem[];
}

export const formatPackageParams = ({ types = [] }: FormatParamsOptions) => {
    return types?.map((item) => {
        const iconComp = mapPackageIcon(item);
        const parseSize = String(item.size)
        let weight = "";

        const isNumericOnly = /^[\d.]+$/.test(parseSize);
        const [size, desc] = parseSize.split(" ")

        
        if (isNumericOnly) {
            weight = `${size}${!item.unit ? "" : item.unit}`;
        } else {
            weight = `${size}${!item.unit ? "" : item.unit} ${desc ? desc: ""}`;
        }

        return {
            weight: weight,
            quantity: kConverter(Number(item.quantity)!),
            icon: iconComp,
            disabled: Number(item?.quantity) <= 0 ? true : false,
        };
    });
};

export const PACKET_ITEMS = (data: PackageItemProp[]) => {
    return data?.map((val: any) => ({
        name: val?.product_name,
        id: val.id,
        img: peasPacketImg,
        bundle: peasPacketBundleImg,
        // params: val?.types?.map((item: any) => {
        //     const iconComp = mapPackageIcon(item)
        //     return {
        //         weight: `${item.size}${item.unit}`,
        //         quantity: kConverter(item.quantity),
        //         icon: iconComp,
        //         disabled: Number(val.quantity) <= 0 ? true : false
        //     }
        // }),
        href: 'packaging-details' as keyof RootStackParamList
    }))
}