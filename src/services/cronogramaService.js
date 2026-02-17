// src/services/cronogramaService.js
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
    console.log('🔐 Token cronograma enviado:', token ? 'Token presente' : 'Sin token');
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
 * Servicio para gestión del cronograma
 */
class CronogramaService {
  /**
   * Obtener cronograma de un aula específica
   * @param {string} idAula - ID del aula
   * @returns {Promise<Array>} Lista de actividades del cronograma
   */
  async getCronogramaPorAula(idAula) {
    try {
      console.log('📤 Obteniendo cronograma para aula:', idAula);
      
      const response = await api.get(`/cronograma/aula/${idAula}`);
      console.log('📥 Respuesta cronograma por aula:', response.data);
      
      // La respuesta tiene la estructura: { success: true, message: "...", cronogramas: [...] }
      if (response.data?.success && response.data?.cronogramas) {
        console.log('✅ Cronogramas encontrados:', response.data.cronogramas);
        return response.data.cronogramas;
      }
      
      // Extraer datos según otras estructuras posibles
      if (response.data?.success && response.data?.data) {
        return response.data.data;
      }
      
      if (response.data?.info?.data) {
        return response.data.info.data;
      }
      
      if (response.data?.data) {
        return response.data.data;
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      console.log('⚠️ No se encontraron actividades en la respuesta');
      return [];
    } catch (error) {
      console.error('Error al obtener cronograma por aula:', error);
      
      // En desarrollo, devolver datos mock si el backend no está disponible
      if (process.env.NODE_ENV === 'development' && error.code === 'ERR_NETWORK') {
        console.log('🔧 Backend no disponible, usando datos mock para cronograma');
        return [
          {
            id: '1',
            nombre_actividad: 'Matemáticas Básicas',
            descripcion: 'Clase de matemáticas básicas',
            fecha_inicio: '2024-12-15',
            fecha_fin: '2024-12-15',
            hora_inicio: '08:00',
            hora_fin: '09:30',
            id_aula: idAula,
            estado: 'activo'
          },
          {
            id: '2',
            nombre_actividad: 'Recreo',
            descripcion: 'Tiempo de recreo y descanso',
            fecha_inicio: '2024-12-15',
            fecha_fin: '2024-12-15',
            hora_inicio: '09:30',
            hora_fin: '10:00',
            id_aula: idAula,
            estado: 'activo'
          }
        ];
      }
      
      throw new Error(error.response?.data?.message || 'Error al obtener cronograma del aula');
    }
  }

  /**
   * Obtener cronograma completo de múltiples aulas
   * @param {Array<string>} idsAulas - Array de IDs de aulas
   * @returns {Promise<Array>} Lista combinada de actividades de todas las aulas
   */
  async getCronogramaMultiplesAulas(idsAulas) {
    try {
      console.log('📤 Obteniendo cronograma para múltiples aulas:', idsAulas);
      
      if (!Array.isArray(idsAulas) || idsAulas.length === 0) {
        console.log('⚠️ No se proporcionaron IDs de aulas válidos');
        return [];
      }

      // Obtener cronograma de cada aula en paralelo
      const promesas = idsAulas.map(idAula => this.getCronogramaPorAula(idAula));
      const resultados = await Promise.allSettled(promesas);
      
      // Combinar todos los cronogramas exitosos
      const cronogramaCompleto = [];
      
      resultados.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled') {
          const cronogramaAula = resultado.value;
          if (Array.isArray(cronogramaAula)) {
            cronogramaCompleto.push(...cronogramaAula);
          }
        } else {
          console.error(`❌ Error al obtener cronograma del aula ${idsAulas[index]}:`, resultado.reason);
        }
      });
      
      console.log(`✅ Cronograma completo obtenido: ${cronogramaCompleto.length} actividades de ${idsAulas.length} aulas`);
      return cronogramaCompleto;
      
    } catch (error) {
      console.error('Error al obtener cronograma de múltiples aulas:', error);
      throw new Error('Error al obtener cronograma completo');
    }
  }

  /**
   * Crear nueva actividad en el cronograma
   * @param {Object} actividadData - Datos de la nueva actividad
   * @returns {Promise<Object>} Actividad creada
   */
  async crearActividad(actividadData) {
    try {
      console.log('📤 Creando nueva actividad:', actividadData);
      
      const response = await api.post('/cronograma', actividadData);
      console.log('📥 Actividad creada:', response.data);
      
      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al crear actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al crear actividad');
    }
  }

  /**
   * Actualizar actividad existente
   * @param {string} id - ID de la actividad
   * @param {Object} actividadData - Datos actualizados
   * @returns {Promise<Object>} Actividad actualizada
   */
  async actualizarActividad(id, actividadData) {
    try {
      console.log('📤 Actualizando actividad:', id, actividadData);
      
      const response = await api.put(`/cronograma/${id}`, actividadData);
      console.log('📥 Actividad actualizada:', response.data);
      
      return response.data?.info?.data || response.data?.data || response.data;
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar actividad');
    }
  }

  /**
   * Eliminar actividad
   * @param {string} id - ID de la actividad
   * @returns {Promise<boolean>} Resultado de la eliminación
   */
  async eliminarActividad(id) {
    try {
      console.log('📤 Eliminando actividad:', id);
      
      const response = await api.delete(`/cronograma/${id}`);
      console.log('📥 Actividad eliminada:', response.data);
      
      return true;
    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar actividad');
    }
  }
}

// Exportar instancia única del servicio
const cronogramaService = new CronogramaService();
export default cronogramaService;
