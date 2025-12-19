import api from "../lib/axios"


const create = async(formData) => {
    const response = await api.post(`/other-product`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response
}

const modify = async(dataModel) => {
    const { id, formData } = dataModel

    const response = await api.patch(`/other-product/${id}`, formData)
    return response;
}

export const modifyImage = ({ formData, id }) =>
  api.patch(`/other-product/${id}/image`, formData);

const remove = async(id) => {
    const response = await api.delete(`/other-product/${id}`)
    return response;
}
const removeThirdPartyProduct = async(id) => {
    const response = await api.delete(`/other-product/${id}`)
    return response;
}

const fetchAllOrders = async() => {
    const response = await api.get(`/other-product`)
    return response;
}

const fetchThirdPartyProducts = async() => {
    const response = await api.get(`/other-product`)
    return response;
}

const fetchById = async(id) => {
    const response = await api.get(`/other-product/${id}`)
    return response;
}

const fetchThirdPartyProductsById = async(id) => {
    const response = await api.get(`/other-product/${id}`)
    return response;
}


const fetchOtherItems = async() => {
    const response = await api.get(`/other-product/products`)
    return response;
}


export { create, remove, modify, fetchAllOrders, fetchById, fetchThirdPartyProducts, fetchThirdPartyProductsById, removeThirdPartyProduct, fetchOtherItems }