// src/services/api/reporteService.js
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
 * Servicio para gestionar la generación y descarga de reportes
 */
export const reporteService = {
  /**
   * Obtener la lista de reportes generados
   * @param {Object} filters - Filtros opcionales (ej: status, category, dateRange)
   * @returns {Promise<Array>} Lista de reportes
   */
  async getAllReportes(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/informe?${params.toString()}`);
      console.log('Respuesta del backend - informes:', response.data);
      
      // CORRECCIÓN: Extraer datos de la estructura correcta
      if (response.data.success && response.data.info?.data) {
        console.log('Datos extraídos correctamente:', response.data.info.data);
        return response.data.info.data;
      }
      
      // Fallback para otras estructuras
      if (response.data.success && response.data.informes) {
        return response.data.informes;
      }
      
      // Si es un array directo
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // Fallback final - array vacío
      console.warn('Estructura de datos no reconocida:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener reportes');
    }
  },

  /**
   * Obtener los detalles de un reporte por su ID
   * @param {string|number} id - ID del reporte
   * @returns {Promise<Object>} Datos del reporte
   */
  async getInformeById(id) {
    try {
      const response = await api.get(`/informe/${id}`);
      
      if (response.data.success && response.data.info) {
        return response.data.info;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener informe por ID:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener informe');
    }
  },

  /**
   * Generar un nuevo reporte
   * @param {Object} reportData - Datos para generar el reporte (ej: type, filters, format)
   * @returns {Promise<Object>} Respuesta del servidor con los detalles del reporte generado
   */
  async generateInforme(reportData) {
    try {
      console.log('Enviando solicitud para generar informe:', reportData);

      // Validar datos requeridos
      const requiredFields = ['type'];
      const missingFields = requiredFields.filter(field => !reportData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      const response = await api.post('/informe', reportData);
      console.log('Respuesta del backend:', response.data);

      if (response.data.success && response.data.informe) {
        return response.data.informe;
      }
      
      if (response.data.success && response.data.info) {
        return response.data.info;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al generar informe:', error);
      throw new Error(error.response?.data?.message || 'Error al generar informe');
    }
  },

  /**
   * Actualizar un informe existente
   * @param {string|number} id - ID del informe
   * @param {Object} updateData - Datos para actualizar
   * @returns {Promise<Object>} Informe actualizado
   */
  async updateInforme(id, updateData) {
    try {
      const response = await api.put(`/informe/${id}`, updateData);
      
      if (response.data.success && response.data.informe) {
        return response.data.informe;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al actualizar informe:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar informe');
    }
  },

  /**
   * Descargar un informe ya generado
   * @param {string|number} id - ID del reporte
   * @param {string} format - Formato del archivo (ej: 'pdf', 'csv', 'xlsx')
   * @returns {Promise<Blob>} Archivo del reporte
   */
  async downloadReport(id, format = 'pdf') {
    try {
      console.log(`Descargando reporte ID ${id} en formato ${format}`);
      const response = await api.get(`/informe/${id}/download?format=${format}`, {
        responseType: 'blob' // Importante para manejar archivos
      });
      console.log('Descarga completada');
      return response.data;
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar reporte');
    }
  },

  /**
   * Exportar informe en formato específico
   * @param {string|number} id - ID del informe
   * @param {string} formato - Formato de exportación ('pdf', 'excel', 'csv')
   * @returns {Promise<Blob>} Archivo exportado
   */
  async exportInforme(id, formato = 'pdf') {
    try {
      const response = await api.get(`/informe/${id}/export/${formato}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al exportar informe:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar informe');
    }
  },

  /**
   * Obtener estadísticas de uso de reportes
   * @returns {Promise<Object>} Estadísticas de uso
   */
  async getReportStats() {
    try {
      const response = await api.get('/informe/stats');
      
      if (response.data.success && response.data.stats) {
        return response.data.stats;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de reportes:', error);
      throw new Error('Error al obtener estadísticas de reportes');
    }
  },
  
  /**
   * Eliminar un reporte generado
   * @param {string|number} id - ID del reporte a eliminar
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteReport(id) {
    try {
      const response = await api.delete(`/informe/${id}`);
      
      if (response.data.success) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar reporte');
    }
  },

  /**
   * Obtener tipos de informes disponibles
   * @returns {Promise<Array>} Lista de tipos de informes
   */
  async getTiposInformes() {
    try {
      const response = await api.get('/informe/tipos');
      
      if (response.data.success && response.data.tipos) {
        return response.data.tipos;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener tipos de informes:', error);
      throw new Error('Error al obtener tipos de informes');
    }
  },

  /**
   * Búsqueda avanzada de informes
   * @param {Object} searchParams - Parámetros de búsqueda
   * @returns {Promise<Array>} Lista de informes filtrados
   */
  async searchInformes(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/informe/search?${params.toString()}`);
      
      if (response.data.success && response.data.informes) {
        return response.data.informes;
      }
      
      if (response.data.success && response.data.info?.data) {
        return response.data.info.data;
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error en búsqueda de informes:', error);
      throw new Error(error.response?.data?.message || 'Error en búsqueda de informes');
    }
  }
};

export default reporteService;
