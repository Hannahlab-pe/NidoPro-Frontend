// src/services/api/matriculaService.js
import axios from 'axios';

// Base URL del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nidopro.up.railway.app/api/v1';


// Función auxiliar para obtener el ID del usuario del token y el estado de auth
const getUserDataFromAuth = () => {
  try {
    // Primero intentar obtener del localStorage donde está el estado de Zustand
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      const state = parsedAuth.state;
      
      if (state && state.user && state.user.entidadId) {
        console.log('📍 Datos de usuario obtenidos del estado de auth:', {
          userId: state.user.id,
          entidadId: state.user.entidadId,
          fullName: state.user.fullName
        });
        
        return {
          userId: state.user.id,
          entidadId: state.user.entidadId,
          fullName: state.user.fullName
        };
      }
    }
    
    // Fallback: intentar decodificar el token
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('🔍 Payload del token:', payload);
    
    return {
      userId: payload.sub || payload.id || payload.userId,
      entidadId: payload.entidadId,
      fullName: payload.fullName
    };
  } catch (error) {
    console.warn('⚠️ Error al obtener datos del usuario:', error);
    return null;
  }
};

// Función para generar número de comprobante
const generateComprobanteNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  
  return `MAT-${year}${month}${day}-${random}`;
};

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
    } else {
      console.log('⚠️ No se encontró token en localStorage');
    }
    console.log('📤 Request config:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data ? 'Data present' : 'No data'
    });
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
 * Servicio para gestionar matrícula de estudiantes
 */
export const matriculaService = {
  /**
   * Obtener todas las matrículas con información completa
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise<Object>} Lista de matrículas con estudiantes y apoderados
   */
  async getMatriculas(params = {}) {
    try {
      // Construir query string
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.grade) queryParams.append('grade', params.grade);
      if (params.status) queryParams.append('status', params.status);
      
      const queryString = queryParams.toString();
      // Usar el nuevo endpoint que incluye toda la información
      const url = queryString ? `/matricula/estudiantes-con-apoderados?${queryString}` : '/matricula/estudiantes-con-apoderados';
      
      const response = await api.get(url);
      
      // Verificar estructura de la respuesta
      if (response.data) {
        // Intentar extraer datos de diferentes estructuras posibles
        let matriculas = [];
        
        if (Array.isArray(response.data)) {
          matriculas = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          matriculas = response.data.data;
        } else if (response.data.info && Array.isArray(response.data.info)) {
          matriculas = response.data.info;
        } else if (response.data.info && response.data.info.data && Array.isArray(response.data.info.data)) {
          matriculas = response.data.info.data;
        } else if (response.data.matriculas && Array.isArray(response.data.matriculas)) {
          matriculas = response.data.matriculas;
        }
        
        // Devolver la estructura esperada por el hook
        const result = {
          data: matriculas,
          total: matriculas.length,
          success: true
        };
        
        return result;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener matrículas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener matrículas');
    }
  },

  /**
   * Obtener un estudiante por ID con contactos de emergencia completos
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<Object>} Datos del estudiante con contactos
   */
  async getStudentById(id) {
    try {
      console.log('📚 Obteniendo estudiante completo por ID:', id);
      const response = await api.get(`/estudiante/${id}`);
      console.log('✅ Estudiante obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiante');
    }
  },

  /**
   * Obtener matrícula completa por ID del estudiante
   * @param {string|number} estudianteId - ID del estudiante
   * @returns {Promise<Object>} Datos completos de la matrícula
   */
  async getMatriculaByEstudianteId(estudianteId) {
    try {
      console.log('📚 Obteniendo matrícula completa por ID de estudiante:', estudianteId);
      
      // Primero obtener todas las matrículas
      const response = await api.get('/matricula/estudiantes-con-apoderados');
      const matriculas = response.data?.info?.data || response.data?.data || response.data || [];
      
      // Encontrar la matrícula específica del estudiante
      const matricula = matriculas.find(m => 
        m.idEstudiante?.idEstudiante === estudianteId || 
        m.idEstudiante?.id === estudianteId
      );
      
      if (!matricula) {
        throw new Error('Matrícula no encontrada para este estudiante');
      }

      console.log('✅ Matrícula completa obtenida:', matricula);
      
      // Si no tiene contactos de emergencia, hacer llamada adicional
      if (!matricula.idEstudiante?.contactosEmergencia || matricula.idEstudiante.contactosEmergencia.length === 0) {
        console.log('📞 Contactos vacíos, obteniendo información completa del estudiante...');
        try {
          const estudianteCompleto = await this.getStudentById(estudianteId);
          if (estudianteCompleto.estudiante?.contactosEmergencia) {
            matricula.idEstudiante.contactosEmergencia = estudianteCompleto.estudiante.contactosEmergencia;
            console.log('✅ Contactos de emergencia agregados:', matricula.idEstudiante.contactosEmergencia);
          }
        } catch (contactError) {
          console.warn('⚠️ No se pudieron obtener contactos de emergencia:', contactError);
        }
      }
      
      return matricula;
    } catch (error) {
      console.error('❌ Error al obtener matrícula completa:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener matrícula completa');
    }
  },

  /**
   * Obtener matrícula por ID
   * @param {string|number} id - ID de la matrícula
   * @returns {Promise<Object>} Datos de la matrícula
   */
  async getMatriculaById(id) {
    try {
      console.log('📚 Obteniendo matrícula por ID:', id);
      const response = await api.get(`/matricula/${id}`);
      console.log('✅ Matrícula obtenida exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener matrícula:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener matrícula');
    }
  },

  /**
   * Crear nueva matrícula:
   * 1. POST /api/v1/matricula (crear matrícula)
   * El registro en caja simple se hace automáticamente en el backend
   * @param {Object} matriculaData - Datos de la matrícula
   * @returns {Promise<Object>} Matrícula creada
   */
  async createMatricula(matriculaData) {
    try {
      console.log('📤 Creando matrícula:', matriculaData);

      // Validar datos antes del envío
      if (!matriculaData.estudianteData) {
        throw new Error('Faltan datos del estudiante');
      }

      if (!matriculaData.apoderadoData) {
        throw new Error('Faltan datos del apoderado');
      }

      if (!matriculaData.estudianteData.contactosEmergencia || !Array.isArray(matriculaData.estudianteData.contactosEmergencia)) {
        throw new Error('Los contactos de emergencia son requeridos y deben ser un array');
      }

      if (matriculaData.estudianteData.contactosEmergencia.length === 0) {
        throw new Error('Debe proporcionar al menos un contacto de emergencia');
      }

      // Validar cada contacto
      matriculaData.estudianteData.contactosEmergencia.forEach((contacto, index) => {
        if (!contacto.nombre || !contacto.apellido || !contacto.telefono || !contacto.email) {
          throw new Error(`El contacto ${index + 1} debe tener nombre, apellido, teléfono y email`);
        }
      });

      console.log('📋 Datos finales a enviar al backend:', JSON.stringify(matriculaData, null, 2));

      // Crear la matrícula
      console.log('🌐 Creando matrícula en:', `${API_BASE_URL}/matricula`);

      const matriculaResponse = await api.post('/matricula', matriculaData);
      console.log('✅ Matrícula creada exitosamente:', matriculaResponse.data);

      return matriculaResponse.data;

    } catch (error) {
      console.error('❌ Error al crear matrícula:', error);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('❌ Detalles del error HTTP:', {
          status,
          data: errorData,
          url: error.config?.url
        });

        // Mensajes de error específicos
        let errorMessage = 'Error al crear matrícula';

        if (status === 400) {
          errorMessage = errorData?.message || 'Datos inválidos';
        } else if (status === 401) {
          errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente';
        } else if (status === 403) {
          errorMessage = 'No tiene permisos para realizar esta operación';
        } else if (status === 404) {
          errorMessage = 'Recurso no encontrado';
        } else if (status === 409) {
          errorMessage = errorData?.message || 'Conflicto al crear matrícula';
        } else if (status >= 500) {
          errorMessage = 'Error del servidor';
        }

        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('❌ Error de red:', error.request);
        throw new Error('Error de conexión. Verifique su conexión a internet');
      } else {
        console.error('❌ Error desconocido:', error.message);
        throw new Error(error.message || 'Error inesperado al crear la matrícula');
      }
    }
  },

  /**
   * Actualizar matrícula existente
   * @param {string|number} id - ID de la matrícula
   * @param {Object} matriculaData - Datos actualizados de la matrícula
   * @returns {Promise<Object>} Matrícula actualizada
   */
  async updateMatricula(id, matriculaData) {
    try {
      console.log('📤 Actualizando matrícula:', id, matriculaData);
      
      // Los datos ya vienen estructurados desde el modal
      const payload = {
        ...matriculaData,
        fechaActualizacion: new Date().toISOString()
      };

      console.log('📋 Payload final para backend:', payload);

      const response = await api.patch(`/matricula/${id}`, payload);
      console.log('✅ Matrícula actualizada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar matrícula:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar matrícula');
    }
  },

  /**
   * Actualizar información del estudiante
   * @param {string|number} id - ID del estudiante
   * @param {Object} estudianteData - Datos actualizados del estudiante
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async updateEstudiante(id, estudianteData) {
    try {
      const payload = {
        nombre: estudianteData.nombre?.trim(),
        apellido: estudianteData.apellido?.trim(),
        nroDocumento: estudianteData.nroDocumento?.trim(),
        tipoDocumento: estudianteData.tipoDocumento,
        contactoEmergencia: estudianteData.contactoEmergencia?.trim(),
        nroEmergencia: estudianteData.nroEmergencia?.trim(),
        observaciones: estudianteData.observaciones?.trim() || null
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('📤 Actualizando estudiante:', id, payload);

      const response = await api.patch(`/estudiante/${id}`, payload);
      console.log('✅ Estudiante actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar estudiante');
    }
  },

  /**
   * Actualizar información del apoderado
   * @param {string|number} id - ID del apoderado
   * @param {Object} apoderadoData - Datos actualizados del apoderado
   * @returns {Promise<Object>} Apoderado actualizado
   */
  async updateApoderado(id, apoderadoData) {
    try {
      const payload = {
        nombre: apoderadoData.nombre?.trim(),
        apellido: apoderadoData.apellido?.trim(),
        documentoIdentidad: apoderadoData.documentoIdentidad?.trim(),
        tipoDocumentoIdentidad: apoderadoData.tipoDocumentoIdentidad,
        numero: apoderadoData.numero?.trim(),
        correo: apoderadoData.correo?.trim(),
        direccion: apoderadoData.direccion?.trim()
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      console.log('📤 Actualizando apoderado:', id, payload);

      const response = await api.patch(`/apoderado/${id}`, payload);
      console.log('✅ Apoderado actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar apoderado');
    }
  },

  /**
   * Obtener lista de apoderados
   * @returns {Promise<Array>} Lista de apoderados
   */
  async getApoderados() {
    try {
      console.log('📤 Obteniendo lista de apoderados...');
      const response = await api.get('/apoderado');
      
      // Manejar diferentes estructuras de respuesta
      let apoderados = [];
      
      if (Array.isArray(response.data)) {
        apoderados = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        apoderados = response.data.data;
      } else if (response.data?.info && Array.isArray(response.data.info)) {
        apoderados = response.data.info;
      } else if (response.data?.info?.data && Array.isArray(response.data.info.data)) {
        apoderados = response.data.info.data;
      } else if (response.data?.apoderados && Array.isArray(response.data.apoderados)) {
        apoderados = response.data.apoderados;
      }

      console.log('✅ Apoderados obtenidos:', apoderados.length);
      return apoderados;
    } catch (error) {
      console.error('❌ Error al obtener apoderados:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener apoderados');
    }
  },

  /**
   * Obtener un apoderado por ID
   * @param {string|number} id - ID del apoderado
   * @returns {Promise<Object>} Datos del apoderado
   */
  async getApoderadoById(id) {
    try {
      const response = await api.get(`/apoderado/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener apoderado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener apoderado');
    }
  },

  /**
   * Buscar apoderados por término de búsqueda
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} Lista de apoderados que coinciden
   */
  async searchApoderados(searchTerm) {
    try {
      console.log('🔍 Buscando apoderados con término:', searchTerm);
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        console.log('⚠️ Término de búsqueda muy corto, devolviendo array vacío');
        return [];
      }

      // Obtener todos los apoderados primero
      const allApoderados = await this.getApoderados();
      
      // Filtrar localmente por nombre, apellido o documento
      const filteredApoderados = allApoderados.filter(apoderado => {
        const searchLower = searchTerm.toLowerCase().trim();
        const nombre = (apoderado.nombre || '').toLowerCase();
        const apellido = (apoderado.apellido || '').toLowerCase();
        const documento = (apoderado.documentoIdentidad || '').toLowerCase();
        const nombreCompleto = `${nombre} ${apellido}`.toLowerCase();
        
        return nombre.includes(searchLower) || 
               apellido.includes(searchLower) || 
               documento.includes(searchLower) ||
               nombreCompleto.includes(searchLower);
      });

      console.log(`✅ Encontrados ${filteredApoderados.length} apoderados que coinciden`);
      return filteredApoderados;
    } catch (error) {
      console.error('❌ Error al buscar apoderados:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar apoderados');
    }
  },

  /**
   * Eliminar matrícula
   * @param {string|number} id - ID de la matrícula
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async deleteMatricula(id) {
    try {
      console.log('🗑️ Eliminando matrícula:', id);
      const response = await api.delete(`/matricula/${id}`);
      console.log('✅ Matrícula eliminada exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar matrícula:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar matrícula');
    }
  },

  /**
   * Cambiar estado de matrícula
   * @param {string|number} id - ID de la matrícula
   * @returns {Promise<Object>} Matrícula con estado actualizado
   */
  async toggleMatriculaStatus(id) {
    try {
      console.log('🔄 Cambiando estado de matrícula:', id);
      const response = await api.patch(`/matricula/${id}/toggle-status`);
      console.log('✅ Estado de matrícula actualizado');
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar estado de matrícula:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado de matrícula');
    }
  },

  /**
   * Obtener estadísticas de matrícula
   * @returns {Promise<Object>} Estadísticas de matrícula
   */
  async getMatriculaStats() {
    try {
      console.log('📊 Obteniendo estadísticas de matrícula...');
      const response = await api.get('/matricula/stats');
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Actualizar contactos y datos del apoderado de una matrícula
   * @param {string} idMatricula - ID de la matrícula
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Matrícula actualizada
   */
  async actualizarContactosMatricula(idMatricula, updateData) {
    try {
      console.log('📤 Actualizando contactos de matrícula:', idMatricula);
      console.log('📋 Datos de actualización:', JSON.stringify(updateData, null, 2));

      const response = await api.patch(`/matricula/actualizar-contactos/${idMatricula}`, updateData);

      console.log('✅ Contactos de matrícula actualizados exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar contactos de matrícula:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar contactos de matrícula');
    }
  }
};

export default matriculaService;
