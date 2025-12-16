import Banners from "@/components/Banners/Banners";
import { useEffect } from "react";

const AddProductForm = ({
  productForm,
  selectedChambers,
  toggleChamber,
  updateQuantity,
  addProductToList,
  bannersProps,
  id,
}) => {
  const {
    getBanners,
    deleteBanners,
    setDeleteBanners,
    fetchBanners,
    onFileChange,
    editMode,
  } = bannersProps;


  const {
    values: newProduct,
    errors: productErrors,
    setField: setProductField,
  } = productForm;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductField(name, value);
  };

  const svg = `<svg stroke='white' fill='none' stroke-width='3' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M5 13l4 4L19 7'/></svg>`;
  const encoded = encodeURIComponent(svg);

  return (
    <div className="card">
      <div className="card-header">
        <h6>{editMode || id ? "Edit Product" : "Add New Product"}</h6>
      </div>

      <div className="card-body">
        {/* ================= BANNERS ================= */}
        <Banners
          name="Upload Product Image"
          getBanners={getBanners}
          deleteBanners={deleteBanners}
          setDeleteBanners={setDeleteBanners}
          fetchBanners={fetchBanners}
          onFileChange={(e) => onFileChange(e.target.files[0])}
        />

        {productErrors.sample_image && (
          <div className="text-danger mb-3 mt-1" style={{ fontSize: "0.875em" }}>
            {productErrors.sample_image}
          </div>
        )}

        <div className="form-floating mb-3">
          <input
            className={`form-control ${
              productErrors.product_name ? "is-invalid" : ""
            }`}
            name="product_name"
            placeholder="Product Name"
            value={newProduct.product_name}
            onChange={handleInputChange}
          />
          <label>Product Name</label>
          {productErrors.product_name && (
            <div className="invalid-feedback">
              {productErrors.product_name}
            </div>
          )}
        </div>

        <div className="form-floating mb-3">
          <input
            className={`form-control ${
              productErrors.rent ? "is-invalid" : ""
            }`}
            name="rent"
            placeholder="Rent per Kg"
            value={newProduct.rent}
            onChange={handleInputChange}
          />
          <label>Rent per Kg</label>
          {productErrors.rent && (
            <div className="invalid-feedback">{productErrors.rent}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Estimated Dispatch Date</label>
          <input
            type="date"
            className={`form-control ${
              productErrors.est_dispatch_date ? "is-invalid" : ""
            }`}
            name="est_dispatch_date"
            value={newProduct.est_dispatch_date}
            onChange={handleInputChange}
          />
          {productErrors.est_dispatch_date && (
            <div className="invalid-feedback">
              {productErrors.est_dispatch_date}
            </div>
          )}
        </div>

        <label className="form-label mt-3">
          Select Chambers (Frozen Tag)
        </label>

        {!selectedChambers || selectedChambers.length === 0 ? (
          <div className="alert alert-warning">
            No Frozen Chambers available.
          </div>
        ) : (
          selectedChambers.map((chamber) => {
            const selectedChamber = newProduct.selectedChambers.find(
              (c) => c.id === chamber.id
            );

            const isSelected = Boolean(selectedChamber);

            return (
              <div
                key={chamber.id}
                className="d-flex align-items-center mb-2 p-2 border rounded"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleChamber(chamber.id)}
                  className="form-check-input me-3"
                  style={{
                    border: "1px solid #a1a1aa",
                    backgroundColor: isSelected && "#3D874C",
                    backgroundImage:
                      isSelected &&
                      `url("data:image/svg+xml;utf8,${encoded}")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    cursor: "pointer",
                  }}
                />

                <span className="me-3 fw-bold">
                  {chamber.chamber_name}
                </span>

                {isSelected && (
                  <input
                    type="number"
                    className="form-control form-control-sm w-50"
                    placeholder="Quantity (Kg)"
                    value={selectedChamber?.quantity ?? ""}
                    onChange={(e) =>
                      updateQuantity(chamber.id, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })
        )}

        <button
          type="button"
          className={`btn mt-3 ${editMode ? "btn-warning" : "btn-success"}`}
          onClick={addProductToList}
        >
          {editMode ? "Update Product" : "Add Product"}
        </button>
      </div>
    </div>
  );
};

export default AddProductForm;