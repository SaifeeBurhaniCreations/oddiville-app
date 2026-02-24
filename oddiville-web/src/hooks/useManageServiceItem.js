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
    if (id) {
      const data = serviceData?.find((s) => s.id === id);
      if (data) {
        form.setFields({
  item_name: data.item_name,
  chamber_id: data.chamber_id,
  warehoused_date: data.warehoused_date?.split("T")[0], // important
  description: data.description,
  quantity: data.quantity,
  unit: data.unit,
  unit_weight_grams: data.unit_weight_grams,
  sample_image: data.sample_image,
});
        setFetchedBanners(data.sample_image);
      }
    }
  }, [id, serviceData]);

  useEffect(() => {
  const countUnits = ["pcs","box","set","roll","bundle","pack"];
  if (!countUnits.includes(form.values.unit)) {
    form.setField("unit_weight_grams", "");
  }
}, [form.values.unit]);

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    const result = form.validateForm();
    if (!result.success) return;

    const formPayload = new FormData();
    formPayload.append("item_name", result.data.item_name);
    formPayload.append("chamber_id", result.data.chamber_id);
    formPayload.append("description", result.data.description);
    formPayload.append("quantity", result.data.quantity);
    formPayload.append("unit", result.data.unit);
    formPayload.append("unit_weight_grams", result.data.unit_weight_grams);
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