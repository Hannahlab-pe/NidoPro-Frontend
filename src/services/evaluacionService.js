import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

const evaluacionApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
evaluacionApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const evaluacionService = {
  async createEvaluacionDocente(evaluationData) {
    console.log("🚀 evaluacionService.createEvaluacionDocente iniciando...");
    console.log("📤 URL:", `${API_BASE_URL}/evaluacion-docente-bimestral`);
    console.log("📋 Datos a enviar:", evaluationData);

    try {
      const response = await evaluacionApi.post(
        "/evaluacion-docente-bimestral",
        evaluationData
      );
      console.log("✅ Respuesta exitosa del backend:", response.data);
      console.log("✅ Status:", response.status);
      return response.data;
    } catch (error) {
      console.error("❌ Error en createEvaluacionDocente:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error request:", error.request);
      console.error("❌ Error message:", error.message);
      throw error;
    }
  },

  async getEvaluacionesDocente() {
    console.log("📥 evaluacionService.getEvaluacionesDocente iniciando...");
    try {
      const response = await evaluacionApi.get("/evaluacion-docente-bimestral");
      console.log("✅ API Response:", response.data);
      return response.data.evaluaciones || [];
    } catch (error) {
      console.error("❌ Error en getEvaluacionesDocente:", error);
      throw error;
    }
  },
};
