import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator.js";
import { create, modify, fetchLanes } from "@/services/LaneService";
import {
  handleModifyData,
  handlePostData,
  handleFetchData,
} from "@/redux/LaneDataSlice";
import { initialLaneState } from "@/schemas/LaneSchema";

const useManageLane = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const lanes = useSelector((state) => state.lane.data);

  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null);
  const [fetchedBanners, setFetchedBanners] = useState(null);
  const [deleteBanners, setDeleteBanners] = useState(false);

  const laneValidationSchema = useMemo(() => {
    return {
      name: [
        { type: "required", message: "Lane name is required" },
        {
          type: "minLength",
          length: 3,
          message: "Minimum 3 characters needed",
        },
      ],
      description: [
        { type: "required", message: "Lane description is required" },
        {
          type: "minLength",
          length: 5,
          message: "Description must be at least 5 characters",
        },
      ],
      sample_image: [
        {
          type: "custom",
          message: "Image is required",
          validate: (value) => {
            if (id) return true;

            const hasUpload =
              value &&
              (value instanceof File ||
                (value instanceof FileList && value.length > 0) ||
                (Array.isArray(value) && value.length > 0));

            if (!id) return !!hasUpload;

            if (deleteBanners) return !!hasUpload;

            const existingImage =
              fetchedBanners?.sample_image ||
              fetchedBanners?.imageUrl ||
              lanes?.sample_image;

            if (existingImage) {
              if (hasUpload) return true;
              return true;
            }
            return !!hasUpload;
          },
        },
      ],
    };
  }, [id, fetchedBanners, deleteBanners, lanes]);

  const form = useFormValidator(initialLaneState, laneValidationSchema, {
    validateOnChange: true,
    debounce: 300,
  });

  // Fetch all lanes
  // useEffect(() => {
  //     const fetchAll = async () => {
  //         setIsLoading(true);
  //         try {
  //             const getLane = await fetchLanes();
  //             dispatch(handleFetchData(getLane.data));
  //         } catch (error) {
  //             toast.error("Failed to fetch data");
  //             console.error(error);
  //         } finally {
  //             setIsLoading(false);
  //         }
  //     };

  //     if (!lanes || lanes.length === 0) {
  //         fetchAll();
  //     }
  // }, [dispatch, lanes]);

  // Prefill form when editing
  
  useEffect(() => {
    if (id && lanes?.length > 0) {
      const data = lanes.find((lane) => lane.id === id || lane._id === id);
      if (data) {
        form.setFields({
          name: data.name || "",
          description: data.description || "",
        });
      }
    } else if (!id) {
      form.resetForm();
    }
  }, [id, lanes]);

  const fetchBanners = (file) => {
    setBanners(file);

    form.setField("sample_image", file);
  };

  const handleExit = () => {
    setFetchedBanners(null);
    setBanners(null);
    setDeleteBanners(false);
    form.setFields(initialLaneState);
    navigate("/lane");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = form.validateForm();
    const isCreating = !id;
    const hasNewBanner = banners;
    const hasExistingBanner = fetchedBanners && !deleteBanners;

       if (isCreating && !hasNewBanner) {
      toast.error("Image is required for a new location.");
      return;
    }

    if (!result.success) return;

 const formPayload = new FormData();
    formPayload.append("name", result.data.name);
    formPayload.append("description", result.data.description);

    if (result.data.sample_image) {
      formPayload.append("sample_image", result.data.sample_image);
    }
    if (id && deleteBanners && !banners) {
      formPayload.append("deleteBanner", "true");
    }

    setIsLoading(true);
    try {
        let response;
      if (isCreating) {
        // Create
        response = await create(formPayload);
        if (response.status === 201) {
          dispatch(handlePostData(response.data));
          toast.success("Lane Added");
          form.resetForm();
          navigate("/lane");
        } else {
          toast.error(response.data.error || "Failed to add lane.");
        }
      } else {
        // Update
        const updatedLane = { ...result.data, id };
        dispatch(handleModifyData(updatedLane));
        const response = await modify({ formData: result.data, id });
        if (response.status === 200) {
          //  const all = await fetchLocations();
          //           // normalize as needed...
          //           dispatch(handleFetchData(all.data));
          if (response.data && response.data.id) {
            dispatch(handleModifyData(response.data));
          }
          toast.success("Lane Updated");
        } else {
          toast.error(response.data.error || "Failed to update lane.");
          dispatch(handleFetchData(lanes));
        }
      }
    } catch (error) {
      toast.error("Error while processing lane.");
      console.error(error);
    } finally {
      setIsLoading(false);
      form.resetForm();
      navigate(`/lane`);
    }
  };

  return {
    id,
    form,
    isLoading,
    banners,
    fetchedBanners,
    deleteBanners,
    setDeleteBanners,
    fetchBanners,
    handleSubmit,
    handleExit,
  };
};

export default useManageLane;