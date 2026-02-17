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
    console.error('Error en tareaService:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestión de tareas
 */
export const tareaService = {
  /**
   * Crear una nueva tarea
   * @param {Object} tareaData - Datos de la tarea a crear
   * @returns {Promise} Respuesta del servidor
   */
  crearTarea: async (tareaData) => {
    try {
      console.log('🔍 [TAREA SERVICE] Iniciando creación de tarea');
      console.log('📝 [TAREA SERVICE] Datos de tarea:', tareaData);
      console.log('🌐 [TAREA SERVICE] URL completa:', `${API_BASE_URL}/tarea`);
      console.log('🔑 [TAREA SERVICE] Token en localStorage:', localStorage.getItem('token') ? 'EXISTE' : 'NO EXISTE');
      
      const response = await api.post('/tarea', tareaData);
      
      console.log('✅ [TAREA SERVICE] Tarea creada exitosamente:');
      console.log('📊 [TAREA SERVICE] Status:', response.status);
      console.log('📋 [TAREA SERVICE] Headers:', response.headers);
      console.log('💾 [TAREA SERVICE] Data completa:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [TAREA SERVICE] Error completo:', error);
      console.error('❌ [TAREA SERVICE] Error response:', error.response);
      console.error('❌ [TAREA SERVICE] Error data:', error.response?.data);
      console.error('❌ [TAREA SERVICE] Error status:', error.response?.status);
      console.error('❌ [TAREA SERVICE] Error message:', error.message);
      throw new Error(error.response?.data?.message || 'Error al crear la tarea');
    }
  },

  /**
   * Crear una nueva tarea (alias para mantener consistencia)
   * @param {Object} tareaData - Datos de la tarea a crear
   * @returns {Promise} Respuesta del servidor
   */
  createTarea: async (tareaData) => {
    return tareaService.crearTarea(tareaData);
  },

  /**
   * Obtener tareas de un trabajador específico
   * @param {string} idTrabajador - ID del trabajador
   * @returns {Promise} Lista de tareas del trabajador
   */
  obtenerTareasPorTrabajador: async (idTrabajador) => {
    try {
      const response = await api.get(`/tarea/trabajador/${idTrabajador}`);
      
      // Verificar la estructura de respuesta
      if (response.data.success && response.data.tareas) {
        return response.data.tareas; // Retornar solo el array de tareas
      } else if (Array.isArray(response.data)) {
        return response.data; // Si ya es un array
      } else {
        return response.data; // Fallback
      }
    } catch (error) {
      console.error('❌ [TAREA SERVICE] Error al obtener tareas del trabajador:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las tareas del trabajador');
    }
  },

  /**
   * Obtener tareas de un estudiante específico
   * @param {string} idEstudiante - ID del estudiante
   * @returns {Promise} Array de tareas del estudiante
   */
  obtenerTareasPorEstudiante: async (idEstudiante) => {
    try {
      const response = await api.get(`/tarea/estudiante/${idEstudiante}`);
      
      // Verificar la estructura de respuesta
      if (response.data.success && response.data.tareas) {
        return response.data.tareas; // Retornar solo el array de tareas
      } else if (Array.isArray(response.data)) {
        return response.data; // Si ya es un array
      } else {
        return response.data; // Fallback
      }
    } catch (error) {
      console.error('❌ [TAREA SERVICE] Error al obtener tareas del estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener las tareas del estudiante');
    }
  },

  /**
   * Obtener todas las tareas
   * @returns {Promise} Lista de tareas
   */
  obtenerTareas: async () => {
    try {
      const response = await api.get('/tarea');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener tareas:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener tareas');
    }
  },

  /**
   * Obtener una tarea por ID
   * @param {string} idTarea - ID de la tarea
   * @returns {Promise} Datos de la tarea
   */
  obtenerTareaPorId: async (idTarea) => {
    try {
      const response = await api.get(`/tarea/${idTarea}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener tarea:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener la tarea');
    }
  },

  /**
   * Actualizar una tarea
   * @param {string} idTarea - ID de la tarea
   * @param {Object} tareaData - Datos actualizados de la tarea
   * @returns {Promise} Respuesta del servidor
   */
  actualizarTarea: async (idTarea, tareaData) => {
    try {
      const response = await api.patch(`/tarea/${idTarea}`, tareaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar tarea:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al actualizar la tarea');
    }
  },

  /**
   * Eliminar una tarea
   * @param {string} idTarea - ID de la tarea
   * @returns {Promise} Respuesta del servidor
   */
  eliminarTarea: async (idTarea) => {
    try {
      const response = await api.delete(`/tarea/${idTarea}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar tarea:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al eliminar la tarea');
    }
  },

  /**
   * Registrar la entrega de una tarea por parte de un estudiante
   * @param {Object} entregaData - Datos de la entrega
   * @param {string} entregaData.idTarea - ID de la tarea
   * @param {string} entregaData.idEstudiante - ID del estudiante
   * @param {boolean} entregaData.realizoTarea - Si realizó la tarea
   * @param {string} entregaData.observaciones - Observaciones del padre/estudiante
   * @param {string} entregaData.archivoUrl - URL del archivo adjunto (opcional)
   * @returns {Promise} Respuesta del servidor
   */
  entregarTarea: async (entregaData) => {
    try {
      console.log('📤 Enviando entrega de tarea:', entregaData);
      
      const response = await api.post('/tarea-entrega', entregaData);
      
      console.log('✅ Entrega enviada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al enviar entrega de tarea:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al enviar la entrega de la tarea');
    }
  },

  /**
   * Obtener todas las entregas de una tarea específica
   * @param {string} idTarea - ID de la tarea
   * @returns {Promise} Respuesta del servidor con entregas y estadísticas
   */
  obtenerEntregasPorTarea: async (idTarea) => {
    try {
      console.log('🔍 Obteniendo entregas para tarea:', idTarea);
      
      const response = await api.get(`/tarea-entrega/tarea/${idTarea}`);
      
      console.log('✅ Entregas obtenidas exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener entregas de la tarea:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener las entregas de la tarea');
    }
  }
};

export default tareaService;
