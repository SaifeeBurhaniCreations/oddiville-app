import api from "../lib/axios"


const create = async(formData) => {
    const response = await api.post(`/other-product`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    return response
}

const modify = async(dataModel) => {
    const { id, formData } = dataModel
    console.log(`MODIFY - FormData for ID: ${id}`);
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
    }
    return
    const response = await api.put(`/other-product/${id}`, formData)
    return response;
}

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