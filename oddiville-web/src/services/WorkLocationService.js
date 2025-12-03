import api from "../lib/axios"


const create = async(formData) => {
    const response = await api.post(`/location`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response
}

const fetchLocations = async() => {
    const response = await api.get(`/location`)
    return response;
}

const fetchLocationById = async(id) => {
    const response = await api.get(`/location/${id}`)
    return response;
}

const remove = async(id) => {
    const response = await api.delete(`/location/${id}`)
    return response;
}

const modify = async(dataModel) => {
    const { id, formData } = dataModel
    const response = await api.put(`/location/${id}`, formData)
    return response;
}



export { create, fetchLocations, fetchLocationById, remove, modify }