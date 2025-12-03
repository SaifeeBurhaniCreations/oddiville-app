import * as YUP from "yup";

export const chamberFormValidation = YUP.object({

    chamber_name: YUP.string()
        .trim()
        .required("Please enter the Chamber Name."),
    capacity: YUP.number()
        .typeError("Capacity must be a number.")
        .required("Please enter the chamber capacity.")
        .positive("Capacity must be a positive number.")
        .integer("Capacity must be a whole number."),
    tag: YUP.string()
        .oneOf(["frozen", "dry"], "Invalid tag selected.")
        .required("Please select the chamber tag."),
});