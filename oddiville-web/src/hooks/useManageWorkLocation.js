import { useEffect, useMemo, useState } from "react";
import { create, modify } from "@/services/WorkLocationService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { handleModifyData, handlePostData } from "@/redux/WorkLocationSlice";
import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator";
import { initialLocationState } from "@/schemas/WorkLocationSchema";
import { handleFetchData } from "../redux/WorkLocationSlice";
import { fetchLocations } from "@/services/WorkLocationService";

const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === "string") return { url: img };
  if (typeof img === "object" && (img.url || img.imageUrl)) {
    return { url: img.url || img.imageUrl };
  }
  return null;
};

const stripNonSerializable = (obj) => {
  const out = {};
  for (const key in obj) {
    const v = obj[key];
    if (
      v instanceof File ||
      v instanceof FileList ||
      typeof v === "function" ||
      typeof v === "symbol" ||
      typeof v === "undefined"
    ) {
      continue;
    }
    out[key] = v;
  }
  return out;
};

const useManageWorkLocation = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const param = useParams();
  const { id } = param;

  const workLocationData = useSelector((state) => state.location.data);

  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null); 
  const [fetchedBanners, setFetchedBanners] = useState(null); 
  const [deleteBanners, setDeleteBanners] = useState(false);

  const locationValidationSchema = useMemo(() => {
    return {
      location_name: [
        { type: "required", message: "Location Name is required" },
      ],
      description: [
        { type: "required", message: "Description is required" },
        { type: "minLength", length: 5, message: "Minimum 5 characters" },
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
              fetchedBanners?.url || fetchedBanners?.sample_image || workLocationData?.sample_image;

            if (existingImage) {
              if (hasUpload) return true;
              return true;
            }
            return !!hasUpload;
          },
        },
      ],
    };
  }, [id, fetchedBanners, deleteBanners, workLocationData]);

  const form = useFormValidator(
    initialLocationState,
    locationValidationSchema,
    { validateOnChange: true, debounce: 300 }
  );

  const fetchBanners = (file) => {
    setBanners(file); 
    form.setField("sample_image", file); 
  };

  const handleExit = () => {
    setFetchedBanners(null);
    setBanners(null);
    setDeleteBanners(false);
    form.setFields(initialLocationState);
    navigate("/work-location");
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
    formPayload.append("location_name", result.data.location_name);
    formPayload.append("description", result.data.description);

    if (banners) {
      formPayload.append("sample_image", banners);
    } else if (id && deleteBanners && !banners) {
      formPayload.append("deleteBanner", "true");
    }

    setIsLoading(true);
    try {
      let response;
      if (isCreating) {
        response = await create(formPayload);

        if (response.status === 201) {
          const created = response.data;
          const normalized = {
            ...created,
            sample_image: normalizeImage(created.sample_image),
          };
          dispatch(handlePostData(stripNonSerializable(normalized)));
          toast.success("Location is Added!");
          form.resetForm();
          navigate("/work-location");
        } else {
          const serverMsg = response?.data?.message ?? response?.data?.error;
          throw new Error(
            serverMsg || `Failed to create location. Status ${response.status}`
          );
        }
      } else {
        response = await modify({ formData: formPayload, id });

        if (response.status === 200) {
            const updated = response.data;
            const normalizedImage = normalizeImage(updated.sample_image);
            setFetchedBanners(normalizedImage);

            const serializable = stripNonSerializable({
              ...updated,
              sample_image: normalizedImage,
            });

            const idKey = updated._id ? "_id" : "id";
            const idValue = updated[idKey];

            const allRes = await fetchLocations(); 
            const allItems = allRes.data || [];

            const newList = allItems.map((item) =>
              item[idKey] === idValue ? serializable : item
            );
              
            dispatch(handleFetchData(newList));

            toast.success("Location is Updated!");
            navigate("/work-location");
          } else {
          const serverMsg = response?.data?.message ?? response?.data?.error;
          throw new Error(
            serverMsg || `Failed to update location. Status ${response.status}`
          );
        }
      }
    } catch (error) {
      if (error?.response) {
        const status = error.response.status;
        const serverMsg =
          error.response.data?.message ??
          error.response.data?.error ??
          error.response.data ??
          null;

        if (status === 409) {
          toast.error(serverMsg || "Work location already exists");
        } else {
          toast.error(serverMsg || `Server failed with status ${status}`);
        }
      } else {
        toast.error(
          error?.message || "An error occurred while processing the location."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const data = workLocationData?.find((value) => value.id === id);
      if (data) {
        form.setFields({
          location_name: data.location_name,
          description: data.description,
        });

        const normalized = normalizeImage(data.sample_image);
        setFetchedBanners(normalized);
      }
    } else {
      setFetchedBanners(null);
      setBanners(null);
      setDeleteBanners(false);
      form.setFields(initialLocationState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, workLocationData]);

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

export default useManageWorkLocation;