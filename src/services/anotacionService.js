// src/services/anotacionService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Configurar interceptor para token
const axiosInstance = axios.create({
  baseURL: API_BASE_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    throw error;
  }
);

export const anotacionService = {
  /**
   * Crear una nueva anotación
   * @param {Object} anotacionData - Datos de la anotación
   * @returns {Promise} Respuesta del servidor
   */
  async create(anotacionData) {
    try {
      // console.log('📤 Datos enviados al endpoint:', anotacionData);
      const response = await axiosInstance.post('/anotaciones-estudiante', anotacionData);
      return response.data;
    } catch (error) {
      console.error('Error creating anotacion:', error);
      // console.error('📤 Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Error al crear la anotación');
    }
  },

  /**
   * Obtener todas las anotaciones
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} Lista de anotaciones
   */
  async getAll(params = {}) {
    try {
      const response = await axiosInstance.get('/anotaciones-estudiante', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching anotaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las anotaciones');
    }
  },

  /**
   * Obtener anotación por ID
   * @param {string} id - ID de la anotación
   * @returns {Promise} Datos de la anotación
   */
  async getById(id) {
    try {
      const response = await axiosInstance.get(`/anotaciones-estudiante/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching anotacion:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener la anotación');
    }
  },

  /**
   * Actualizar anotación
   * @param {string} id - ID de la anotación
   * @param {Object} anotacionData - Datos actualizados
   * @returns {Promise} Anotación actualizada
   */
  async update(id, anotacionData) {
    try {
      const response = await axiosInstance.patch(`/anotaciones-estudiante/${id}`, anotacionData);
      return response.data;
    } catch (error) {
      console.error('Error updating anotacion:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar la anotación');
    }
  },

  /**
   * Eliminar anotación
   * @param {string} id - ID de la anotación
   * @returns {Promise} Confirmación de eliminación
   */
  async delete(id) {
    try {
      const response = await axiosInstance.delete(`/anotaciones-estudiante/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting anotacion:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar la anotación');
    }
  },

  /**
   * Obtener anotaciones por estudiante
   * @param {string} idEstudiante - ID del estudiante
   * @returns {Promise} Lista de anotaciones del estudiante
   */
  async getByStudent(idEstudiante) {
    try {
      console.log('📋 Obteniendo anotaciones para estudiante:', idEstudiante);
      const response = await axiosInstance.get(`/anotaciones-estudiante/estudiante/${idEstudiante}`);
      console.log('📋 Respuesta del backend:', response);
      console.log('📋 Datos de respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching student anotaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las anotaciones del estudiante');
    }
  },

  /**
   * Obtener anotaciones por trabajador
   * @param {string} idTrabajador - ID del trabajador
   * @returns {Promise} Lista de anotaciones del trabajador
   */
  async getByWorker(idTrabajador) {
    try {
      const response = await axiosInstance.get(`/anotaciones-estudiante/trabajador/${idTrabajador}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching worker anotaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las anotaciones del trabajador');
    }
  },

  /**
   * Obtener anotaciones por estudiante (alias para getByStudent)
   * @param {string} estudianteId - ID del estudiante
   * @returns {Promise} Lista de anotaciones del estudiante
   */
  async getAnotacionesByEstudiante(estudianteId) {
    return this.getByStudent(estudianteId);
  }
};

export default anotacionService;
