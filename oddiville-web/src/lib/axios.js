import axios from "axios";

// const API_URL = "https://oddiville.onrender.com/api";
// const API_URL = "https://oddiapi.sbcws.com/api";
const API_URL = "http://localhost:8022/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptors
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("metadata"); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
      let message = "Something went wrong. Please try again.";
    if (error.response?.status === 401) {
      console.warn("Token expired or unauthorized!");
    }
    return Promise.reject(error);
  }
);

export default api;

