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
    console.error('Error en asistenciaService:', error);
    
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para gestión de asistencia de docentes
 */
export const asistenciaService = {
  /**
   * Obtener todas las asignaciones de aula
   * @returns {Promise} Lista de asignaciones con datos completos
   */
  getAllAsignaciones: async () => {
    try {
      const response = await api.get('/asignacion-aula');
      
      console.log('✅ Asignaciones obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener asignaciones:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener asignaciones de aula');
    }
  },

  /**
   * Obtener estudiantes de un aula específica
   * @param {string} idAula - ID del aula
   * @returns {Promise} Lista de estudiantes del aula
   */
  getEstudiantesAula: async (idAula) => {
    try {
      console.log('🔍 Obteniendo estudiantes del aula:', idAula);
      const response = await api.get(`/matricula-aula/estudiantes-aula/${idAula}`);
      
      console.log('✅ Estudiantes obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estudiantes del aula:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiantes del aula');
    }
  },

  /**
   * Registrar asistencia de un aula
   * @param {Object} asistenciaData - Datos de asistencia
   * @returns {Promise} Respuesta del servidor
   */
  registrarAsistencia: async (asistenciaData) => {
    try {
      console.log('📝 Registrando asistencia:', asistenciaData);
      const response = await api.post('/asistencia', asistenciaData);
      
      console.log('✅ Asistencia registrada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar asistencia:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar asistencia');
    }
  },

  /**
   * Filtrar asignaciones por docente usando el usuario del localStorage
   * @param {Array} asignaciones - Lista completa de asignaciones
   * @returns {Array} Asignaciones filtradas del docente actual
   */
  filtrarAsignacionesPorDocente: (asignaciones) => {
    try {
      // Obtener información del usuario del localStorage
      const authStorage = localStorage.getItem('auth-storage');
      if (!authStorage) {
        console.warn('⚠️ No hay información de usuario en localStorage');
        return [];
      }

      const authData = JSON.parse(authStorage);
      const usuario = authData?.state?.user;
      
      if (!usuario) {
        console.warn('⚠️ No hay datos de usuario en auth storage');
        return [];
      }

      console.log('👤 Usuario actual:', usuario);
      console.log('👤 Nombre completo:', usuario.fullName);
      console.log('👤 Email:', usuario.email);
      console.log('👤 ID:', usuario.id);

      // Filtrar asignaciones por el docente actual
      const asignacionesFiltradas = asignaciones.filter(asignacion => {
        const trabajador = asignacion.idTrabajador;
        
        console.log('🔍 Verificando asignación completa:', {
          asignacion,
          trabajador,
          usuarioActual: usuario
        });
        
        // Primero intentar por ID de usuario (más confiable)
        if (usuario.id && trabajador.id_Usuario_Tabla) {
          const coincideId = trabajador.id_Usuario_Tabla === usuario.id;
          console.log('🆔 Comparando IDs:', {
            usuarioId: usuario.id,
            trabajadorUsuarioId: trabajador.id_Usuario_Tabla,
            coincide: coincideId
          });
          if (coincideId) return true;
        }
        
        // Si no hay ID, intentar por email
        if (usuario.email && trabajador.correo) {
          const coincideEmail = trabajador.correo.toLowerCase() === usuario.email.toLowerCase();
          console.log('📧 Comparando emails:', {
            usuarioEmail: usuario.email,
            trabajadorEmail: trabajador.correo,
            coincide: coincideEmail
          });
          if (coincideEmail) return true;
        }
        
        // Como último recurso, por nombre completo
        if (usuario.fullName) {
          const nombreCompleto = `${trabajador.nombre} ${trabajador.apellido}`.toLowerCase();
          const coincideNombre = nombreCompleto === usuario.fullName.toLowerCase();
          console.log('👤 Comparando nombres:', {
            usuarioNombre: usuario.fullName,
            trabajadorNombre: nombreCompleto,
            coincide: coincideNombre
          });
          if (coincideNombre) return true;
        }

        return false;
      });

      console.log('✅ Asignaciones filtradas para el docente:', asignacionesFiltradas);
      return asignacionesFiltradas;
      
    } catch (error) {
      console.error('❌ Error al filtrar asignaciones por docente:', error);
      return [];
    }
  },

  /**
   * Registrar asistencia masiva para un aula completa
   * @param {Object} asistenciaData - Datos de asistencia masiva
   * @param {string} asistenciaData.fecha - Fecha en formato YYYY-MM-DD
   * @param {string} asistenciaData.hora - Hora en formato HH:mm:ss
   * @param {string} asistenciaData.idAula - ID del aula
   * @param {Array} asistenciaData.asistencias - Array de asistencias individuales
   * @returns {Promise} Respuesta del servidor
   */
  registrarAsistenciaMasiva: async (asistenciaData) => {
    try {
      const response = await api.post('/asistencia', asistenciaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al registrar asistencia masiva:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al registrar asistencia masiva');
    }
  },

  /**
   * Obtener asistencias por aula y fecha
   * @param {string} idAula - ID del aula
   * @param {string} fecha - Fecha en formato YYYY-MM-DD
   * @returns {Promise} Lista de asistencias del aula en la fecha especificada
   */
  getAsistenciasPorAulaYFecha: async (idAula, fecha) => {
    try {
      const response = await api.get(`/asistencia/aula/${idAula}`, {
        params: { fecha }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener asistencias por aula y fecha:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener asistencias');
    }
  },

  /**
   * Obtener historial de asistencias de un estudiante
   * @param {string} idEstudiante - ID del estudiante
   * @returns {Promise} Historial de asistencias del estudiante
   */
  getHistorialAsistenciasEstudiante: async (idEstudiante) => {
    try {
      console.log('🔍 [ASISTENCIA SERVICE] Iniciando llamada al endpoint');
      console.log('📝 [ASISTENCIA SERVICE] ID Estudiante recibido:', idEstudiante);
      console.log('🌐 [ASISTENCIA SERVICE] URL completa:', `${API_BASE_URL}/asistencia/estudiante/${idEstudiante}`);
      console.log('🔑 [ASISTENCIA SERVICE] Token en localStorage:', localStorage.getItem('token') ? 'EXISTE' : 'NO EXISTE');
      
      const response = await api.get(`/asistencia/estudiante/${idEstudiante}`);
      
      console.log('✅ [ASISTENCIA SERVICE] Respuesta exitosa del servidor:');
      console.log('📊 [ASISTENCIA SERVICE] Status:', response.status);
      console.log('📋 [ASISTENCIA SERVICE] Headers:', response.headers);
      console.log('💾 [ASISTENCIA SERVICE] Data completa:', response.data);
      console.log('📈 [ASISTENCIA SERVICE] Estructura de datos:', {
        hasInfo: !!response.data?.info,
        hasData: !!response.data?.info?.data,
        dataLength: response.data?.info?.data?.length || 0,
        totalRegistros: response.data?.info?.totalRegistros || 0
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ [ASISTENCIA SERVICE] Error completo:', error);
      console.error('❌ [ASISTENCIA SERVICE] Error response:', error.response);
      console.error('❌ [ASISTENCIA SERVICE] Error data:', error.response?.data);
      console.error('❌ [ASISTENCIA SERVICE] Error status:', error.response?.status);
      console.error('❌ [ASISTENCIA SERVICE] Error message:', error.message);
      throw new Error(error.response?.data?.message || 'Error al obtener historial de asistencias');
    }
  }
};

export default asistenciaService;
