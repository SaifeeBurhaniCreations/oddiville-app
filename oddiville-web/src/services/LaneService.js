import api from "../lib/axios"


const create = async(formData) => {
    const response = await api.post(`/lane`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response
}

const fetchLanes = async() => {
    const response = await api.get(`/lane`)
    return response;
}

const fetchLaneById = async(id) => {
    const response = await api.get(`/lane/${id}`)
    return response;
}

const remove = async(id) => {
    const response = await api.delete(`/lane/${id}`)
    return response;
}

const modify = async(dataModel) => {
    const { id, formData } = dataModel
    const response = await api.put(`/lane/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response;
}



export { create, fetchLanes, fetchLaneById, remove, modify }