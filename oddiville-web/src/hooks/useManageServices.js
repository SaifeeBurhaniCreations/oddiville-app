
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
    fetchChamber,
    fetchDryWarehouse,
    remove as removeService,
} from "@/services/DryChamberService";
import { handleFetchData, handleRemoveData } from "@/redux/ServiceDataSlice";
import { useChamberstock } from "./chamberStock";

const useManageServices = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [structuredData, setStructuredData] = useState([]);

    const dispatch = useDispatch();
    const serviceData = useSelector((state) => state.ServiceDataSlice.data);
    const chambers = useSelector((state) => state.ServiceDataSlice.chamber);
    const {data: chamberStock, isLoading: chamberStockLoading } = useChamberstock();
    const chamberStockMap = new Map();
    chamberStock?.forEach((item) => {
        chamberStockMap.set(item.product_name, item.image);
    });
   
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const warehouseRes = await fetchDryWarehouse();
                
                dispatch(handleFetchData(warehouseRes.data));

                const chamberRes = await fetchChamber();
                if (chamberRes.status === 200) {
                    dispatch({
                        type: "ServiceDataSlice/handleFetchCategory",
                        payload: chamberRes.data,
                    });
                }
            } catch (error) {
                toast.error("Failed to fetch data");
                console.error(error);
            }
        };
       
        if (serviceData?.length === 0) {
            fetchAll();
        } else {
            setIsLoading(false);
        }
    }, [dispatch, serviceData?.length]);

   
useEffect(() => {
    if (!serviceData || serviceData.length === 0) {
        setStructuredData([]);
        setIsLoading(false);
        return;
    }

    setStructuredData(groupStructuredDryItems(serviceData));
    setIsLoading(false);

}, [serviceData]);

const groupStructuredDryItems = (data) => {
    const packagingMap = new Map();
    const dryMap = new Map();

    data.forEach((item) => {
        if (item.item_type === "packaging") {
            const productKey = item.product_name;
            const image = chamberStockMap.get(productKey);
            
            const skuKey = `${item.sku_size}_${item.sku_unit}`;

            if (!packagingMap.has(productKey)) {
                packagingMap.set(productKey, {
                    type: "packaging",
                    product: productKey,
                    image,
                    skuMap: new Map(),
                });
            }

            const productGroup = packagingMap.get(productKey);

            if (!productGroup.skuMap.has(skuKey)) {
                productGroup.skuMap.set(skuKey, {
                    skuKey,
                    size: Number(item.sku_size),
                    unit: item.sku_unit,
                    ratings: [],
                });
            }

            productGroup.skuMap.get(skuKey).ratings.push({
                quantity: item.quantity,
                chamber_name: item.chamber_name,
                id: item.id,
            });

        } else if (item.item_type === "dry") {

            const dryKey = item.item_name;

            if (!dryMap.has(dryKey)) {
                dryMap.set(dryKey, {
                    type: "dry",
                    item_name: dryKey,
                    ratings: [],
                });
            }

            dryMap.get(dryKey).ratings.push({
                quantity: item.quantity,
                chamber_name: item.chamber_name,
                id: item.id,
            });
        }
    });
const packagingResult = Array.from(packagingMap.values()).map(product => {
    const skus = Array.from(product.skuMap.values());

    const totalQty = skus.reduce((acc, sku) => {
        const skuTotal = sku.ratings.reduce(
            (sum, r) => sum + Number(r.quantity || 0),
            0
        );
        return acc + skuTotal;
    }, 0);

    return {
        type: "packaging",
        product: product.product,
        image: product.image,
        skus,
        totalQuantity: totalQty,
    };
});

    const dryResult = Array.from(dryMap.values());

    return [...packagingResult, ...dryResult];
};

const handleFilter = (chamberName) => {
    if (!serviceData) return;

    if (chamberName === "All") {
        setStructuredData(groupStructuredDryItems(serviceData));
        return;
    }

    const filtered = serviceData.filter((item) =>
        item?.chamber_name === chamberName
    );

    setStructuredData(groupStructuredDryItems(filtered));
};

const handleDelete = async () => {
    if (!selectedService?.id) return;
    setIsLoading(true);

    try {
        const response = await removeService(selectedService.id);

        if (response.status === 200) {
            dispatch(handleRemoveData(selectedService.id));
            toast.success("Item deleted successfully!");
            setShowModal(false);
        } else {
            toast.error("Failed to delete service");
        }
    } catch (error) {
        console.error("Error deleting service:", error);
        toast.error("Error deleting service");
    } finally {
        setIsLoading(false); 
    }
};

const handleDeleteClick = (ratingLot) => {
    setSelectedService(ratingLot);
    setShowModal(true);
};

    return {
        isLoading,
        structuredData,
        chambers,
        showModal,
        selectedService,
        handleFilter,
        handleDeleteClick,
        handleDelete,
        setShowModal,
    };
};

export default useManageServices;