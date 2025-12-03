
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import {
    fetchLocations,
    remove as removeLocation,
} from "@/services/WorkLocationService";
import {
    handleFetchData,
    handleRemoveData,
} from "@/redux/WorkLocationSlice";

const useManageWorkLocations = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filteredData, setFilteredData] = useState([]);
    
    const dispatch = useDispatch();
    const workLocation = useSelector((state) => state.location.data);

  
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const workLocationRes = await fetchLocations();
                dispatch(handleFetchData(workLocationRes.data));
            } catch (error) {
                toast.error("Failed to fetch data");
                console.error(error);
            }
        };

       
        workLocation?.length === 0 ? fetchAll() : setIsLoading(false);
    }, [dispatch, workLocation?.length]);

  
    useEffect(() => {
        setFilteredData(workLocation);
       
        if (workLocation) {
             setIsLoading(false);
        }
    }, [workLocation]);

   
    const handleDeleteClick = (location) => {
        setSelectedLocation(location);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!selectedLocation?.id) return;
        setIsDeleting(true); 
        
        try {
            const response = await removeLocation(selectedLocation.id);
            if (response.status === 200) {
               
                dispatch(handleRemoveData(selectedLocation.id)); 
                toast.success("Location deleted successfully!");
                setShowModal(false);
                setSelectedLocation(null);
            } else {
                toast.error("Failed to delete location");
            }
        } catch (error) {
            console.error("Error deleting location:", error);
            toast.error("Error deleting location");
        } finally {
            setIsDeleting(false); 
        }
    };

    return {
        isLoading,
        isDeleting,
        filteredData,
        showModal,
        selectedLocation,
        handleDeleteClick,
        handleDelete,
        setShowModal,
    };
};

export default useManageWorkLocations;