
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { fetchLanes, remove as removeLane } from "@/services/LaneService";
import { handleFetchData, handleDeleteData } from "@/redux/LaneDataSlice";

const useManageLanes = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedLane, setSelectedLane] = useState(null);
    const [isInitialLoading, setIsInitialLoading] = useState(false); 
    const [isDeleting, setIsDeleting] = useState(false); 
    const [filteredData, setFilteredData] = useState([]);
    const dispatch = useDispatch();
    const lanes = useSelector((state) => state.lane.data);

    
    useEffect(() => {
        const fetchAll = async () => {
            setIsInitialLoading(true);
            try {
                const getLane = await fetchLanes();
                dispatch(handleFetchData(getLane.data));
            } catch (error) {
                toast.error("Failed to fetch data");
                console.error(error);
            } finally {
                setIsInitialLoading(false);
            }
        };

      
        lanes?.length === 0 ? fetchAll() : setIsInitialLoading(false);
    }, [dispatch, lanes?.length]);


    useEffect(() => {
        setFilteredData(lanes);
    }, [lanes]);

 
    const handleDeleteClick = (lane) => {
        setSelectedLane(lane);
        setShowModal(true);
    };

    const handleDelete = async () => {
       
        const laneId = selectedLane?.id || selectedLane?._id; 
        if (!laneId) return;

        setIsDeleting(true); 
        try {
            const response = await removeLane(laneId);
            if (response.status === 200) {
               
                dispatch(handleDeleteData(laneId));
                toast.success("Lane deleted successfully!");
                setShowModal(false);
                setSelectedLane(null);
            } else {
                toast.error("Failed to delete lane");
            }
        } catch (error) {
            console.error("Error deleting lane:", error);
            toast.error("Error deleting lane");
        } finally {
            setIsDeleting(false); 
        }
    };

    return {
        isInitialLoading,
        isDeleting,
        filteredData,
        showModal,
        selectedLane,
        handleDeleteClick,
        handleDelete,
        setShowModal,
    };
};

export default useManageLanes;