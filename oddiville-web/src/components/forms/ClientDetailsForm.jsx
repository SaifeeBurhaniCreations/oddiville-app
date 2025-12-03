import Spinner from "@/components/Spinner/Spinner";

const ClientDetailsForm = ({
  clientForm,
  productList,
  isLoading,
  handleSubmit,
}) => {
  const { values, errors, setField, isValid } = clientForm;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="card-header d-flex justify-content-between">
        <h6>Client Details</h6>

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className="btn btn-primary btn-sm"
        >
          Save All {isLoading && <Spinner />}
        </button>
      </div>
      <div className="card-body">
        <div className="form-floating mb-3">
          <input
            name="name"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Client Name"
            value={values.name}
            onChange={handleChange}
          />
          <label>Client Name</label>
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="form-floating mb-3">
          <input
            name="company"
            className={`form-control ${errors.company ? "is-invalid" : ""}`}
            placeholder="Company Name"
            value={values.company}
            onChange={handleChange}
          />
          <label>Company Name</label>
          {errors.company && (
            <div className="invalid-feedback">{errors.company}</div>
          )}
        </div>

        <div className="form-floating mb-3">
          <input
            name="address"
            className={`form-control ${errors.address ? "is-invalid" : ""}`}
            placeholder="Address"
            value={values.address}
            onChange={handleChange}
          />
          <label>Address</label>
          {errors.address && (
            <div className="invalid-feedback">{errors.address}</div>
          )}
        </div>

        <div className="form-floating mb-3">
          <input
            name="phone"
            className={`form-control ${errors.phone ? "is-invalid" : ""}`}
            placeholder="Phone"
            value={values.phone}
            onChange={handleChange}
          />
          <label>Phone</label>
          {errors.phone && (
            <div className="invalid-feedback">{errors.phone}</div>
          )}
        </div>

        {productList.length > 0 && (
          <div className="mt-4">
            <h6>Products added ({productList.length}):</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Rent</th>
                  </tr>
                </thead>
                <tbody>
                  {productList.map((prod, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{prod.product_name}</td>
                      <td>₹{prod.rent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default ClientDetailsForm;
