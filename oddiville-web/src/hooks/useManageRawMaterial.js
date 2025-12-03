import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useOtherProductById } from "@/hooks/thirdPartyProduct";

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

const useManageRawMaterial = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const chambers = useSelector((state) => state.ServiceDataSlice.chamber);
  const workLocation = useSelector((state) => state.location.data);
const { otherProduct: ThirdPartyProduct } = useOtherProductById(id);
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null);
  const [productList, setProductList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [fetchedBanners, setFetchedBanners] = useState(null);
  const [deleteBanners, setDeleteBanners] = useState(null);

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

  const toggleChamber = (chamberId) => {
    const prevSelected = Array.isArray(newProduct?.selectedChambers)
      ? newProduct.selectedChambers
      : [];

    const exists = prevSelected.some((c) => c.id === chamberId);
    const chamberDetail = chambers.find((c) => c.id === chamberId);

    if (exists) {
      const updated = prevSelected.filter((c) => c.id !== chamberId);
      setProductFields({ selectedChambers: updated });
    } else {
      const updated = [
        ...prevSelected,
        {
          id: chamberId,
          quantity: "",
          name: chamberDetail?.chamber_name || "",
        },
      ];
      setProductFields({ selectedChambers: updated });
    }
  };

  const updateQuantity = (chamberId, qty) => {
    const prevSelected = Array.isArray(newProduct?.selectedChambers)
      ? newProduct.selectedChambers
      : [];
    const updated = prevSelected.map((ch) =>
      ch.id === chamberId ? { ...ch, quantity: qty } : ch
    );
    setProductFields({ selectedChambers: updated });
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductField(name, value);
  };

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

  const handleEditProduct = useCallback(
    (index) => {
      const item = productList[index];
      if (!item) return;

      setProductFields({
        product_name: item.product_name || "",
        rent: item.rent || "",
        est_dispatch_date: item.est_dispatch_date || "",
        selectedChambers: item.selectedChambers || [],
        sample_image: item.sample_image || null,
      });

      setBanners(item.sample_image || null);
      setFetchedBanners(item.sample_image || null);
      setProductField("sample_image", item.sample_image || null);
      setEditIndex(index);
    },
    [productList, setProductFields, setBanners, setFetchedBanners]
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const chamberRes = await fetchChamber();
        if (chamberRes.status === 200) {
          dispatch({
            type: "ServiceDataSlice/handleFetchCategory",
            payload: chamberRes.data,
          });
        }
      } catch (error) {
        toast.error("Failed to fetch chamber data");
        console.error(error);
      }
    };

    if (chambers?.length === 0) {
      fetchAll();
    }
  }, [dispatch, chambers?.length]);
useEffect(() => {
  if (!id || !ThirdPartyProduct || !Array.isArray(chambers)) return;

  setClientFields({
    name: ThirdPartyProduct.name || "",
    company: ThirdPartyProduct.company || "",
    address: ThirdPartyProduct.address || "",
    phone: ThirdPartyProduct.phone || "",
  });

  const productsFromBackend = (ThirdPartyProduct.products || []).map((stockObj) => {
    const product_name = stockObj.product_name || "";
    const rent = stockObj.rent || "";
    const est_dispatch_date = stockObj.est_dispatch_date || "";
    const selectedChambers = (stockObj.chamber || []).map((ch) => {
      const master = chambers.find((m) => String(m.id) === String(ch.id));
      return {
        id: ch.id,
        quantity: ch.quantity ?? "", 
      };
    });

    return {
      product_name,
      rent,
      est_dispatch_date,
      selectedChambers,
      sample_image: stockObj.sample_image || null,
    };
  });
console.log("productsFromBackend", productsFromBackend);

  setProductList(productsFromBackend);
  setClientField("products", productsFromBackend);

  if (ThirdPartyProduct.sample_image) {
    setBanners(ThirdPartyProduct.sample_image);
    setProductField("sample_image", ThirdPartyProduct.sample_image);
  }
}, [id, ThirdPartyProduct, chambers]);

  const filteredChambers = chambers?.filter((c) => c.tag === "frozen");

  return {
    id,
    isLoading,
    clientForm,
    productForm,
    productList,
    filteredChambers,
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
