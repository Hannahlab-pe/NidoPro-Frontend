// src/services/api/pensionService.js
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
 * Servicio para gestionar pensiones
 */
export const pensionService = {
  /**
   * Obtener todas las pensiones desde el endpoint correcto
   * @returns {Promise<Array>} Lista de pensiones
   */
  async getAllPensionesBase() {
    try {
      const response = await api.get('/pension');
      
      // Estructura esperada: { success: true, message: "...", info: { data: [...] } }
      if (response.data?.info?.data && Array.isArray(response.data.info.data)) {
        return response.data.info.data;
      }
      
      // Fallback si la estructura es diferente
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.warn('⚠️ Estructura de respuesta inesperada para /pension:', response.data);
      return [];
    } catch (error) {
      console.error('❌ Error al obtener pensiones base:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones');
    }
  },

  /**
   * Obtener todas las pensiones (legacy - usando pension-estudiante)
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de pensiones
   */
  async getAllPensiones(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/pension-estudiante?${params.toString()}`);
      console.log('Respuesta del backend - pensiones estudiante:', response.data);
      
      // Extraer el array de pensiones de la respuesta según la estructura real
      // El endpoint /pension-estudiante devuelve directamente un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.pensiones && Array.isArray(response.data.pensiones)) {
        return response.data.pensiones;
      }
      
      console.warn('Estructura de respuesta inesperada:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener pensiones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones');
    }
  },

  /**
   * Obtener pensiones de los hijos de un apoderado
   * @param {string} apoderadoId - ID del apoderado
   * @param {Object} filters - Filtros opcionales (idEstudiante, estadoPension, anio, mes)
   * @returns {Promise<Array>} Lista de pensiones del apoderado
   */
  async getPensionesPorApoderado(apoderadoId, filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await api.get(`/pension-estudiante/apoderado/${apoderadoId}${queryString}`);
      console.log('Respuesta del backend - pensiones por apoderado:', response.data);
      
      // El endpoint devuelve directamente un array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.pensiones && Array.isArray(response.data.pensiones)) {
        return response.data.pensiones;
      }
      
      console.warn('Estructura de respuesta inesperada:', response.data);
      return [];
    } catch (error) {
      console.error('Error al obtener pensiones por apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones del apoderado');
    }
  },

  /**
   * Obtener una pensión por ID
   * @param {string|number} id - ID de la pensión
   * @returns {Promise<Object>} Datos de la pensión
   */
  async getPensionById(id) {
    try {
      const response = await api.get(`/pension/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pensión:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensión');
    }
  },

  /**
   * Crear una nueva pensión
   * @param {Object} pensionData - Datos de la pensión
   * @returns {Promise<Object>} Pensión creada
   */
  async createPension(pensionData) {
    try {
      console.log('Enviando datos de pensión al backend:', pensionData);
      
      // Validar datos requeridos según el backend
      const requiredFields = ['idEstudiante', 'monto', 'mes', 'anio'];
      const missingFields = requiredFields.filter(field => !pensionData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos exactamente como espera el backend
      const payload = {
        idEstudiante: pensionData.idEstudiante,
        monto: Number(pensionData.monto),
        mes: Number(pensionData.mes),
        anio: Number(pensionData.anio),
        fechaVencimiento: pensionData.fechaVencimiento || new Date().toISOString(),
        estadoPago: pensionData.estadoPago || 'pendiente',
        metodoPago: pensionData.metodoPago || null,
        referenciaPago: pensionData.referenciaPago || null,
        fechaPago: pensionData.fechaPago || null,
        observaciones: pensionData.observaciones || null
      };

      const response = await api.post('/pension', payload);
      console.log('Pensión creada exitosamente:', response.data);
      
      // Extraer la pensión de la respuesta del backend
      if (response.data.pension) {
        return response.data.pension;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al crear pensión:', error);
      throw new Error(error.response?.data?.message || 'Error al crear pensión');
    }
  },

  /**
   * Actualizar una pensión existente
   * @param {string|number} id - ID de la pensión
   * @param {Object} pensionData - Datos actualizados de la pensión
   * @returns {Promise<Object>} Pensión actualizada
   */
  async updatePension(id, pensionData) {
    try {
      console.log('Actualizando pensión:', id, pensionData);
      
      // Preparar datos para el backend
      const payload = {
        monto: pensionData.monto ? Number(pensionData.monto) : undefined,
        mes: pensionData.mes ? Number(pensionData.mes) : undefined,
        anio: pensionData.anio ? Number(pensionData.anio) : undefined,
        fechaVencimiento: pensionData.fechaVencimiento,
        estadoPago: pensionData.estadoPago,
        metodoPago: pensionData.metodoPago,
        referenciaPago: pensionData.referenciaPago,
        fechaPago: pensionData.fechaPago,
        observaciones: pensionData.observaciones
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.patch(`/pension/${id}`, payload);
      console.log('Pensión actualizada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar pensión:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar pensión');
    }
  },

  /**
   * Eliminar una pensión (eliminación lógica)
   * @param {string|number} id - ID de la pensión
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deletePension(id) {
    try {
      console.log(`Eliminando pensión ID: ${id}`);
      const response = await api.delete(`/pension/${id}`);
      console.log('Pensión eliminada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar pensión:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar pensión');
    }
  },

  /**
   * Obtener pensiones de un estudiante específico
   * @param {string|number} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de pensiones del estudiante
   */
  async getPensionesByStudent(studentId) {
    try {
      const response = await api.get(`/pension/estudiante/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener pensiones por estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones por estudiante');
    }
  },

  /**
   * Obtener pensiones por mes y año
   * @param {number} mes - Mes (1-12)
   * @param {number} anio - Año
   * @returns {Promise<Array>} Lista de pensiones del período
   */
  async getPensionesByMonth(mes, anio) {
    try {
      const filters = { mes, anio };
      return await this.getAllPensiones(filters);
    } catch (error) {
      console.error('Error al obtener pensiones por mes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones por mes');
    }
  },

  /**
   * Marcar una pensión como pagada
   * @param {string|number} id - ID de la pensión
   * @param {Object} paymentData - Datos del pago
   * @returns {Promise<Object>} Pensión actualizada
   */
  async markAsPaid(id, paymentData = {}) {
    try {
      console.log('Marcando pensión como pagada:', id, paymentData);
      
      const payload = {
        estadoPago: 'pagado',
        fechaPago: paymentData.fechaPago || new Date().toISOString(),
        metodoPago: paymentData.metodoPago || 'Efectivo',
        referenciaPago: paymentData.referenciaPago || null,
        observaciones: paymentData.observaciones || null
      };

      const response = await api.patch(`/pension/${id}`, payload);
      console.log('Pensión marcada como pagada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al marcar pensión como pagada:', error);
      throw new Error(error.response?.data?.message || 'Error al procesar pago');
    }
  },

  /**
   * Marcar una pensión como vencida
   * @param {string|number} id - ID de la pensión
   * @returns {Promise<Object>} Pensión actualizada
   */
  async markAsOverdue(id) {
    try {
      console.log('Marcando pensión como vencida:', id);
      
      const payload = {
        estadoPago: 'vencido'
      };

      const response = await api.patch(`/pension/${id}`, payload);
      console.log('Pensión marcada como vencida:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al marcar pensión como vencida:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado');
    }
  },

  /**
   * Obtener pensiones pendientes
   * @returns {Promise<Array>} Lista de pensiones pendientes
   */
  async getPendingPensiones() {
    try {
      return await this.getAllPensiones({ estadoPago: 'pendiente' });
    } catch (error) {
      console.error('Error al obtener pensiones pendientes:', error);
      throw new Error('Error al obtener pensiones pendientes');
    }
  },

  /**
   * Obtener pensiones vencidas
   * @returns {Promise<Array>} Lista de pensiones vencidas
   */
  async getOverduePensiones() {
    try {
      return await this.getAllPensiones({ estadoPago: 'vencido' });
    } catch (error) {
      console.error('Error al obtener pensiones vencidas:', error);
      throw new Error('Error al obtener pensiones vencidas');
    }
  },

  /**
   * Obtener pensiones pagadas
   * @returns {Promise<Array>} Lista de pensiones pagadas
   */
  async getPaidPensiones() {
    try {
      return await this.getAllPensiones({ estadoPago: 'pagado' });
    } catch (error) {
      console.error('Error al obtener pensiones pagadas:', error);
      throw new Error('Error al obtener pensiones pagadas');
    }
  },

  /**
   * Buscar pensiones por estudiante (DNI, nombre, etc.)
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de pensiones que coinciden
   */
  async searchPensiones(query) {
    try {
      return await this.getAllPensiones({ search: query });
    } catch (error) {
      console.error('Error al buscar pensiones:', error);
      throw new Error('Error al buscar pensiones');
    }
  },

  /**
   * Generar recordatorio para pensiones vencidas
   * @param {string|number} id - ID de la pensión
   * @returns {Promise<Object>} Resultado del recordatorio
   */
  async sendPaymentReminder(id) {
    try {
      console.log('Enviando recordatorio de pago para pensión:', id);
      const response = await api.post(`/pension/${id}/reminder`);
      return response.data;
    } catch (error) {
      console.error('Error al enviar recordatorio:', error);
      throw new Error(error.response?.data?.message || 'Error al enviar recordatorio');
    }
  },

  /**
   * Obtener estadísticas financieras
   * @param {Object} filters - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas financieras
   */
  async getFinancialStats(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/pension/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas financieras:', error);
      throw new Error('Error al obtener estadísticas');
    }
  },

  /**
   * Generar reporte financiero
   * @param {Object} filters - Filtros para el reporte
   * @returns {Promise<Object>} Reporte financiero
   */
  async generateFinancialReport(filters = {}) {
    try {
      console.log('Generando reporte financiero...');
      const params = new URLSearchParams(filters);
      const response = await api.get(`/pension/report?${params.toString()}`);
      console.log('Reporte generado exitosamente');
      return response.data;
    } catch (error) {
      console.error('Error al generar reporte:', error);
      throw new Error('Error al generar reporte');
    }
  },

  /**
   * Exportar pensiones a CSV
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo CSV
   */
  async exportPensionesToCSV(filters = {}) {
    try {
      console.log('Exportando pensiones a CSV...');
      const params = new URLSearchParams(filters);
      const response = await api.get(`/pension/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });
      console.log('Exportación completada');
      return response.data;
    } catch (error) {
      console.error('Error al exportar pensiones:', error);
      throw new Error('Error al exportar pensiones');
    }
  },

  /**
   * Exportar pensiones a PDF
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo PDF
   */
  async exportPensionesToPDF(filters = {}) {
    try {
      console.log('Exportando pensiones a PDF...');
      const params = new URLSearchParams(filters);
      const response = await api.get(`/pension/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      console.log('Exportación PDF completada');
      return response.data;
    } catch (error) {
      console.error('Error al exportar pensiones a PDF:', error);
      throw new Error('Error al exportar pensiones');
    }
  },

  /**
   * Importar pensiones desde CSV
   * @param {File} file - Archivo CSV
   * @returns {Promise<Object>} Resultado de la importación
   */
  async importPensionsFromCSV(file) {
    try {
      console.log('Importando pensiones desde CSV...');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/pension/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Importación completada:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al importar pensiones:', error);
      throw new Error(error.response?.data?.message || 'Error al importar pensiones');
    }
  },

  /**
   * Procesar pago masivo de pensiones
   * @param {Array} pensionIds - IDs de las pensiones a marcar como pagadas
   * @param {Object} paymentData - Datos comunes del pago
   * @returns {Promise<Object>} Resultado del procesamiento masivo
   */
  async processBulkPayment(pensionIds, paymentData) {
    try {
      console.log('Procesando pago masivo:', pensionIds.length, 'pensiones');
      
      const payload = {
        pensionIds,
        estadoPago: 'pagado',
        fechaPago: paymentData.fechaPago || new Date().toISOString(),
        metodoPago: paymentData.metodoPago || 'Transferencia',
        observaciones: paymentData.observaciones || 'Pago masivo procesado'
      };

      const response = await api.post('/pension/bulk/payment', payload);
      console.log('Pago masivo procesado:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en pago masivo:', error);
      throw new Error(error.response?.data?.message || 'Error al procesar pago masivo');
    }
  },

  /**
   * Configurar recordatorios automáticos
   * @param {Object} config - Configuración de recordatorios
   * @returns {Promise<Object>} Configuración guardada
   */
  async configureAutomaticReminders(config) {
    try {
      console.log('Configurando recordatorios automáticos:', config);
      const response = await api.post('/pension/reminders/config', config);
      return response.data;
    } catch (error) {
      console.error('Error al configurar recordatorios:', error);
      throw new Error('Error al configurar recordatorios automáticos');
    }
  },

  /**
   * Obtener todas las pensiones de estudiantes con filtros opcionales
   * @param {Object} filtros - Filtros opcionales
   * @returns {Promise<Object>} Lista de pensiones
   */
  async obtenerPensionesEstudiantes(filtros = {}) {
    try {
      // Construir query params si hay filtros
      const queryParams = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          queryParams.append(key, filtros[key]);
        }
      });

      const url = `/pension-estudiante${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      console.log('🔍 Obteniendo pensiones de estudiantes...', { url, filtros });

      const response = await api.get(url);
      
      console.log('📥 Pensiones obtenidas:', response.data.length, 'registros');
      
      return {
        success: true,
        pensiones: Array.isArray(response.data) ? response.data : []
      };

    } catch (error) {
      console.error('❌ Error al obtener pensiones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener pensiones');
    }
  },

  /**
   * Verificar o rechazar múltiples pagos de forma masiva
   * @param {Object} datos - Datos para verificación masiva
   * @returns {Promise<Object>} Resultado de la verificación
   */
  async verificarPagosMasivo(datos) {
    try {
      console.log('📤 Verificando pagos masivos:', datos);

      const response = await api.patch('/pension-estudiante/verify-masivo', datos);

      console.log('✅ Pagos verificados:', response.data);
      
      return {
        success: true,
        resultado: response.data
      };

    } catch (error) {
      console.error('❌ Error al verificar pagos:', error);
      throw new Error(error.response?.data?.message || 'Error al verificar pagos masivos');
    }
  }
};

export default pensionService;
