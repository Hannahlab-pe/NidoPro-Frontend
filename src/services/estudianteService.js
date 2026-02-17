import axios from 'axios';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en estudianteService:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestión de estudiantes
 */
export const estudianteService = {
  /**
   * Obtener estudiantes por aula
   * @param {string} idAula - ID del aula
   * @returns {Promise} Lista de estudiantes del aula
   */
  getEstudiantesPorAula: async (idAula) => {
    try {
      const response = await api.get(`/estudiante/aula/${idAula}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estudiantes por aula:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiantes del aula');
    }
  },

  /**
   * Obtener un estudiante específico por ID
   * @param {string} idEstudiante - ID del estudiante
   * @returns {Promise<Object>} Datos completos del estudiante
   */
  obtenerEstudiantePorId: async (idEstudiante) => {
    try {
      // Incluir parámetros para traer relaciones necesarias
      const response = await api.get(`/estudiante/${idEstudiante}`, {
        params: {
          include: 'matriculas,aula,matriculaAula' // Incluir relaciones
        }
      });
      
      // Verificar estructura de respuesta
      if (response.data) {
        return response.data;
      }
      
      return null;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener datos del estudiante');
    }
  },

  /**
   * Obtener cronograma de un aula específica
   * @param {string} idAula - ID del aula
   * @returns {Promise<Array>} Lista de actividades del cronograma
   */
  obtenerCronogramaPorAula: async (idAula) => {
    try {
      // Validar que el idAula sea válido antes de hacer la petición
      if (!idAula || idAula === 'undefined' || idAula === 'null') {
        throw new Error('ID de aula no válido');
      }
      
      const response = await api.get(`/cronograma/aula/${idAula}`);
      
      // Manejar diferentes estructuras de respuesta del backend
      if (response.data?.success && response.data?.cronogramas) {
        return response.data.cronogramas;
      } else if (response.data?.success && response.data?.cronograma) {
        return response.data.cronograma;
      } else if (response.data?.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener cronograma del aula');
    }
  }
};

export default {
  getEstudiantesPorAula: estudianteService.getEstudiantesPorAula,
  obtenerEstudiantePorId: estudianteService.obtenerEstudiantePorId,
  obtenerCronogramaPorAula: estudianteService.obtenerCronogramaPorAula
};
