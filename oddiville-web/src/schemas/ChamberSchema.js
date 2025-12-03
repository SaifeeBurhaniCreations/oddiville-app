
export const initialChamberState = {
    chamber_name: "",
    capacity: "",
    tag: "",
};

export const chamberValidationSchema = {
    chamber_name: [
        { type: "required", message: "Chamber name is required" },
        { type: "minLength", length: 3, message: "Minimum 3 characters needed" },
    ],
    capacity: [
        { type: "required", message: "Please mention the capacity of chamber" },
        { type: "number", message: "Only numbers allowed" },
    ],
    tag: [{ type: "required", message: "Chamber type required" }],
};