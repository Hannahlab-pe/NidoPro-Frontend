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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const secretariaPagosService = {
  async getEstudiantesByAula(idAula) {
    const response = await api.get(`/secretaria-pagos/aula/${idAula}/estudiantes`);
    return response.data;
  },

  async getRegistrosByAula(idAula) {
    const response = await api.get(`/secretaria-pagos/aula/${idAula}/registros`);
    return response.data;
  },

  async getEstudianteDetalle(idEstudiante) {
    const response = await api.get(`/secretaria-pagos/estudiante/${idEstudiante}`);
    return response.data;
  },

  async registrarHorarioPagoInicial(payload) {
    const response = await api.post("/secretaria-pagos/registro", payload);
    return response.data;
  },

  async registrarPagoMensual(payload) {
    const response = await api.post("/secretaria-pagos/pago-mensual", payload);
    return response.data;
  },

  async actualizarPagoMensual(idPagoMensual, payload) {
    const response = await api.patch(
      `/secretaria-pagos/pago-mensual/${idPagoMensual}`,
      payload
    );
    return response.data;
  },

  async actualizarMontoInicial(idEstudiante, payload) {
    const response = await api.patch(
      `/secretaria-pagos/registro/${idEstudiante}/monto-inicial`,
      payload
    );
    return response.data;
  },

  async getResumenAulaMes(idAula, anio, mes) {
    const response = await api.get(
      `/secretaria-pagos/resumen/aula/${idAula}/${anio}/${mes}`
    );
    return response.data;
  },
};

export default secretariaPagosService;
