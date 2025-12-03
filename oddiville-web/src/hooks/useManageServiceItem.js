import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { create, modify, fetchDryWarehouse } from "@/services/DryChamberService";
import { handleModifyData, handlePostData, handleFetchCategory } from "@/redux/ServiceDataSlice";
import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator";
import { initialValues, validationRules } from "@/schemas/ItemForm";

const  useManageServiceItem = ({
  id,
  serviceData,
  dispatch,
  navigate,
  // initialValues,
  // validationRules,
//   setFetchedBanners,
//   setBanners,
//   banners

}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null);
  const [fetchedBanners, setFetchedBanners] = useState(null);
  const [deleteBanners, setDeleteBanners] = useState([]);

  const form = useFormValidator(
    initialValues,
    validationRules,
    { validateOnChange: true, debounce: 300 }
  );

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetchDryWarehouse();
        dispatch(handleFetchCategory(response.data));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      const data = serviceData?.find((s) => s.id === id);
      if (data) {
        form.setFields({
          item_name: data.item_name,
          chamber_id: data.chamber_id,
          warehoused_date: data.warehoused_date,
          description: data.description,
          quantity_unit: data.quantity_unit,
          sample_image: data.sample_image,
        });
        setFetchedBanners(data.sample_image);
      }
    }
  }, [id, serviceData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = form.validateForm();
    if (!result.success) return;

    const formPayload = new FormData();
    formPayload.append("item_name", result.data.item_name);
    formPayload.append("chamber_id", result.data.chamber_id);
    formPayload.append("description", result.data.description);
    formPayload.append("quantity_unit", result.data.quantity_unit);
    formPayload.append("warehoused_date", result.data.warehoused_date);

    if (banners) formPayload.append("sample_image", banners);

    setIsLoading(true);
    try {
      if (!id) {
        const response = await create(formPayload);
        if (response.status === 201) {
          dispatch(handlePostData(response.data));
          toast.success("Item added successfully!");
          navigate("/items-list");
        } else {
          toast.error("Failed to add item");
        }
      } else {
        const response = await modify({ formData: formPayload, id });
        if (response.status === 200) {
          dispatch(handleModifyData(response.data));
          toast.success("Item updated successfully!");
          navigate("/items-list");
        } else {
          toast.error("Failed to update item");
        }
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBanners = (file) => {
    if (file) {
      setBanners(file);
      form.setField("sample_image", file);
    }
  };

  return {
    form,
    isLoading,
    banners,
    fetchedBanners,
    deleteBanners,
    setBanners,
    setFetchedBanners,
    setDeleteBanners,
    handleSubmit,
    fetchBanners,
  };
};

export default useManageServiceItem;