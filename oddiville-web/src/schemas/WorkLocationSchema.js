export const initialLocationState = {
  location_name: "",
  description: "",
  sample_image: null,
};

// export const locationValidationSchema = {
//   location_name: [{ type: "required", message: "Location Name is required" }],
//   description: [
//     { type: "required", message: "Description is required" },
//     { type: "minLength", length: 5, message: "Minimum 5 characters" },
//   ],
//   // sample_image: [
//   //     {
//   //         type: "required",
//   //         message: "Image is required for new locations",

//   //     },
//   // ],
//   sample_image: [
//     {
//       type: "custom",
//       message: "Image is required",
//       validate: (value) => {
//         // Check if value exists
//         if (!value) return false;
//         if (value instanceof File) return true;
//         if (value instanceof FileList && value.length > 0) return true;
//         if (Array.isArray(value) && value.length > 0) return true;

//         return false;
//       },
//     },
//   ],
// };
