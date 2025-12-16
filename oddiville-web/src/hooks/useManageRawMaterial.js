import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useOtherProductById, useOtherItems } from "@/hooks/thirdPartyProduct";

import { useFormValidator } from "@/lib/custom_library/formValidator/useFormValidator";
import { create, modify } from "@/services/ThirdPartyProductService";
import { fetchChamber } from "@/services/DryChamberService";
import { handleModifyData, handlePostData } from "@/redux/WorkLocationSlice";
import {
  initialClientValues,
  initialNewProductState,
  clientValidationRules,
  productValidationRules,
} from "@/schemas/RawMaterialSchema";

const FALLBACK_IMAGE = "/assets/img/png/fallback_img.png";

const useManageRawMaterial = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const chambers = useSelector((state) => state.ServiceDataSlice.chamber);
  const { otherProduct: ThirdPartyProduct } = useOtherProductById(id);
  const { data: otherItems = [] } = useOtherItems();

  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null);
  const [productList, setProductList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [fetchedBanners, setFetchedBanners] = useState(null);
  const [deleteBanners, setDeleteBanners] = useState(null);

  /* ================= CLIENT FORM ================= */
  const clientForm = useFormValidator(
    initialClientValues,
    clientValidationRules,
    { validateOnChange: true, debounce: 300 }
  );

  const {
    setField: setClientField,
    setFields: setClientFields,
    validateForm: validateClientForm,
  } = clientForm;

  /* ================= PRODUCT FORM ================= */
  const productForm = useFormValidator(
    initialNewProductState,
    productValidationRules,
    { validateOnChange: true, debounce: 300 }
  );

  const {
    values: newProduct,
    setFields: setProductFields,
    validateForm: validateProductForm,
    setField: setProductField,
    resetForm: resetProductForm,
  } = productForm;

  useEffect(() => {
    if (productList.length === 1 && editIndex === null) {
      handleEditProduct(0);
    }
  }, [productList]);

  /* ================= CHAMBER LOGIC ================= */
  const toggleChamber = (chamberId) => {
    const prev = Array.isArray(newProduct.selectedChambers)
      ? newProduct.selectedChambers
      : [];

    const exists = prev.some((c) => c.id === chamberId);
    const chamberDetail = chambers.find((c) => c.id === chamberId);

    if (exists) {
      setProductFields({
        selectedChambers: prev.filter((c) => c.id !== chamberId),
      });
    } else {
      setProductFields({
        selectedChambers: [
          ...prev,
          {
            id: chamberId,
            quantity: "",
            name: chamberDetail?.chamber_name || "",
          },
        ],
      });
    }
  };

  const updateQuantity = (chamberId, qty) => {
    const prev = Array.isArray(newProduct.selectedChambers)
      ? newProduct.selectedChambers
      : [];

    setProductFields({
      selectedChambers: prev.map((c) =>
        c.id === chamberId ? { ...c, quantity: qty } : c
      ),
    });
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductField(name, value);
  };

  /* ================= ADD / EDIT PRODUCT ================= */
  const addProductToList = useCallback(() => {
    const productValidationResult = validateProductForm();

    if (
      !Array.isArray(newProduct.selectedChambers) ||
      newProduct.selectedChambers.length === 0
    ) {
      toast.error("Please select at least one Chamber.");
      return;
    }

    if (!productValidationResult.success) {
      toast.error("Please fill in all product details correctly.");
      return;
    }

    const updatedList =
      editIndex !== null
        ? productList.map((item, idx) =>
            idx === editIndex ? { ...newProduct, sample_image: banners } : item
          )
        : [...productList, { ...newProduct, sample_image: banners }];

    setProductList(updatedList);
    setClientField("products", updatedList);

    resetProductForm();
    setBanners(null);
    setEditIndex(null);
    setFetchedBanners(null);
    setDeleteBanners(null);
  }, [
    newProduct,
    editIndex,
    productList,
    banners,
    setClientField,
    resetProductForm,
    validateProductForm,
  ]);

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleEditProduct = useCallback(
    (index) => {
      const item = productList[index];
      if (!item) return;

      setProductFields({
        product_name: item.product_name || "",
        rent: item.rent || "",
        est_dispatch_date: formatDateForInput(item.est_dispatch_date),
        selectedChambers: (item.selectedChambers || []).map((ch) => ({
          id: ch.id,
          quantity: ch.quantity ?? "",
        })),
        sample_image: item.sample_image || null,
      });

      const imageToUse =
        item.sample_image && typeof item.sample_image === "string"
          ? item.sample_image
          : FALLBACK_IMAGE;

      setBanners(imageToUse);
      setFetchedBanners(imageToUse);

      setEditIndex(index);
    },
    [productList]
  );

  const handleDeleteProduct = useCallback(
    (index) => {
      const updated = [...productList];
      updated.splice(index, 1);
      setProductList(updated);
      setClientField("products", updated);
    },
    [productList, setClientField]
  );

  const fetchBanners = (img) => setBanners(img);

  const onFileChange = (file) => {
    setBanners(file);
    setProductField("sample_image", file);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationResult = validateClientForm();
    if (!validationResult.success) {
      toast.error("Please correct the client details errors.");
      return;
    }

    if (productList.length === 0) {
      toast.error("Please add at least one product before saving.");
      return;
    }

    const submitValues = validationResult.data;
    const formPayload = new FormData();

    formPayload.append("name", submitValues.name);
    formPayload.append("company", submitValues.company);
    formPayload.append("address", submitValues.address);
    formPayload.append("phone", submitValues.phone);
    formPayload.append("products", JSON.stringify(productList));

    if (banners) {
      formPayload.append("sample_image", banners);
    }

    setIsLoading(true);

    try {
      const response = id
        ? await modify({ formData: formPayload, id })
        : await create(formPayload);

      if (response.status === 200 || response.status === 201) {
        dispatch(
          id ? handleModifyData(response.data) : handlePostData(response.data)
        );
        toast.success(id ? "Updated successfully!" : "Added successfully!");
        navigate("/raw-material-other");
      } else {
        toast.error(response.data.error || "Failed to save client.");
      }
    } catch (error) {
      toast.error("Error while saving client.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= FETCH CHAMBERS ================= */
  useEffect(() => {
    if (!chambers?.length) {
      fetchChamber().then((res) => {
        dispatch({
          type: "ServiceDataSlice/handleFetchCategory",
          payload: res.data,
        });
      });
    }
  }, [chambers]);

  /* ================= ✅ FIXED MERGE LOGIC (IMPORTANT) ================= */
  useEffect(() => {
    if (!ThirdPartyProduct || !otherItems.length || !Array.isArray(chambers))
      return;

    setClientFields({
      name: ThirdPartyProduct.name || "",
      company: ThirdPartyProduct.company || "",
      address: ThirdPartyProduct.address || "",
      phone: ThirdPartyProduct.phone || "",
    });

    const mergedProducts = (ThirdPartyProduct.products || []).map(
      (stockObj) => {
        const otherItem = otherItems.find(
          (item) =>
            String(item.client_id) === String(ThirdPartyProduct.id) &&
            String(item.product_id) === String(stockObj.id)
        );

        return {
          product_name: stockObj.product_name || "",
          rent: otherItem?.rent ?? "",
          est_dispatch_date: otherItem?.est_dispatch_date ?? "",
          selectedChambers: (stockObj.chamber || []).map((ch) => ({
            id: ch.id,
            quantity: ch.quantity ?? "",
          })),
          sample_image:
            otherItem?.sample_image &&
            typeof otherItem.sample_image === "string"
              ? otherItem.sample_image
              : FALLBACK_IMAGE,
        };
      }
    );

    setProductList(mergedProducts);
    setClientField("products", mergedProducts);
  }, [ThirdPartyProduct, otherItems, chambers]);

  const productdata = {
    chambers: chambers?.filter((c) => c.tag === "frozen"),
    productList,
  };

  return {
    id,
    isLoading,
    clientForm,
    productForm,
    productdata,
    handleProductInputChange,
    toggleChamber,
    updateQuantity,
    addProductToList,
    handleEditProduct,
    handleDeleteProduct,
    handleSubmit,
    bannersProps: {
      getBanners: fetchedBanners,
      deleteBanners,
      setDeleteBanners,
      fetchBanners,
      onFileChange,
      editMode: editIndex !== null,
    },
  };
};

export default useManageRawMaterial;