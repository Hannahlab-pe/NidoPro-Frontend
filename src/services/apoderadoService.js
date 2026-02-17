// src/services/apoderadoService.js
import axios from 'axios';

// Base URL del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Configuración de axios
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
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en la respuesta del API:', error);
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar apoderados
 */
export const apoderadoService = {
  /**
   * Obtener todos los apoderados
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise<Object>} Lista de apoderados
   */
  async getApoderados(params = {}) {
    try {
      
      // Construir query string
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      
      const queryString = queryParams.toString();
      const url = queryString ? `/apoderado?${queryString}` : '/apoderado';
      
      const response = await api.get(url);
      console.log('✅ Apoderados obtenidos exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener apoderados:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener apoderados');
    }
  },

  /**
   * Obtener un apoderado por ID
   * @param {string|number} id - ID del apoderado
   * @returns {Promise<Object>} Datos del apoderado
   */
  async getApoderadoById(id) {
    try {
      console.log('🔍 Obteniendo apoderado por ID:', id);
      const response = await api.get(`/apoderado/${id}`);
      console.log('✅ Apoderado obtenido exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al obtener apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener apoderado');
    }
  },

  /**
   * Crear un nuevo apoderado
   * @param {Object} apoderadoData - Datos del apoderado
   * @returns {Promise<Object>} Apoderado creado
   */
  async createApoderado(apoderadoData) {
    try {
      console.log('📤 Enviando datos del apoderado al backend:', apoderadoData);
      
      const response = await api.post('/apoderado', apoderadoData);
      console.log('✅ Apoderado creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al crear apoderado');
    }
  },

  /**
   * Actualizar información de un apoderado
   * NOTA: Esta función está deshabilitada porque no existe el endpoint PATCH en el backend
   * @param {string|number} id - ID del apoderado
   * @param {Object} apoderadoData - Datos actualizados del apoderado
   * @returns {Promise<Object>} Error - funcionalidad no disponible
   */
  async updateApoderado(id, apoderadoData) {
    console.warn('⚠️ updateApoderado está deshabilitado - no existe endpoint PATCH en backend');
    throw new Error('Error: Cannot PATCH /api/v1/apoderado/' + id + ' - Endpoint no existe en backend');
  },

  /**
   * Eliminar un apoderado
   * @param {string|number} id - ID del apoderado
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteApoderado(id) {
    try {
      console.log('🗑️ Eliminando apoderado:', id);
      const response = await api.delete(`/apoderado/${id}`);
      console.log('✅ Apoderado eliminado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar apoderado');
    }
  },

  /**
   * Cambiar estado de un apoderado (activar/desactivar)
   * @param {string|number} id - ID del apoderado
   * @returns {Promise<Object>} Apoderado con estado actualizado
   */
  async toggleApoderadoStatus(id) {
    try {
      console.log('🔄 Cambiando estado del apoderado:', id);
      const response = await api.patch(`/apoderado/${id}/toggle-status`);
      console.log('✅ Estado del apoderado actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar estado del apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del apoderado');
    }
  },

  /**
   * Obtener estadísticas de apoderados
   * @returns {Promise<Object>} Estadísticas de apoderados
   */
  async getApoderadoStats() {
    try {
      console.log('📊 Obteniendo estadísticas de apoderados...');
      const response = await api.get('/apoderado/stats');
      console.log('✅ Estadísticas obtenidas exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
};

export default apoderadoService;
