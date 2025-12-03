import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator";
import {
  create,
  modify,
  fetchLanes,
  remove as removeLane,
} from "@/services/LaneService";

import {
  handleFetchData,
  handlePostData,
  handleModifyData,
  handleDeleteData,
} from "@/redux/LaneDataSlice";

import { initialLaneState, laneValidationSchema } from "@/schemas/LaneSchema";

const useLanesManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const lanes = useSelector((state) => state.lane.data);

  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedLane, setSelectedLane] = useState(null);

  const [filteredData, setFilteredData] = useState([]);
  const lanesList = useRef([]);

  const form = useFormValidator(initialLaneState, laneValidationSchema, {
    validateOnChange: true,
    debounce: 300,
  });

  const loadLanes = async () => {
    if (!lanes || lanes.length === 0) {
      setIsInitialLoading(true);
      try {
        const res = await fetchLanes();
        if (res?.status === 200) {
          dispatch(handleFetchData(res.data));
          // lanesList.current = res.data;
          setFilteredData(res.data);
        } else {
          console.warn("Couldn't fetch data", res);
        }
      } catch (error) {
        console.error("Failed to fetch lanes:", error);
        toast.error("Failed to fetch lanes");
      } finally {
        setIsInitialLoading(false);
      }
    } else {
      lanesList.current = lanes;
      setFilteredData(lanes);
    }
  };
  useEffect(() => {
    loadLanes();
  }, [dispatch, lanes]);

  useEffect(() => {
    setFilteredData(lanes || []);
    lanesList.current = lanes || [];
  }, [lanes]);

  useEffect(() => {
    if (id && lanes?.length > 0) {
      const laneToEdit = lanes.find((l) => l.id === id || l._id === id);
      if (laneToEdit) {
        form.setFields({
          name: laneToEdit.name || "",
          description: laneToEdit.description || "",
        });
      }
    } else if (!id) {
      if (typeof form.resetForm === "function") form.resetForm();
      else form.setFields(initialLaneState);
    }
  }, [id, lanes]);

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const result = form.validateForm();
    if (!result.success) return;

    setIsLoading(true);
    try {
      // CREATE
      if (!id) {
        const response = await create(result.data);
        if (response.status === 201) {
          dispatch(handlePostData(response.data));
          toast.success("Lane added successfully");
          if (typeof form.resetForm === "function") form.resetForm();
          else form.setFields(initialLaneState);
        } else {
          toast.error(response?.data?.error || "Failed to add lane");
        }
      } else {
        // UPDATE
        const response = await modify({ formData: result.data, id });
        if (response.status === 200) {
          dispatch(handleModifyData(response.data));
          toast.success("Lane updated successfully");
          if (typeof form.resetForm === "function") form.resetForm();
          else form.setFields(initialLaneState);
          navigate("/lane");
        } else {
          toast.error(response?.data?.error || "Failed to update lane");
        }
      }
    } catch (error) {
      console.error("Error while processing lane:", error);
      toast.error("Error while processing lane.");
    } finally {
      setIsLoading(false);
    }
  };

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
        toast.success("Lane deleted successfully");
        setShowModal(false);
        setSelectedLane(null);
      } else {
        toast.error(response?.data?.error || "Failed to delete lane");
      }
    } catch (error) {
      console.error("Error deleting lane:", error);
      toast.error("Error deleting lane");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExit = () => {
    if (typeof form.resetForm === "function") form.resetForm();
    else form.setFields(initialLaneState);
    try {
      if (id) navigate("/lane");
    } catch (err) {
      // ignore
    }
  };

  return {
    id,
    form,
    isLoading,
    handleSubmit,
    handleExit,
    isInitialLoading,
    isDeleting,
    filteredData,
    showModal,
    selectedLane,
    handleDeleteClick,
    handleDelete,
    setShowModal,
    lanesList,
    setSelectedLane,
  };
};

export default useLanesManager;
export { useLanesManager as useManageLane };
export { useLanesManager as useManageLanes };
