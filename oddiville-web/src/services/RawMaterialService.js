import api from "../lib/axios";

const createRawMaterial = async (formData) => {
  const response = await api.post(`/raw-material`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response;
};

const fetchRawMaterial = async () => {
  const response = await api.get(`/raw-material/all`);
  return response;
};

const modifyRawMaterial = async (dataModel) => {
  const { id, formData } = dataModel;
  const response = await api.put(`/raw-material/${id}`, formData);
  return response;
};

const removeRawMaterial = async (id) => {
  const response = await api.delete(`/raw-material/${id}`);
  return response;
};

export {
  createRawMaterial,
  fetchRawMaterial,
  removeRawMaterial,
  modifyRawMaterial
};
