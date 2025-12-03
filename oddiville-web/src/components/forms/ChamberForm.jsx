
import Spinner from "@/components/Spinner/Spinner";

const ChamberForm = ({ addChamberForm, handleSubmit, isLoading }) => {
    const { values, errors, setField, isValid } = addChamberForm;

    return (
        <form
            onSubmit={handleSubmit}
            className="d-flex flex-column gap-3 mb-4"
        >
            
            <div className="form-floating">
                <input
                    type="text"
                    name="chamber_name"
                    value={values.chamber_name}
                    onChange={(e) => setField("chamber_name", e.target.value)}
                    className={`form-control ${errors.chamber_name ? "is-invalid" : ""}`}
                    placeholder="Enter Chamber Name"
                />
                <label>Enter Chamber Name</label>
                {errors.chamber_name && (
                    <div className="text-danger mt-1">
                        {errors.chamber_name}
                    </div>
                )}
            </div>

            <div className="d-flex align-items-start w-100 position-relative">
    <div className="form-floating flex-grow-1">
        <input
            type="text"
            name="capacity"
            value={values.capacity}
            onChange={(e) => setField("capacity", e.target.value)}
            className={`form-control pe-5 ${errors.capacity ? "is-invalid" : ""}`}
            placeholder="Enter Chamber Capacity"
        />
        <label>Enter Chamber Capacity</label>
    </div>

    {/* KG BOX */}
    <div className="kg-box">
        Kg
    </div>

    {errors.capacity && (
        <div className="text-danger mt-1">{errors.capacity}</div>
    )}
</div>
            
            <div>
                <select
                    name="tag"
                    value={values.tag}
                    onChange={(e) => setField("tag", e.target.value)}
                    className={`form-select ${errors.tag ? "is-invalid" : ""}`}
                >
                    <option value="">Select Chamber Type</option>
                    <option value="frozen">Frozen</option>
                    <option value="dry">Dry</option>
                </select>
                {errors.tag && (
                    <div className="text-danger mt-1">
                        {errors.tag}
                    </div>
                )}
            </div>

           
            <button
                type="submit"
                className="btn btn-primary"
                disabled={!isValid || isLoading}
            >
                {isLoading ? <Spinner /> : "Add Chamber"}
            </button>
        </form>
    );
};

export default ChamberForm;