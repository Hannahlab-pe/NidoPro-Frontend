import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

const observacionService = {
  async listarObservaciones() {
    try {
      const response = await api.get("/observacion");
      const data = response.data;

      const observaciones = Array.isArray(data)
        ? data
        : data?.info?.data || data?.data || data?.observaciones || [];

      return Array.isArray(observaciones) ? observaciones : [];
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al listar observaciones",
      );
    }
  },

  async crearObservacion(data) {
    try {
      const payload = {
        titulo: data.titulo,
        tipoObservacion: data.tipoObservacion,
      };

      if (data.descripcion) {
        payload.descripcion = data.descripcion;
      }

      if (data.imagenUrl) {
        payload.imagenUrl = data.imagenUrl;
      }

      const response = await api.post("/observacion", payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Error al registrar observación",
      );
    }
  },
};

export default observacionService;
