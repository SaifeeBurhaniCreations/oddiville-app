export const initialValues = {
  item_name: "",
  chamber_id: "",
  warehoused_date: new Date(),
  description: "",
  quantity_unit: "",
  sample_image: null,
};

export const validationRules = {
  item_name: [
    { type: "required", message: "Item Name is required" },
    { type: "minLength", length: 3, message: "Minimum 3 characters required" },
  ],
  chamber_id: [{ type: "required", message: "Please select a category" }],
  warehoused_date: [{ type: "required", message: "Date is required" }],
  description: [
    { type: "required", message: "Description is required" },
    { type: "minLength", length: 3, message: "Minimum 3 characters required" },
  ],
  quantity_unit: [{ type: "required", message: "Quantity Unit is required" }],
  sample_image: [{ type: "required", message: "image is required" }],
};