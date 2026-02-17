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
    console.error('Error en asignacionAulaService:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestión de asignaciones de aula
 */
export const asignacionAulaService = {
  /**
   * Crear una nueva asignación de aula para un docente
   * @param {Object} asignacionData - Datos de la asignación
   * @param {string} asignacionData.fechaAsignacion - Fecha de asignación (YYYY-MM-DD)
   * @param {boolean} asignacionData.estadoActivo - Estado activo de la asignación
   * @param {string} asignacionData.idAula - ID del aula
   * @param {string} asignacionData.idTrabajador - ID del trabajador/docente
   * @returns {Promise} Respuesta de la asignación creada
   */
  createAsignacion: async (asignacionData) => {
    try {
      console.log('📝 Creando asignación de aula:', asignacionData);
      
      // Validar datos requeridos
      const requiredFields = ['idAula', 'idTrabajador'];
      const missingFields = requiredFields.filter(field => asignacionData[field] === undefined || asignacionData[field] === null);
      
      if (missingFields.length > 0) {
        throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
      }
      
      const response = await api.post('/asignacion-docente-curso-aula', asignacionData);
      
      console.log('✅ Asignación creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear asignación de aula:', error);
      throw new Error(error.response?.data?.message || 'Error al asignar aula al docente');
    }
  },

  /**
   * Obtener todas las asignaciones de aula
   * @returns {Promise} Lista de todas las asignaciones con datos completos
   */
  getAllAsignaciones: async () => {
    try {
      const response = await api.get('/asignacion-docente-curso-aula');
      
      console.log('✅ Asignaciones obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener asignaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asignaciones de aula');
    }
  },

  /**
   * Obtener asignaciones de aula por trabajador
   * @param {string} idTrabajador - ID del trabajador
   * @returns {Promise} Lista de asignaciones del trabajador
   */
  getAsignacionesByTrabajador: async (idTrabajador) => {
    try {
      console.log('🔍 Obteniendo asignaciones para trabajador:', idTrabajador);
      const response = await api.get(`/asignacion-aula/trabajador/${idTrabajador}`);
      
      console.log('✅ Asignaciones obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener asignaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asignaciones de aula');
    }
  },

  /**
   * Actualizar una asignación de aula
   * @param {string} idAsignacion - ID de la asignación
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise} Asignación actualizada
   */
  updateAsignacion: async (idAsignacion, updateData) => {
    try {
      console.log('📝 Actualizando asignación:', idAsignacion, updateData);
      const response = await api.put(`/asignacion-aula/${idAsignacion}`, updateData);
      
      console.log('✅ Asignación actualizada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar asignación:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar asignación de aula');
    }
  },

  /**
   * Eliminar/desactivar una asignación de aula
   * @param {string} idAsignacion - ID de la asignación
   * @returns {Promise} Respuesta de eliminación
   */
  deleteAsignacion: async (idAsignacion) => {
    try {
      console.log('🗑️ Eliminando asignación:', idAsignacion);
      const response = await api.delete(`/asignacion-aula/${idAsignacion}`);
      
      console.log('✅ Asignación eliminada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar asignación:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar asignación de aula');
    }
  }
};

export default asignacionAulaService;
