import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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

const uid = () => crypto.randomUUID();

const useManageRawMaterial = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const chambers = useSelector((state) => state.ServiceDataSlice.chamber);
  const { otherProduct: ThirdPartyProduct } = useOtherProductById(id);
  const { data: otherItems = [] } = useOtherItems();

  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [productList, setProductList] = useState([]);
  const [editingRowId, setEditingRowId] = useState(null);

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

  // useEffect(() => {
  //   if (productList.length === 1 && editIndex === null) {
  //     handleEditProduct(0);
  //   }
  // }, [productList]);

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

  const addProductToList = useCallback(() => {
    const productValidationResult = validateProductForm();
    if (!productValidationResult.success) return;

    const existing = productList.find(p => p._rowId === editingRowId);

    const payload = {
      _rowId: editingRowId ?? uid(),
      _serverId: existing?._serverId ?? null,
      _isNew: !existing,
      _isDeleted: false,
      ...newProduct,
      sample_image: banners,
      sample_image_file: bannerFile,
    };

    let updated;

    if (editingRowId) {
      updated = productList.map((p) =>
        p._rowId === editingRowId ? payload : p
      );
    } else {
      updated = [...productList, payload];
    }

    setProductList(updated);
    setClientField("products", updated);
    resetToAddMode();
  }, [editingRowId, newProduct, productList, banners, bannerFile]);


  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleEditProduct = useCallback((rowId) => {
    const item = productList.find(p => p._rowId === rowId);
    if (!item) return;

    setProductFields({
      product_name: item.product_name,
      rent: item.rent,
      est_dispatch_date: formatDateForInput(item.est_dispatch_date),
      selectedChambers: item.selectedChambers || [],
    });

    setFetchedBanners(item.sample_image || null);
    setBanners(null);
    setBannerFile(null);


    setEditingRowId(rowId);
  }, [productList]);

  const handleDeleteProduct = useCallback((rowId) => {
    setProductList(prev =>
      prev.map(p =>
        p._rowId === rowId
          ? { ...p, _isDeleted: true }
          : p
      )
    );

    setEditingRowId(prev => (prev === rowId ? null : prev));
  }, []);

  const fetchBanners = (img) => setBanners(img);

  const onFileChange = (file) => {
    if (!(file instanceof File)) return;

    const previewUrl = URL.createObjectURL(file);

    setBanners(previewUrl);
    setBannerFile(file);
    setProductField("sample_image", previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationResult = validateClientForm();
    if (!validationResult.success) {
      toast.error("Please correct the client details errors.");
      return;
    }

    if (!productList.some(p => !p._isDeleted)) {
      toast.error("Please add at least one product before saving.");
      return;
    }

    setIsLoading(true);

    try {
      /* =====================
         1️⃣ UPDATE DATA ONLY
         ===================== */
      const submitValues = validationResult.data;
      const dataPayload = new FormData();

      dataPayload.append("name", submitValues.name);
      dataPayload.append("company", submitValues.company);
      dataPayload.append("address", submitValues.address);
      dataPayload.append("phone", submitValues.phone);

      const finalProducts = productList
        .filter(p => !p._isDeleted)
        .map(({ _rowId, _isNew, _isDeleted, _serverId, sample_image_file, ...rest }) => ({
          ...rest,
          id: _serverId ?? undefined,
          ...(sample_image_file ? { sample_image: undefined } : {}),
        }));

      const deletedIds = productList
        .filter(p => p._isDeleted && p._serverId)
        .map(p => p._serverId);

      dataPayload.append("deleted_products", JSON.stringify(deletedIds));

      // dataPayload.append("products", JSON.stringify(finalProducts));

      let visibleIndex = 0;

      productList.forEach((product) => {
        if (product._isDeleted) return;

        const index = visibleIndex;

        dataPayload.append(`products[${index}][id]`, product._serverId ?? "");
        dataPayload.append(`products[${index}][product_name]`, product.product_name);
        dataPayload.append(`products[${index}][rent]`, product.rent);
        dataPayload.append(`products[${index}][est_dispatch_date]`, product.est_dispatch_date || "");

        dataPayload.append(
          `products[${index}][selectedChambers]`,
          JSON.stringify(product.selectedChambers || [])
        );

        if (product.sample_image_file instanceof File) {
          dataPayload.append(`products[${index}][sample_image]`, product.sample_image_file);
        }

        visibleIndex++;
      });

      const currentId = idRef.current;

      const isEditPage = Boolean(currentId && currentId !== "undefined");

      if (isEditPage) {
        await modify({ formData: dataPayload, id: currentId });
        toast.success("Updated successfully!");
      } else {
        await create(dataPayload);
        toast.success("Created successfully!");

      }

      navigate("/raw-material-other");
    } catch (error) {
      toast.error("Error while saving client.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToAddMode = () => {
    resetProductForm();
    setEditingRowId(null);
    setBanners(null);
    setBannerFile(null);
    setFetchedBanners(null);
    setDeleteBanners(null);
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
  }, [chambers?.length]);



  const idRef = useRef(null);

  useEffect(() => {
    idRef.current = id;
  }, [id]);

  /* ================= ✅ FIXED MERGE LOGIC (IMPORTANT) ================= */
  useEffect(() => {
    if (!ThirdPartyProduct || !otherItems.length || !Array.isArray(chambers) || productList.length)
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
          _rowId: uid(),
          _serverId: stockObj.id,
          _isNew: false,
          _isDeleted: false,

          product_name: stockObj.product_name || "",
          rent: otherItem?.rent ?? "",
          est_dispatch_date: otherItem?.est_dispatch_date ?? "",
          selectedChambers: (stockObj.chamber || []).map((ch) => ({
            id: ch.id,
            quantity: ch.quantity ?? "",
          })),
          sample_image:
            otherItem?.sample_image || FALLBACK_IMAGE,
        };
      }
    );

    setProductList(mergedProducts);
    setClientField("products", mergedProducts);

  }, [ThirdPartyProduct, otherItems, chambers]);

  const visibleProducts = useMemo(
    () => productList.filter(p => !p._isDeleted),
    [productList]
  );

  useEffect(() => {
    if (!productList.length) return;
    if (editingRowId) return;

    handleEditProduct(productList[0]._rowId);
  }, [productList]);

  const productdata = {
    chambers: chambers?.filter((c) => c.tag === "frozen"),
    productList: visibleProducts,
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
      editMode: editingRowId !== null,
      resetToAddMode,
    },
  };
};

export default useManageRawMaterial;
