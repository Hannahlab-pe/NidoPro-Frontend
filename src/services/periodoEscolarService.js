// src/services/periodoEscolarService.js
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
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestión de períodos escolares
 */
class PeriodoEscolarService {
  /**
   * Obtener todos los períodos escolares
   * @returns {Promise<Array>} Lista de períodos escolares
   */
  async obtenerPeriodos() {
    try {
      console.log('📤 Obteniendo períodos escolares');

      const response = await api.get('/periodo-escolar');
      console.log('📥 Períodos escolares obtenidos:', response.data);

      return response.data?.periodos || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al obtener períodos escolares:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener períodos escolares');
    }
  }

  /**
   * Crear nuevo período escolar
   * @param {Object} periodoData - Datos del período escolar
   * @returns {Promise<Object>} Período escolar creado
   */
  async crearPeriodo(periodoData) {
    try {
      console.log('📤 Creando período escolar:', periodoData);

      const response = await api.post('/periodo-escolar', periodoData);
      console.log('📥 Período escolar creado:', response.data);

      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al crear período escolar:', error);
      throw new Error(error.response?.data?.message || 'Error al crear período escolar');
    }
  }

  /**
   * Actualizar período escolar
   * @param {string} id - ID del período escolar
   * @param {Object} periodoData - Datos actualizados
   * @returns {Promise<Object>} Período escolar actualizado
   */
  async actualizarPeriodo(id, periodoData) {
    try {
      console.log('📤 Actualizando período escolar:', id, periodoData);

      const response = await api.patch(`/periodo-escolar/${id}`, periodoData);
      console.log('📥 Período escolar actualizado:', response.data);

      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al actualizar período escolar:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar período escolar');
    }
  }

  /**
   * Eliminar período escolar
   * @param {string} id - ID del período escolar
   * @returns {Promise<void>}
   */
  async eliminarPeriodo(id) {
    try {
      console.log('📤 Eliminando período escolar:', id);

      const response = await api.delete(`/periodo-escolar/${id}`);
      console.log('📥 Período escolar eliminado:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error al eliminar período escolar:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar período escolar');
    }
  }
}

const periodoEscolarService = new PeriodoEscolarService();
export default periodoEscolarService;
