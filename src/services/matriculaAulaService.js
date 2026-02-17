// src/services/matriculaAulaService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
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

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar las asignaciones de estudiantes a aulas
 */
export const matriculaAulaService = {
  /**
   * Obtener estudiantes de un aula específica
   * @param {string} idAula - ID del aula
   * @returns {Promise<Array>} Lista de estudiantes matriculados en el aula
   */
  async getEstudiantesAula(idAula) {
    try {
      console.log('📚 Obteniendo estudiantes del aula:', idAula);
      const response = await api.get(`/matricula-aula/estudiantes-aula/${idAula}`);
      
      console.log('✅ Estudiantes obtenidos:', response.data);
      
      // Extraer datos según estructura de respuesta
      let estudiantes = [];
      
      if (response.data?.info?.data && Array.isArray(response.data.info.data)) {
        estudiantes = response.data.info.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        estudiantes = response.data.data;
      } else if (Array.isArray(response.data)) {
        estudiantes = response.data;
      }
      
      return estudiantes;
    } catch (error) {
      console.error('❌ Error al obtener estudiantes del aula:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiantes del aula');
    }
  }
};

export default matriculaAulaService;
