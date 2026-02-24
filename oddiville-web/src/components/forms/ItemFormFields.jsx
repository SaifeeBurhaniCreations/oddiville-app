import useChamberManagement from "@/hooks/useChamberManagement";
import { DRY_ITEM_UNITS } from "../../constants/dry-items-units";
import { COUNTABLE_UNITS } from "../../constants/countable-units";
const ItemFormFields = ({ form }) => {
  const { chambersList } = useChamberManagement();

  return (
    <div className="row g-3">
      <div className="">
        <input
          type="text"
          value={form.values.item_name}
          onChange={(e) => form.setField("item_name", e.target.value)}
          className={`form-control ${
            form.errors.item_name ? "is-invalid" : ""
          }`}
          placeholder="Enter Item Name"
        />
        <label className="form-label">Item Name</label>
        {form.errors.item_name && (
          <div className="text-danger mt-1">{form.errors.item_name}</div>
        )}
      </div>
      
      <div className="form-floating ">
        <input
          type="text"
          value={form.values.description}
          onChange={(e) => form.setField("description", e.target.value)}
          className={`form-control ${
            form.errors.description ? "is-invalid" : ""
          }`}
          placeholder="Enter Description"
        />
        
        <label className="form-label">Service Description</label>
        {form.errors.description && (
          <div className="text-danger mt-1">{form.errors.description}</div>
        )}
      </div>
            <div className="">
        <label className="form-label">Item Quantity</label>
        <input
          type="text"
          value={form.values.quantity}
          onChange={(e) => form.setField("quantity", e.target.value)}
          className={`form-control ${
            form.errors.quantity ? "is-invalid" : ""
          }`}
          placeholder="Enter Quantity"
        />
        {form.errors.quantity && (
          <div className="text-danger mt-1">{form.errors.quantity}</div>
        )}
      </div>
           <div className="">
        <label className="form-label">Select Unit</label>
        <select
          value={form.values.unit || ""}
          onChange={(e) => form.setField("unit", e.target.value)}
          className={`form-select ${
            form.errors.unit ? "is-invalid" : ""
          }`}
        >
          <option value="">Select Unit</option>

           {DRY_ITEM_UNITS.map((item) =>
            <option value={item.value} key={item.value}>
                {item.label}
              </option>
          )}
        </select>
        {form.errors.unit && (
          <div className="text-danger mt-1">{form.errors.unit}</div>
        )}
      </div>

{COUNTABLE_UNITS.includes(form.values.unit) &&   <div className="">
        <label className="form-label">Weight of ONE item (grams)
Example: 1 wooden table = 1kg
</label>

        <input
          type="text"
          value={form.values.unit_weight_grams}
          onChange={(e) => form.setField("unit_weight_grams", e.target.value)}
          className={`form-control ${
            form.errors.unit_weight_grams ? "is-invalid" : ""
          }`}
          placeholder="Enter Weight per unit"
        />
        {form.errors.unit_weight_grams && (
          <div className="text-danger mt-1">{form.errors.unit_weight_grams}</div>
        )}
      </div>}
    

      <div className="">
        <input
          type="date"
         value={form.values.warehoused_date || ""}
          onChange={(e) => form.setField("warehoused_date", e.target.value)}
          className={`form-control ${
            form.errors.warehoused_date ? "is-invalid" : ""
          }`}
        />
        {form.errors.warehoused_date && (
          <div className="text-danger mt-1">{form.errors.warehoused_date}</div>
        )}
      </div>
      <div className="">
        <label className="form-label">Select Chamber</label>
        <select
          value={form.values.chamber_id || ""}
          onChange={(e) => form.setField("chamber_id", e.target.value)}
          className={`form-select ${
            form.errors.chamber_id ? "is-invalid" : ""
          }`}
        >
          <option value="">Select Chamber</option>

          {chambersList.current?.map((chamber) =>
            chamber.tag === "dry" ? (
              <option value={chamber.id} key={chamber.id}>
                {chamber.chamber_name}
              </option>
            ) : null
          )}
        </select>
        {form.errors.chamber_id && (
          <div className="text-danger mt-1">{form.errors.chamber_id}</div>
        )}
      </div>
 
    </div>
  );
};

export default ItemFormFields;
