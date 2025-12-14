import useManageRawMaterial from "@/hooks/useManageRawMaterial";
import ClientDetailsForm from "@/components/forms/ClientDetailsForm";
import AddProductForm from "@/components/forms/AddProductForm";
import ProductListTable from "@/components/tables/ProductListTable";

const AddRawMaterial = () => {
  const {
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
    bannersProps,
    id,
  } = useManageRawMaterial();

  console.log("productList", productList);

  return (
    <div className="container py-4 ">
      <div className="row justify-content-center">
        <div className="col-12 col-md-11 col-lg-10">
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
                filteredChambers={filteredChambers}
                toggleChamber={toggleChamber}
                updateQuantity={updateQuantity}
                addProductToList={addProductToList}
                bannersProps={bannersProps}
                id={id}
              />
            </div>
          </div>

          <div className="row ">
            <div className="col-12 ">
              {/* <ProductListTable
                productList={productList}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRawMaterial;
