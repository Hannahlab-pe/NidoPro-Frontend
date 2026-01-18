// src/services/contratoService.js
import axios from 'axios';

// Base URL del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nidopro.up.railway.app/api/v1';

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
    // Verificar si la respuesta contiene HTML en lugar de JSON
    if (typeof response.data === 'string' && response.data.includes('<html>')) {
      console.error('❌ Respuesta HTML detectada en contratoService');
      if (import.meta.env.PROD) {
        // En producción, crear una respuesta vacía en lugar de fallar
        return {
          ...response,
          data: []
        };
      }
    }
    return response;
  },
  (error) => {
    console.error('Error en la respuesta del API:', error);

    // Si el token expiró, redirigir al login (solo si no estamos ya en login)
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.warn('🔐 Token expirado en contratoService, redirigiendo al login');
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');

      // En producción, usar reemplazo en lugar de asignación directa
      if (import.meta.env.PROD) {
        window.location.replace('/login');
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar contratos de trabajadores
 */
export const contratoService = {
  /**
   * Obtener todos los contratos con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de contratos
   */
  async getAllContratos(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get(`/contrato-trabajador?${params.toString()}`);
      console.log('📋 Respuesta del backend para contratos:', response.data);

      // La respuesta ya es un array de contratos
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Si viene envuelto en un objeto
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener contratos');
    }
  },

  /**
   * Obtener un contrato por ID
   * @param {string} id - ID del contrato
   * @returns {Promise<Object>} Datos del contrato
   */
  async getContratoById(id) {
    try {
      const response = await api.get(`/contrato-trabajador/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener contrato');
    }
  },

  /**
   * Crear un nuevo contrato
   * @param {Object} contratoData - Datos del contrato
   * @returns {Promise<Object>} Contrato creado
   */
  async createContrato(contratoData) {
    try {
      console.log('📤 Enviando datos del contrato al backend:', contratoData);

      const response = await api.post('/contrato-trabajador', contratoData);
      console.log('✅ Contrato creado exitosamente:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ Error al crear contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al crear contrato');
    }
  },

  /**
   * Actualizar un contrato existente
   * @param {string} id - ID del contrato
   * @param {Object} contratoData - Datos actualizados del contrato
   * @returns {Promise<Object>} Contrato actualizado
   */
  async updateContrato(id, contratoData) {
    try {
      console.log('📤 Actualizando contrato:', id, contratoData);

      const response = await api.patch(`/contrato-trabajador/${id}`, contratoData);
      console.log('✅ Contrato actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar contrato');
    }
  },

  /**
   * Eliminar un contrato
   * @param {string} id - ID del contrato
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteContrato(id) {
    try {
      console.log(`🗑️ Eliminando contrato ID: ${id}`);
      const response = await api.delete(`/contrato-trabajador/${id}`);
      console.log('✅ Contrato eliminado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar contrato');
    }
  },

  /**
   * Finalizar un contrato
   * @param {string} id - ID del contrato
   * @param {Object} finalizacionData - Datos de finalización
   * @returns {Promise<Object>} Contrato finalizado
   */
  async finalizarContrato(id, finalizacionData) {
    try {
      console.log('📤 Finalizando contrato:', id, finalizacionData);

      const response = await api.patch(`/contrato-trabajador/${id}/finalizar`, finalizacionData);
      console.log('✅ Contrato finalizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al finalizar contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al finalizar contrato');
    }
  }
};

export default contratoService;
