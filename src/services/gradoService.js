// src/services/gradoService.js
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
  (response) => response,
  (error) => {
    console.error('Error en la respuesta del API de grados:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar grados
 */
export const gradoService = {
  /**
   * Obtener todos los grados
   * @returns {Promise<Array>} Lista de grados
   */
  async getAllGrados() {
    try {
      const response = await api.get('/grado');
      
      // Extraer datos según la estructura de respuesta
      let gradosData = [];
      
      if (response.data?.info?.data && Array.isArray(response.data.info.data)) {
        gradosData = response.data.info.data;
      } else if (response.data?.grados && Array.isArray(response.data.grados)) {
        gradosData = response.data.grados;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        gradosData = response.data.data;
      } else if (Array.isArray(response.data)) {
        gradosData = response.data;
      }
      
      // Normalizar los datos para que tengan un campo 'nombre' consistente
      const gradosNormalizados = gradosData.map(grado => ({
        ...grado,
        nombre: grado.grado || grado.nombre, // Usar 'grado' como 'nombre' si existe
        id: grado.idGrado || grado.id // Asegurar que el ID esté disponible
      }));
      
      return gradosNormalizados;
    } catch (error) {
      console.error('❌ Error al obtener grados:', error);
      
      // Si hay error, retornar array vacío
      return [];
    }
  },

  /**
   * Obtener un grado por ID
   * @param {string} id - ID del grado
   * @returns {Promise<Object>} Datos del grado
   */
  async getGradoById(id) {
    try {
      const response = await api.get(`/grado/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener grado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener grado');
    }
  },

  /**
   * Crear un nuevo grado
   * @param {Object} gradoData - Datos del grado
   * @returns {Promise<Object>} Grado creado
   */
  async createGrado(gradoData) {
    try {
      console.log('📤 Creando nuevo grado:', gradoData);
      const response = await api.post('/grado', gradoData);
      console.log('✅ Grado creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear grado:', error);
      throw new Error(error.response?.data?.message || 'Error al crear grado');
    }
  },

  /**
   * Actualizar grado existente
   * @param {string} id - ID del grado
   * @param {Object} gradoData - Datos actualizados del grado
   * @returns {Promise<Object>} Grado actualizado
   */
  async updateGrado(id, gradoData) {
    try {
      console.log('📤 Actualizando grado:', id, gradoData);
      const response = await api.patch(`/grado/${id}`, gradoData);
      console.log('✅ Grado actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar grado:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar grado');
    }
  },

  /**
   * Eliminar grado
   * @param {string} id - ID del grado
   * @returns {Promise<Object>} Respuesta de eliminación
   */
  async deleteGrado(id) {
    try {
      console.log('📤 Eliminando grado:', id);
      const response = await api.delete(`/grado/${id}`);
      console.log('✅ Grado eliminado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar grado:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar grado');
    }
  }
};

export default gradoService;
