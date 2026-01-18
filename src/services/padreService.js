// src/services/api/parentService.js
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
  (response) => response,
  (error) => {
    console.error('Error en la respuesta del API:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar padres/apoderados
 */
export const padreService = {
  /**
   * Obtener todos los padres
   * @param {Object} filters - Filtros opcionales (status, relation, participationLevel, etc.)
   * @returns {Promise<Array>} Lista de padres
   */
  async getAllParents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/apoderado?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener padres:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener padres');
    }
  },

  /**
   * Obtener un padre por ID
   * @param {string|number} id - ID del padre
   * @returns {Promise<Object>} Datos del padre
   */
  async getParentById(id) {
    try {
      const response = await api.get(`/apoderado/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener padre:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener padre');
    }
  },

  /**
   * Crear un nuevo padre
   * @param {Object} parentData - Datos del padre
   * @returns {Promise<Object>} Padre creado
   */
  async createParent(parentData) {
    try {
      console.log('📤 Enviando datos del padre al backend:', parentData);
      
      // Validar datos requeridos
      const requiredFields = ['name', 'email', 'phone', 'relation', 'address'];
      const missingFields = requiredFields.filter(field => !parentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos para el backend
      const payload = {
        // Información personal
        name: parentData.name.trim(),
        email: parentData.email.trim(),
        phone: parentData.phone.trim(),
        relation: parentData.relation,
        address: parentData.address.trim(),
        occupation: parentData.occupation?.trim() || null,
        
        // Contacto de emergencia
        emergencyContact: {
          name: parentData.emergencyContact?.name?.trim() || null,
          phone: parentData.emergencyContact?.phone?.trim() || null,
          relation: parentData.emergencyContact?.relation || null
        },
        
        // Información adicional
        participationLevel: parentData.participationLevel || 'medium',
        notes: parentData.notes?.trim() || null,
        
        // Foto
        photo: parentData.photo || null,
        
        // Campos adicionales
        status: 'active',
        registrationDate: new Date().toISOString().split('T')[0],
        lastVisit: null
      };

      const response = await api.post('/apoderado', payload);
      console.log('✅ Padre creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear padre:', error);
      throw new Error(error.response?.data?.message || 'Error al crear padre');
    }
  },

  /**
   * Actualizar un padre existente
   * @param {string|number} id - ID del padre
   * @param {Object} parentData - Datos actualizados del padre
   * @returns {Promise<Object>} Padre actualizado
   */
  async updateParent(id, parentData) {
    try {
      console.log('📤 Actualizando padre:', id, parentData);
      
      // Preparar datos para el backend
      const payload = {
        name: parentData.name?.trim(),
        email: parentData.email?.trim(),
        phone: parentData.phone?.trim(),
        relation: parentData.relation,
        address: parentData.address?.trim(),
        occupation: parentData.occupation?.trim(),
        emergencyContact: parentData.emergencyContact ? {
          name: parentData.emergencyContact.name?.trim() || null,
          phone: parentData.emergencyContact.phone?.trim() || null,
          relation: parentData.emergencyContact.relation || null
        } : undefined,
        participationLevel: parentData.participationLevel,
        notes: parentData.notes?.trim(),
        photo: parentData.photo,
        status: parentData.status,
        lastVisit: parentData.lastVisit
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put(`/apoderado/${id}`, payload);
      console.log('✅ Padre actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar padre:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar padre');
    }
  },

  /**
   * Eliminar un padre
   * @param {string|number} id - ID del padre
   * @returns {Promise<void>}
   */
  async deleteParent(id) {
    try {
      console.log('🗑️ Eliminando padre:', id);
      await api.delete(`/apoderado/${id}`);
      console.log('✅ Padre eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar padre:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar padre');
    }
  },

  /**
   * Cambiar el estado de un padre (activo/inactivo)
   * @param {string|number} id - ID del padre
   * @param {string} status - Nuevo estado ('active' | 'inactive')
   * @returns {Promise<Object>} Padre actualizado
   */
  async changeParentStatus(id, status) {
    try {
      console.log('🔄 Cambiando estado del padre:', id, status);
      const response = await api.patch(`/apoderado/${id}/status`, { status });
      console.log('✅ Estado cambiado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar estado del padre:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del padre');
    }
  },

  /**
   * Obtener padres por relación (padre/madre/tutor)
   * @param {string} relation - Relación a filtrar
   * @returns {Promise<Array>} Lista de padres con esa relación
   */
  async getParentsByRelation(relation) {
    try {
      const response = await api.get(`/parents/relation/${relation}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener padres por relación:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener padres por relación');
    }
  },

  /**
   * Obtener padres por nivel de participación
   * @param {string} level - Nivel de participación ('high' | 'medium' | 'low')
   * @returns {Promise<Array>} Lista de padres con ese nivel
   */
  async getParentsByParticipation(level) {
    try {
      const response = await api.get(`/parents/participation/${level}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener padres por participación:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener padres por participación');
    }
  },

  /**
   * Buscar padres por nombre
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de padres que coinciden
   */
  async searchParents(query) {
    try {
      const response = await api.get(`/parents/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar padres:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar padres');
    }
  },

  /**
   * Obtener hijos de un padre específico
   * @param {string|number} parentId - ID del padre
   * @returns {Promise<Array>} Lista de hijos del padre
   */
  async getParentChildren(parentId) {
    try {
      const response = await api.get(`/parents/${parentId}/children`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener hijos del padre:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener hijos del padre');
    }
  },

  /**
   * Asignar hijo a un padre
   * @param {string|number} parentId - ID del padre
   * @param {string|number} studentId - ID del estudiante
   * @returns {Promise<Object>} Relación creada
   */
  async assignChildToParent(parentId, studentId) {
    try {
      const response = await api.post(`/parents/${parentId}/children`, { studentId });
      return response.data;
    } catch (error) {
      console.error('Error al asignar hijo al padre:', error);
      throw new Error(error.response?.data?.message || 'Error al asignar hijo al padre');
    }
  },

  /**
   * Remover hijo de un padre
   * @param {string|number} parentId - ID del padre
   * @param {string|number} studentId - ID del estudiante
   * @returns {Promise<void>}
   */
  async removeChildFromParent(parentId, studentId) {
    try {
      await api.delete(`/parents/${parentId}/children/${studentId}`);
    } catch (error) {
      console.error('Error al remover hijo del padre:', error);
      throw new Error(error.response?.data?.message || 'Error al remover hijo del padre');
    }
  },

  /**
   * Obtener estadísticas de padres
   * @returns {Promise<Object>} Estadísticas de padres
   */
  async getParentStats() {
    try {
      const response = await api.get('/parents/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Obtener historial de reuniones de un padre
   * @param {string|number} parentId - ID del padre
   * @returns {Promise<Array>} Historial de reuniones
   */
  async getParentMeetings(parentId) {
    try {
      const response = await api.get(`/parents/${parentId}/meetings`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reuniones del padre:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reuniones del padre');
    }
  },

  /**
   * Registrar una nueva reunión con un padre
   * @param {string|number} parentId - ID del padre
   * @param {Object} meetingData - Datos de la reunión
   * @returns {Promise<Object>} Reunión creada
   */
  async createParentMeeting(parentId, meetingData) {
    try {
      const response = await api.post(`/parents/${parentId}/meetings`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Error al crear reunión:', error);
      throw new Error(error.response?.data?.message || 'Error al crear reunión');
    }
  }
};

export default padreService;
