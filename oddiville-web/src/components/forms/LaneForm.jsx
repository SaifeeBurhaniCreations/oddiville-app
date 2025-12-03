import Spinner from "@/components/Spinner/Spinner";
import Banners from "@/components/Banners/Banners";

const LaneForm = ({
  id,
  form,
  isLoading,
  fetchedBanners,
  deleteBanners,
  setDeleteBanners,
  fetchBanners,
  handleSubmit,
  handleExit,
}) => {
  const { values, errors, setField, isValid } = form;

  return (
    <form onSubmit={handleSubmit}>
      <div className="card shadow-sm rounded-3">
        <div className="card-header flex-cs gap-2 justify-content-between pt-4 pb-2 bg-light">
          <h5 className="m-0">Manage Lane</h5>
          {id && (
            <button
              type="button"
              onClick={handleExit}
              className="btn btn-secondary btn-md m-0"
            >
              Clear
            </button>
          )}
        </div>

        <div className="card-body grid-cs gtc-1 pb-4">
          <Banners
            name="Upload Lane"
            form={form}
            getBanners={fetchedBanners}
            deleteBanners={deleteBanners}
            setDeleteBanners={setDeleteBanners}
            fetchBanners={fetchBanners}
          />
          <div className="grid-cs gtc-1 gap-3">
            <div className="form-floating mb-3">
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                placeholder="Enter Lane Name"
              />
              <label className="form-label fw-semibold">Lane Name</label>
              {errors.name && (
                <div className="invalid-feedback">{errors.name}</div>
              )}
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                name="description"
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
                className={`form-control ${
                  errors.description ? "is-invalid" : ""
                }`}
                placeholder="Enter Lane Description"
              />
              <label className="form-label fw-semibold">Lane Description</label>
              {errors.description && (
                <div className="invalid-feedback">{errors.description}</div>
              )}
            </div>
          </div>
        </div>

        <div className="card-footer text-end">
          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="btn btn-primary btn-md m-0"
          >
            {id ? "Update" : "Save"} Lane {isLoading && <Spinner />}
          </button>
        </div>
      </div>
    </form>
  );
};

export default LaneForm;
