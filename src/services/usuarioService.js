// src/services/api/usuarioService.js
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
 * Servicio para gestionar usuarios
 */
export const usuarioService = {
  /**
   * Obtener todos los usuarios
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de usuarios
   */
  async getAllUsuarios(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`/usuario?${params.toString()}`);
      console.log('📋 Respuesta del backend (usuarios):', response.data);
      
      // Extraer el array de usuarios de la respuesta
      // El backend puede tener un typo: "sucess" en lugar de "success"
      if ((response.data.success || response.data.sucess) && response.data.usuarios) {
        return response.data.usuarios;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
    }
  },

  /**
   * Obtener un usuario por ID
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async getUsuarioById(id) {
    try {
      const response = await api.get(`/usuario/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} usuarioData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async createUsuario(usuarioData) {
    try {
      console.log('📤 Enviando datos del usuario al backend:', usuarioData);
      
      // Validar datos requeridos según el backend
      const requiredFields = ['nombre', 'apellido', 'email', 'password', 'rol'];
      const missingFields = requiredFields.filter(field => !usuarioData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }

      // Preparar datos exactamente como espera el backend
      const payload = {
        nombre: usuarioData.nombre.trim(),
        apellido: usuarioData.apellido.trim(),
        email: usuarioData.email.trim(),
        password: usuarioData.password,
        rol: usuarioData.rol,
        telefono: usuarioData.telefono?.trim() || null,
        direccion: usuarioData.direccion?.trim() || null,
        estaActivo: usuarioData.estaActivo !== undefined ? usuarioData.estaActivo : true
      };

      const response = await api.post('/usuario', payload);
      console.log('✅ Usuario creado exitosamente:', response.data);
      
      // Extraer el usuario de la respuesta del backend
      if (response.data.usuario) {
        return response.data.usuario;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al crear usuario');
    }
  },

  /**
   * Actualizar un usuario existente
   * @param {string|number} id - ID del usuario
   * @param {Object} usuarioData - Datos actualizados del usuario
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUsuario(id, usuarioData) {
    try {
      console.log('📤 Actualizando usuario:', id, usuarioData);
      
      // Preparar datos para el backend
      const payload = {
        nombre: usuarioData.nombre?.trim(),
        apellido: usuarioData.apellido?.trim(),
        email: usuarioData.email?.trim(),
        telefono: usuarioData.telefono?.trim(),
        direccion: usuarioData.direccion?.trim(),
        rol: usuarioData.rol,
        estaActivo: usuarioData.estaActivo
      };

      // Solo incluir password si se está actualizando
      if (usuarioData.password && usuarioData.password.trim()) {
        payload.password = usuarioData.password;
      }

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put(`/usuario/${id}`, payload);
      console.log('✅ Usuario actualizado exitosamente:', response.data);
      
      // Extraer el usuario de la respuesta del backend
      if (response.data.usuario) {
        return response.data.usuario;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
    }
  },

  /**
   * Eliminar un usuario
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteUsuario(id) {
    try {
      console.log(`🗑️ Eliminando usuario ID: ${id}`);
      const response = await api.delete(`/usuario/${id}`);
      console.log('✅ Usuario eliminado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  },

  /**
   * Cambiar el estado de un usuario (activo/inactivo)
   * @param {string|number} id - ID del usuario
   * @param {boolean} estaActivo - Nuevo estado
   * @returns {Promise<Object>} Usuario actualizado
   */
  async toggleUsuarioStatus(id, estaActivo) {
    try {
      console.log(`🔄 Cambiando estado del usuario ID: ${id} a ${estaActivo ? 'activo' : 'inactivo'}`);
      const response = await api.patch(`/usuario/${id}/estado`, { estaActivo });
      console.log('✅ Estado del usuario actualizado:', response.data);
      
      // Si el endpoint no existe, usar update normal
      if (response.status === 404) {
        return this.updateUsuario(id, { estaActivo });
      }
      
      return response.data;
    } catch (error) {
      // Si el endpoint específico no existe, intentar con update normal
      if (error.response?.status === 404) {
        return this.updateUsuario(id, { estaActivo });
      }
      
      console.error('❌ Error al cambiar estado del usuario:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar estado del usuario');
    }
  },

  /**
   * Obtener usuarios por rol
   * @param {string} rol - Rol a filtrar
   * @returns {Promise<Array>} Lista de usuarios con ese rol
   */
  async getUsuariosByRol(rol) {
    try {
      const response = await api.get(`/usuario/rol/${encodeURIComponent(rol)}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios por rol:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener usuarios por rol');
    }
  },

  /**
   * Buscar usuarios por nombre, apellido o email
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de usuarios que coinciden
   */
  async searchUsuarios(query) {
    try {
      const response = await api.get(`/usuario/buscar?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw new Error(error.response?.data?.message || 'Error al buscar usuarios');
    }
  },

  /**
   * Cambiar contraseña de un usuario
   * @param {string|number} id - ID del usuario
   * @param {Object} passwordData - Datos de la contraseña
   * @returns {Promise<Object>} Resultado del cambio
   */
  async changePassword(id, passwordData) {
    try {
      console.log('🔐 Cambiando contraseña del usuario:', id);
      
      const payload = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await api.patch(`/usuario/${id}/password`, payload);
      console.log('✅ Contraseña cambiada exitosamente');
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  },

  /**
   * Obtener perfil del usuario actual
   * @returns {Promise<Object>} Datos del perfil
   */
  async getProfile() {
    try {
      const response = await api.get('/usuario/perfil');
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  },

  /**
   * Actualizar perfil del usuario actual
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} Perfil actualizado
   */
  async updateProfile(profileData) {
    try {
      console.log('📤 Actualizando perfil del usuario:', profileData);
      
      const payload = {
        nombre: profileData.nombre?.trim(),
        apellido: profileData.apellido?.trim(),
        email: profileData.email?.trim(),
        telefono: profileData.telefono?.trim(),
        direccion: profileData.direccion?.trim()
      };

      // Remover campos undefined
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put('/usuario/perfil', payload);
      console.log('✅ Perfil actualizado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      throw new Error(error.response?.data?.message || 'Error al actualizar perfil');
    }
  },

  /**
   * Obtener estadísticas de usuarios
   * @returns {Promise<Object>} Estadísticas de usuarios
   */
  async getUsuarioStats() {
    try {
      const response = await api.get('/usuario/estadisticas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Registrar último login de un usuario
   * @param {string|number} id - ID del usuario
   * @returns {Promise<Object>} Resultado del registro
   */
  async registerLogin(id) {
    try {
      const response = await api.patch(`/usuario/${id}/login`);
      return response.data;
    } catch (error) {
      console.error('Error al registrar login:', error);
      throw new Error(error.response?.data?.message || 'Error al registrar login');
    }
  },

  /**
   * Exportar usuarios a CSV
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo CSV
   */
  async exportUsuariosToCSV(filters = {}) {
    try {
      console.log('📤 Exportando usuarios a CSV...');
      const params = new URLSearchParams(filters);
      const response = await api.get(`/usuario/exportar/csv?${params.toString()}`, {
        responseType: 'blob'
      });
      console.log('✅ Exportación completada');
      return response.data;
    } catch (error) {
      console.error('❌ Error al exportar usuarios:', error);
      throw new Error(error.response?.data?.message || 'Error al exportar usuarios');
    }
  },

  /**
   * Importar usuarios desde CSV
   * @param {File} file - Archivo CSV
   * @returns {Promise<Object>} Resultado de la importación
   */
  async importUsuariosFromCSV(file) {
    try {
      console.log('📥 Importando usuarios desde CSV...');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/usuario/importar/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Importación completada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al importar usuarios:', error);
      throw new Error(error.response?.data?.message || 'Error al importar usuarios');
    }
  }
};

export default usuarioService;
