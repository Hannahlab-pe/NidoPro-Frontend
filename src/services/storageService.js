// src/services/storageService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const STORAGE_URL = `${API_BASE_URL}/storage`;

const api = axios.create({
  baseURL: STORAGE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Interceptor para agregar token
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

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio para manejar la subida y gestión de archivos con Google Cloud Storage
 */
export class StorageService {
  /**
   * Sube un archivo a Google Cloud Storage
   * @param {File} file - El archivo a subir
   * @param {string} folder - La carpeta donde se guardará el archivo (ej: 'tareas', 'vouchers', 'planificaciones', 'estudiantes', 'trabajadores', 'informes')
   * @param {string} userId - ID del usuario para organizar los archivos (opcional)
   * @returns {Promise<Object>} - Información del archivo subido (url, fileName, mimeType, size, folder)
   */
  static async uploadFile(file, folder = 'general', userId = 'anonymous') {
    try {
      // Si userId es null, undefined o vacío, usar 'anonymous'
      const safeUserId = userId && userId.trim() ? userId : 'anonymous';

      console.log('📤 Iniciando subida a Google Cloud Storage:', {
        originalName: file.name,
        folder: folder,
        userId: safeUserId,
        size: file.size,
        type: file.type
      });

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      if (safeUserId !== 'anonymous') {
        formData.append('userId', safeUserId);
      }

      // Subir el archivo
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Archivo subido exitosamente:', response.data);

      // Extraer datos de la respuesta del backend
      const fileData = response.data?.data || response.data;

      return {
        url: fileData.url,
        fileName: fileData.fileName,
        mimeType: fileData.mimeType || file.type,
        size: fileData.size || file.size,
        folder: fileData.folder || folder,
        originalName: file.name
      };

    } catch (error) {
      console.error('❌ Error al subir archivo:', error);
      throw new Error(error.response?.data?.message || `Error al subir el archivo: ${error.message}`);
    }
  }

  /**
   * Sube múltiples archivos a Google Cloud Storage
   * @param {FileList|Array} files - Los archivos a subir (máximo 10)
   * @param {string} folder - La carpeta donde se guardarán los archivos
   * @param {string} userId - ID del usuario (opcional)
   * @returns {Promise<Object>} - Objeto con urls, count y files
   */
  static async uploadMultipleFiles(files, folder = 'general', userId = 'anonymous') {
    try {
      const filesArray = Array.from(files);

      if (filesArray.length > 10) {
        throw new Error('Máximo 10 archivos permitidos por subida');
      }

      const safeUserId = userId && userId.trim() ? userId : 'anonymous';

      console.log(`📤 Subiendo ${filesArray.length} archivos a Google Cloud Storage...`);

      // Crear FormData con múltiples archivos
      const formData = new FormData();
      filesArray.forEach(file => {
        formData.append('files', file);
      });
      formData.append('folder', folder);
      if (safeUserId !== 'anonymous') {
        formData.append('userId', safeUserId);
      }

      const response = await api.post('/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`✅ ${filesArray.length} archivos subidos exitosamente`);

      const responseData = response.data?.data || response.data;

      // Mapear la respuesta al formato esperado
      return {
        urls: responseData.urls || [],
        count: responseData.count || filesArray.length,
        files: (responseData.files || []).map((fileData, index) => ({
          url: fileData.url,
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          size: fileData.size,
          originalName: filesArray[index]?.name
        }))
      };

    } catch (error) {
      console.error('❌ Error al subir múltiples archivos:', error);
      throw new Error(error.response?.data?.message || `Error al subir los archivos: ${error.message}`);
    }
  }

  /**
   * Elimina un archivo de Google Cloud Storage
   * @param {string} fileUrl - La URL pública del archivo a eliminar
   * @returns {Promise<Object>}
   */
  static async deleteFile(fileUrl) {
    try {
      console.log('🗑️ Eliminando archivo:', fileUrl);

      const response = await api.delete('/delete', {
        data: { fileUrl },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Archivo eliminado exitosamente');

      return response.data;

    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      throw new Error(error.response?.data?.message || `Error al eliminar el archivo: ${error.message}`);
    }
  }

  /**
   * Obtiene una URL firmada temporal para acceder al archivo
   * @param {string} fileUrl - La URL pública del archivo
   * @param {number} expiresInMinutes - Tiempo de expiración en minutos (default: 60)
   * @returns {Promise<Object>} - Objeto con signedUrl, expiresInMinutes y originalUrl
   */
  static async getSignedUrl(fileUrl, expiresInMinutes = 60) {
    try {
      console.log('🔐 Obteniendo URL firmada para:', fileUrl);

      const response = await api.get('/signed-url', {
        params: { fileUrl, expiresInMinutes }
      });

      const data = response.data?.data || response.data;

      console.log('✅ URL firmada generada exitosamente');

      return {
        signedUrl: data.signedUrl,
        expiresInMinutes: data.expiresInMinutes,
        originalUrl: data.originalUrl
      };

    } catch (error) {
      console.error('❌ Error al obtener URL firmada:', error);
      throw new Error(error.response?.data?.message || `Error al obtener URL firmada: ${error.message}`);
    }
  }

  /**
   * Verifica si un archivo existe
   * @param {string} fileUrl - La URL pública del archivo
   * @returns {Promise<Object>} - Objeto con exists y fileUrl
   */
  static async fileExists(fileUrl) {
    try {
      const response = await api.get('/exists', {
        params: { fileUrl }
      });

      const data = response.data?.data || response.data;

      return {
        exists: data.exists || false,
        fileUrl: data.fileUrl
      };

    } catch (error) {
      console.error('❌ Error al verificar existencia del archivo:', error);
      return { exists: false, fileUrl };
    }
  }

  /**
   * Lista archivos en una carpeta específica
   * @param {string} folder - Nombre de la carpeta (ej: 'tareas', 'planificaciones')
   * @returns {Promise<Object>} - Objeto con folder, count y files (array de URLs)
   */
  static async listFiles(folder) {
    try {
      console.log('📂 Listando archivos en carpeta:', folder);

      const response = await api.get(`/list/${folder}`);

      const data = response.data?.data || response.data;

      console.log(`✅ ${data.count || data.files?.length || 0} archivos encontrados`);

      return {
        folder: data.folder || folder,
        count: data.count || data.files?.length || 0,
        files: data.files || []
      };

    } catch (error) {
      console.error('❌ Error al listar archivos:', error);
      throw new Error(error.response?.data?.message || `Error al listar archivos: ${error.message}`);
    }
  }

  /**
   * Lista todos los archivos de todas las carpetas
   * @returns {Promise<Object>} - Objeto con count y files (array de URLs)
   */
  static async listAllFiles() {
    try {
      console.log('📂 Listando todos los archivos...');

      const response = await api.get('/list');

      const data = response.data?.data || response.data;

      console.log(`✅ ${data.count || data.files?.length || 0} archivos encontrados`);

      return {
        count: data.count || data.files?.length || 0,
        files: data.files || []
      };

    } catch (error) {
      console.error('❌ Error al listar archivos:', error);
      throw new Error(error.response?.data?.message || `Error al listar archivos: ${error.message}`);
    }
  }

  /**
   * Valida el tipo de archivo
   * @param {File} file - Archivo a validar
   * @param {Array} allowedTypes - Tipos MIME permitidos
   * @returns {boolean}
   */
  static validateFileType(file, allowedTypes = null) {
    if (!allowedTypes) {
      // Tipos por defecto permitidos
      allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
      ];
    }

    return allowedTypes.includes(file.type);
  }

  /**
   * Valida el tamaño del archivo
   * @param {File} file - Archivo a validar
   * @param {number} maxSizeMB - Tamaño máximo en MB
   * @returns {boolean}
   */
  static validateFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Obtiene información del archivo
   * @param {File} file - Archivo
   * @returns {Object}
   */
  static getFileInfo(file) {
    return {
      name: file.name,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      type: file.type,
      lastModified: new Date(file.lastModified)
    };
  }

  /**
   * Formatea el tamaño del archivo
   * @param {number} bytes - Tamaño en bytes
   * @returns {string}
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default StorageService;
