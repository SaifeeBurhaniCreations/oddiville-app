
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
       
        setFilteredData(serviceData);
        if (serviceData) {
            setIsLoading(false);
        }
    }, [serviceData]);


    const handleFilter = (chamberName) => {
        setFilteredData(
            chamberName === "All"
                ? serviceData
                : serviceData.filter((item) => item?.chamber_id === chamberName)
        );
    };

    const handleDeleteClick = (service) => {
        setSelectedService(service);
        setShowModal(true);
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
        } 
        
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
        setShowModal,
    };
};

export default useManageServices;