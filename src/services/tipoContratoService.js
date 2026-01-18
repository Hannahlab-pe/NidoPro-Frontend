// src/services/tipoContratoService.js
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
      console.error('❌ Respuesta HTML detectada en tipoContratoService');
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
      console.warn('🔐 Token expirado en tipoContratoService, redirigiendo al login');
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
 * Servicio para gestionar tipos de contrato
 */
export const tipoContratoService = {
  /**
   * Obtener todos los tipos de contrato
   * @returns {Promise<Array>} Lista de tipos de contrato
   */
  async getAllTiposContrato() {
    try {
      console.log('📋 Obteniendo tipos de contrato desde el backend...');
      const response = await api.get('/tipo-contrato');
      console.log('✅ Tipos de contrato obtenidos:', response.data);

      // La respuesta ya es un array de tipos de contrato
      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Si viene envuelto en un objeto
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener tipos de contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tipos de contrato');
    }
  },

  /**
   * Obtener un tipo de contrato por ID
   * @param {string} id - ID del tipo de contrato
   * @returns {Promise<Object>} Datos del tipo de contrato
   */
  async getTipoContratoById(id) {
    try {
      const response = await api.get(`/tipo-contrato/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipo de contrato:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener tipo de contrato');
    }
  }
};

export default tipoContratoService;
