// src/services/claseService.js
import axios from "axios";

// Base URL del API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la respuesta del API:", error);

    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

/**
 * Servicio para gestionar clases
 */
export const claseService = {
  /**
   * Obtener todas las clases con filtros opcionales
   * @param {Object} filters - Filtros para la consulta
   * @returns {Promise<Array>} Lista de clases
   */
  async getAllClases(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.grado) params.append("grado", filters.grado);
      if (filters.seccion) params.append("seccion", filters.seccion);
      if (filters.turno) params.append("turno", filters.turno);
      if (filters.estado) params.append("estado", filters.estado);
      if (filters.search) params.append("search", filters.search);

      const response = await api.get(`/curso?${params.toString()}`);

      // Extraer datos del objeto info.data si existe
      return (
        response.data?.info?.data || response.data?.info || response.data || []
      );
    } catch (error) {
      console.error("Error al obtener cursos:", error);
      throw error;
    }
  },

  /**
   * Crear una nueva clase
   * @param {Object} claseData - Datos de la clase
   * @returns {Promise<Object>} Clase creada
   */
  async createClase(claseData) {
    try {
      console.log("📝 Creando nueva clase:", claseData);

      const payload = {
        nombre: claseData.nombre.trim(),
        grado: claseData.grado,
        seccion: claseData.seccion.trim(),
        profesorId: claseData.profesorId,
        aulaId: claseData.aulaId,
        turno: claseData.turno,
        horario: claseData.horario,
        capacidad: parseInt(claseData.capacidad),
        materias: claseData.materias || [],
        estado: claseData.estado || "activa",
      };

      const response = await api.post("/clase", payload);
      console.log("✅ Clase creada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al crear clase:", error);
      throw new Error(error.response?.data?.message || "Error al crear clase");
    }
  },

  /**
   * Actualizar una clase existente
   * @param {string|number} id - ID de la clase
   * @param {Object} claseData - Datos actualizados
   * @returns {Promise<Object>} Clase actualizada
   */
  async updateClase(id, claseData) {
    try {
      console.log("📝 Actualizando clase:", id, claseData);

      const payload = {
        nombre: claseData.nombre?.trim(),
        grado: claseData.grado,
        seccion: claseData.seccion?.trim(),
        profesorId: claseData.profesorId,
        aulaId: claseData.aulaId,
        turno: claseData.turno,
        horario: claseData.horario,
        capacidad: claseData.capacidad
          ? parseInt(claseData.capacidad)
          : undefined,
        materias: claseData.materias,
        estado: claseData.estado,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put(`/clase/${id}`, payload);
      console.log("✅ Clase actualizada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar clase:", error);
      throw new Error(
        error.response?.data?.message || "Error al actualizar clase",
      );
    }
  },

  /**
   * Eliminar una clase
   * @param {string|number} id - ID de la clase
   * @returns {Promise<void>}
   */
  async deleteClase(id) {
    try {
      console.log("🗑️ Eliminando clase:", id);
      await api.delete(`/clase/${id}`);
      console.log("✅ Clase eliminada exitosamente");
    } catch (error) {
      console.error("❌ Error al eliminar clase:", error);
      throw new Error(
        error.response?.data?.message || "Error al eliminar clase",
      );
    }
  },

  /**
   * Cambiar el estado de una clase (activa/inactiva)
   * @param {string|number} id - ID de la clase
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} Clase actualizada
   */
  async changeClaseStatus(id, status) {
    try {
      const response = await api.patch(`/curso/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error al cambiar estado de curso:", error);
      throw error;
    }
  },

  /**
   * Obtener clases por grado
   * @param {string} grado - Grado a filtrar
   * @returns {Promise<Array>} Lista de clases del grado
   */
  async getClasesByGrado(grado) {
    try {
      const response = await api.get(`/clase/grado/${grado}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener clases por grado:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener clases por grado",
      );
    }
  },

  /**
   * Buscar clases por nombre, grado o profesor
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de clases encontradas
   */
  async searchClases(query) {
    try {
      const response = await api.get(
        `/clase/search?q=${encodeURIComponent(query)}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error al buscar clases:", error);
      throw new Error(
        error.response?.data?.message || "Error al buscar clases",
      );
    }
  },

  /**
   * Obtener estadísticas de clases
   * @returns {Promise<Object>} Estadísticas de clases
   */
  async getClaseStats() {
    try {
      const response = await api.get("/clase/stats");
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener estadísticas",
      );
    }
  },
};

export default claseService;
