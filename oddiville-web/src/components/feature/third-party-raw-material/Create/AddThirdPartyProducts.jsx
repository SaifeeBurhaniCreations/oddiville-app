import useManageRawMaterial from "@/hooks/useManageRawMaterial";
import ClientDetailsForm from "@/components/forms/ClientDetailsForm";
import AddProductForm from "@/components/forms/AddProductForm";
import ProductListTable from "@/components/tables/ProductListTable";
import { useEffect } from "react";

const AddRawMaterial = () => {
  const {
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
    bannersProps,
    id,
  } = useManageRawMaterial();

 const { productList, chambers: filteredChambers } = productdata;
  const productIndex = Number(new URLSearchParams(location.search).get("product"));

useEffect(() => {
  if (!isNaN(productIndex)) {
    handleEditProduct(productIndex);
  }
}, [productIndex, productList]);

const chamberMap = new Map(
  (filteredChambers || []).map(ch => [ch.id, ch.chamber_name])
);

const productListWithChamberNames = productList.map(product => ({
  ...product,
  selectedChambers: (product.selectedChambers || []).map(ch => ({
    ...ch,
    name: chamberMap.get(ch.id) || ch.name || "",
  })),
}));

return (
    <div className="container py-4 overflow-y-auto" style={{ maxHeight: "93vh" }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-12 col-lg-12">
          <div className="row">
            <div className="col-12 col-lg-4 mb-4">
              <ClientDetailsForm
                clientForm={clientForm}
                productList={productList}
                isLoading={isLoading}
                handleSubmit={handleSubmit}
              />
            </div>

            <div className=" col-12 mb-4 col-lg-8">
              <AddProductForm
                productForm={productForm}
                selectedChambers={filteredChambers}
                toggleChamber={toggleChamber}
                updateQuantity={updateQuantity}
                addProductToList={addProductToList}
                bannersProps={bannersProps}
                id={id}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
            <ProductListTable
              productList={productListWithChamberNames}
              handleEditProduct={handleEditProduct}
              handleDeleteProduct={handleDeleteProduct}
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRawMaterial;