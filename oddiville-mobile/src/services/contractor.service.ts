import api from "@/src/lib/axios";

export const createContractor = (formData: any) => api.post("/contractor/create", formData)
export const fetchContractors = () =>  api.get("/contractor/all")
export const fetchContractorById = (id: any) =>  api.get(`/contractor/${id}`)

