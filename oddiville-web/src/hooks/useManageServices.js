
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
    fetchChamber,
    fetchDryWarehouse,
    remove as removeService,
} from "@/services/DryChamberService";
import { handleFetchData, handleRemoveData } from "@/redux/ServiceDataSlice";

const useManageServices = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);

    const dispatch = useDispatch();
    const serviceData = useSelector((state) => state.ServiceDataSlice.data);
    const chambers = useSelector((state) => state.ServiceDataSlice.chamber);

   
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
        setFilteredData(groupDryItems(serviceData));
        if (serviceData) {
            setIsLoading(false);
        }
    }, [serviceData]);

const groupDryItems = (data) => {
    const map = new Map();

    data.forEach((item) => {
        
        let key = undefined;
        if(item.product_name) {
            key = `${item.product_name}_${item.size}_${item.unit}`;
        } else {
            key = `${item.item_name}_${item.id}`;
        }

        if (!map.has(key)) {
            map.set(key, {
                groupKey: key,
                product_name: item.product_name ? item.product_name : item.item_name,
                size: item.size,
                unit: item.unit,
                warehouse_date: item.warehoused_date,
                ratings: [],
            });
        }

        map.get(key).ratings.push({
            rating: item.rating,
            quantity: item.quantity,
            chamber_name: item.chamber_name,
            id: item.id,
        });
    });

    const result = Array.from(map.values());

    result.forEach(group => {
        group.ratings.sort((a, b) => Number(b.rating) - Number(a.rating));
    });

    return result;
};

const handleFilter = (chamberName) => {
    if (chamberName === "All") {
        setFilteredData(groupDryItems(serviceData));
        return;
    }

    const filtered = serviceData.filter((item) => {
        if (!item?.chamber_name) return false;
        return item.chamber_name === chamberName;
    });

    setFilteredData(groupDryItems(filtered));
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
        filteredData,
        chambers,
        showModal,
        selectedService,
        handleFilter,
        handleDeleteClick,
        handleDelete,
        handleDeleteClick,
        setShowModal,
    };
};

export default useManageServices;