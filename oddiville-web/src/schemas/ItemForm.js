// import * as YUP from "yup";

// export const itemFormValidation = YUP.object({
//   item_name: YUP.string().required("Item Name is required"),
//   chamber_id: YUP.string().required("Category Required"),
//   warehoused_date: YUP.string()
//     .required("Date required")
//     .matches(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
//   description: YUP.string().required("Description is required"),
//   quantity_unit: YUP.string().required("Quantity required"),
//   //   sample_image: YUP.mixed().required("Select a file"),
//   sample_image: YUP.mixed()
//     .required("Select a file")
//     .test("fileType", "Only PNG and JPG images are allowed", (value) => {
//       return value && ["image/png", "image/jpeg"].includes(value.type);
//     })
//     .test("fileSize", "File size too large (max 5MB)", (value) => {
//       return value && value.size <= 5 * 1024 * 1024;
//     }),
// });

export const initialValues = {
  item_name: "",
  chamber_id: "",
  warehoused_date: "",
  description: "",
  quantity: "",
  unit: "",
  unit_weight_grams: "",
  sample_image: "",
};

export const validationRules = {
  item_name: [{ type: "required", message: "Item name is required" }],
  chamber_id: [{ type: "required", message: "Category required" }],
  warehoused_date: [
    { type: "required", message: "Date required" },
    {
      type: "custom",
      message: "Invalid date format, expected YYYY-MM-DD",
      validate: (value) => {
        if (!value) return false;
        // Regex from your YUP schema
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(value);
      },
    },
  ],
  description: [{ type: "required", message: "Description is required" }],
  quantity: [
  { type: "required", message: "Quantity required" },
  {
    type: "custom",
    message: "Quantity must be a number",
    validate: (v) => !isNaN(Number(v))
  }
],

  unit: [{ type: "required", message: "Unit required" }],
  unit_weight_grams: [
  {
    type: "custom",
    message: "Weight per unit required for count units",
    validate: (value, data) => {
  const countUnits = ["pcs","box","set","roll","bundle","pack"];

  if (countUnits.includes(data.unit)) {
    if (!value) return false;
    if (isNaN(Number(value))) return false;
    if (Number(value) <= 0) return false;
  }
  return true;
}
  }
],
  sample_image: [
    {
      type: "custom",
      message: "Image is required",
      validate: (value) => {
        if (!value) return false;

        if (typeof value === "object" && value.url) return true;

        if (value instanceof File) return true;
        if (value instanceof FileList && value.length > 0) return true;
        if (Array.isArray(value) && value.length > 0) return true;

        return false;
      },
    },
  ],
};
