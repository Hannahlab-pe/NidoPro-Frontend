// src/services/pagosPensionService.js
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
 * Servicio para gestionar pagos de pensiones mediante caja simple
 */
export const pagosPensionService = {
  /**
   * Registrar un pago de pensión
   * @param {Object} pagoData - Datos del pago
   * @returns {Promise<Object>} Pago registrado
   */
  async registrarPago(pagoData) {
    try {
      console.log('Registrando pago de pensión:', pagoData);
      
      // Validar datos requeridos según el endpoint
      const requiredFields = ['idEstudiante', 'idPensionRelacionada', 'monto', 'metodoPago', 'numeroComprobante', 'registradoPor'];
      const missingFields = requiredFields.filter(field => !pagoData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos exactamente como espera el backend
      const payload = {
        idEstudiante: pagoData.idEstudiante,
        idPensionRelacionada: pagoData.idPensionRelacionada,
        monto: Number(pagoData.monto),
        metodoPago: pagoData.metodoPago,
        numeroComprobante: pagoData.numeroComprobante,
        registradoPor: pagoData.registradoPor,
        observaciones: pagoData.observaciones || null
      };

      const response = await api.post('/caja-simple/pension', payload);
      console.log('Pago registrado exitosamente:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error al registrar pago:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar el pago');
    }
  },

  /**
   * Obtener historial de pagos
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de pagos
   */
  async obtenerHistorialPagos(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/caja-simple/pension?${params.toString()}`);
      console.log('Historial de pagos obtenido:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial de pagos:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener historial de pagos');
    }
  },

  /**
   * Obtener un pago específico por ID
   * @param {string|number} id - ID del pago
   * @returns {Promise<Object>} Datos del pago
   */
  async obtenerPagoPorId(id) {
    try {
      const response = await api.get(`/caja-simple/pension/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pago:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener el pago');
    }
  },

  /**
   * Obtener pagos por estudiante
   * @param {string|number} idEstudiante - ID del estudiante
   * @returns {Promise<Array>} Lista de pagos del estudiante
   */
  async obtenerPagosPorEstudiante(idEstudiante) {
    try {
      const response = await api.get(`/caja-simple/pension/estudiante/${idEstudiante}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pagos por estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pagos del estudiante');
    }
  },

  /**
   * Obtener estadísticas de pagos
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas de pagos
   */
  async obtenerEstadisticasPagos(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/caja-simple/pension/estadisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de pagos:', error);
      throw new Error('Error al obtener estadísticas de pagos');
    }
  },

  /**
   * Generar comprobante de pago
   * @param {string|number} id - ID del pago
   * @returns {Promise<Blob>} Archivo PDF del comprobante
   */
  async generarComprobante(id) {
    try {
      console.log('Generando comprobante para pago:', id);
      const response = await api.get(`/caja-simple/pension/${id}/comprobante`, {
        responseType: 'blob'
      });
      console.log('Comprobante generado exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al generar comprobante:', error);
      throw new Error('Error al generar comprobante de pago');
    }
  },

  /**
   * Anular un pago
   * @param {string|number} id - ID del pago
   * @param {string} motivo - Motivo de la anulación
   * @returns {Promise<Object>} Resultado de la anulación
   */
  async anularPago(id, motivo) {
    try {
      console.log(`Anulando pago ID: ${id}, motivo: ${motivo}`);
      const response = await api.delete(`/caja-simple/pension/${id}`, {
        data: { motivo }
      });
      console.log('Pago anulado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al anular pago:', error);
      throw new Error(error.response?.data?.message || 'Error al anular el pago');
    }
  }
};

export default pagosPensionService;
