import api from "../lib/axios";

const create = async (formData) => {
  const response = await api.post(`/chamber/type/dry`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
};

const fetchDryWarehouse = async () => {
  const response = await api.get(`/chamber/type/dry`);
  return response;
};

const fetchServicesById = async (id) => {
  const response = await api.get(`/chamber/type/dry/${id}`);
  return response;
};

const remove = async (id) => {
  const response = await api.delete(`/chamber/type/dry/${id}`);
  return response;
};

const modify = async (dataModel) => {
  const { id, formData } = dataModel;
  const response = await api.put(`/chamber/type/dry/${id}`, formData);
  return response;
};

const createChamber = async (formData) => {
  const response = await api.post(`/chamber`, formData);
  return response;
};

const fetchChamber = async () => {
  const response = await api.get(`/chamber`);
  return response;
};

const removeChamber = async (id) => {
  const response = await api.delete(`/chamber/${id}`);
  return response;
};

export {
  create,
  fetchDryWarehouse,
  fetchServicesById,
  remove,
  modify,
  createChamber,
  fetchChamber,
  removeChamber,
};
