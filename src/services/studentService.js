// src/services/studentService.js
import axios from 'axios';

// Base URL del API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
 * Servicio para gestionar estudiantes
 */
export const studentService = {
  /**
   * Obtener todos los estudiantes
   * @param {Object} filters - Filtros opcionales (grade, status, etc.)
   * @returns {Promise<Array>} Lista de estudiantes
   */
  async getAllStudents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/students?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiantes');
    }
  },

  /**
   * Obtener un estudiante por ID
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<Object>} Datos del estudiante
   */
  async getStudentById(id) {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiante');
    }
  },

  /**
   * Crear un nuevo estudiante
   * @param {Object} studentData - Datos del estudiante
   * @returns {Promise<Object>} Estudiante creado
   */
  async createStudent(studentData) {
    try {
      console.log('📤 Enviando datos del estudiante al backend:', studentData);
      
      // Validar datos requeridos
      const requiredFields = ['name', 'age', 'grade', 'parent', 'phone', 'email', 'address'];
      const missingFields = requiredFields.filter(field => !studentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos para el backend
      const payload = {
        // Información personal
        name: studentData.name.trim(),
        age: parseInt(studentData.age),
        grade: studentData.grade,
        birthDate: studentData.birthDate || null,
        dni: studentData.dni || null,
        
        // Información del padre/madre
        parent: studentData.parent.trim(),
        phone: studentData.phone.trim(),
        email: studentData.email.trim(),
        address: studentData.address.trim(),
        
        // Contacto de emergencia
        emergencyContact: studentData.emergencyContact || null,
        emergencyPhone: studentData.emergencyPhone || null,
        
        // Información médica
        allergies: studentData.allergies || null,
        medicalNotes: studentData.medicalNotes || null,
        
        // Foto
        photo: studentData.photo || null,
        
        // Campos adicionales
        status: 'active',
        attendance: 100,
        average: 0
      };

      const response = await api.post('/students', payload);
      console.log('✅ Estudiante creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al crear estudiante');
    }
  },

  /**
   * Actualizar un estudiante existente
   * @param {string|number} id - ID del estudiante
   * @param {Object} studentData - Datos actualizados del estudiante
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async updateStudent(id, studentData) {
    try {
      console.log('📤 Actualizando estudiante:', id, studentData);
      
      // Preparar datos para el backend (similar a createStudent)
      const payload = {
        name: studentData.name?.trim(),
        age: studentData.age ? parseInt(studentData.age) : undefined,
        grade: studentData.grade,
        birthDate: studentData.birthDate,
        dni: studentData.dni,
        parent: studentData.parent?.trim(),
        phone: studentData.phone?.trim(),
        email: studentData.email?.trim(),
        address: studentData.address?.trim(),
        emergencyContact: studentData.emergencyContact,
        emergencyPhone: studentData.emergencyPhone,
        allergies: studentData.allergies,
        medicalNotes: studentData.medicalNotes,
        photo: studentData.photo,
        status: studentData.status
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put(`/students/${id}`, payload);
      console.log('✅ Estudiante actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar estudiante');
    }
  },

  /**
   * Eliminar un estudiante
   * @param {string|number} id - ID del estudiante
   * @returns {Promise<void>}
   */
  async deleteStudent(id) {
    try {
      console.log('🗑️ Eliminando estudiante:', id);
      await api.delete(`/students/${id}`);
      console.log('✅ Estudiante eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar estudiante');
    }
  },

  /**
   * Cambiar el estado de un estudiante (activo/inactivo)
   * @param {string|number} id - ID del estudiante
   * @param {string} status - Nuevo estado ('active' | 'inactive')
   * @returns {Promise<Object>} Estudiante actualizado
   */
  async changeStudentStatus(id, status) {
    try {
      console.log('🔄 Cambiando estado del estudiante:', id, status);
      const response = await api.patch(`/students/${id}/status`, { status });
      console.log('✅ Estado cambiado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar estado del estudiante:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del estudiante');
    }
  },

  /**
   * Obtener estudiantes por grado
   * @param {string} grade - Grado a filtrar
   * @returns {Promise<Array>} Lista de estudiantes del grado
   */
  async getStudentsByGrade(grade) {
    try {
      const response = await api.get(`/students/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes por grado:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estudiantes por grado');
    }
  },

  /**
   * Buscar estudiantes por nombre
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de estudiantes que coinciden
   */
  async searchStudents(query) {
    try {
      const response = await api.get(`/students/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar estudiantes:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar estudiantes');
    }
  },

  /**
   * Obtener estadísticas de estudiantes
   * @returns {Promise<Object>} Estadísticas de estudiantes
   */
  async getStudentStats() {
    try {
      const response = await api.get('/students/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
};

export default studentService;
