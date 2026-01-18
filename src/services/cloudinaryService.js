/**
 * Servicio para Cloudinary - Subida de imágenes de estudiantes
 */

// Configuración desde variables de entorno
const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY
};

// Validar configuración
const validateConfig = () => {
  if (!CLOUDINARY_CONFIG.cloudName) {
    throw new Error('VITE_CLOUDINARY_CLOUD_NAME no está configurado');
  }
  if (!CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error('VITE_CLOUDINARY_UPLOAD_PRESET no está configurado');
  }
};

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

/**
 * Sube una imagen a Cloudinary para diferentes tipos de usuarios
 * @param {File} file - Archivo de imagen a subir
 * @param {string} userType - Tipo de usuario ('estudiantes', 'profesores', 'padres', 'usuarios')
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Resultado del upload
 */
const uploadUserImage = async (file, userType = 'usuarios', options = {}) => {
  console.log(`🚀 Iniciando upload de imagen de ${userType}...`);
  
  // Validar configuración
  validateConfig();
  
  if (!file) {
    throw new Error('No se proporcionó archivo');
  }

  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen');
  }

  // Validar tamaño (máximo 5MB)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error(`Archivo muy grande. Máximo ${MAX_SIZE / (1024 * 1024)}MB permitido`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  
  // Configuraciones adicionales por tipo de usuario
  formData.append('folder', userType);
  formData.append('resource_type', 'image');

  console.log('📤 Enviando imagen a Cloudinary...', {
    cloudName: CLOUDINARY_CONFIG.cloudName,
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
    userType,
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(2)} KB`,
    url: UPLOAD_URL
  });

  try {
    const response = await fetch(UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    console.log('📨 Respuesta recibida:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Cloudinary:', errorData);
      throw new Error(errorData.error?.message || `Error HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Upload exitoso!', {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height
    });
    
    // Generar URLs optimizadas manualmente
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes,
      // URL optimizada para mostrar en tabla
      thumbnailUrl: `${baseUrl}/c_fill,w_100,h_100,q_auto,f_auto/${data.public_id}`,
      // URL para vista detallada
      detailUrl: `${baseUrl}/c_fill,w_400,h_400,q_auto,f_auto/${data.public_id}`
    };
  } catch (error) {
    console.error('💥 Error uploading imagen:', error);
    
    // Personalizar mensaje de error
    if (error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu internet e intenta nuevamente.');
    }
    
    throw error;
  }
};

// Mantener compatibilidad hacia atrás
const uploadStudentImage = (file, options = {}) => uploadUserImage(file, 'estudiantes', options);
const uploadTeacherImage = (file, options = {}) => uploadUserImage(file, 'profesores', options);
const uploadParentImage = (file, options = {}) => uploadUserImage(file, 'padres', options);

/**
 * Sube voucher de pago a Cloudinary
 * @param {File} file - Archivo de voucher a subir
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Resultado del upload
 */
const uploadVoucherImage = (file, options = {}) => uploadUserImage(file, 'vouchers', options);

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen en Cloudinary
 * @returns {Promise<Object>} Resultado de la eliminación
 */
const deleteStudentImage = async (publicId) => {
  console.log('🗑️ Eliminando imagen de Cloudinary...', publicId);
  
  // Validar configuración
  validateConfig();
  
  if (!publicId) {
    throw new Error('Public ID es requerido para eliminar imagen');
  }

  // Para eliminación necesitamos usar la API con autenticación
  // Por ahora solo registraremos la intención
  console.log('⚠️ Eliminación de imagen registrada:', publicId);
  
  return {
    success: true,
    message: 'Imagen marcada para eliminación',
    publicId
  };
};

/**
 * Obtiene información de una imagen
 * @param {string} publicId - ID público de la imagen
 * @returns {Object} URLs optimizadas para diferentes usos
 */
const getImageUrls = (publicId) => {
  if (!publicId) return null;
  
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  
  return {
    original: `${baseUrl}/${publicId}`,
    thumbnail: `${baseUrl}/c_fill,w_100,h_100,q_auto,f_auto/${publicId}`,
    small: `${baseUrl}/c_fill,w_200,h_200,q_auto,f_auto/${publicId}`,
    medium: `${baseUrl}/c_fill,w_400,h_400,q_auto,f_auto/${publicId}`,
    large: `${baseUrl}/c_fill,w_800,h_800,q_auto,f_auto/${publicId}`
  };
};

// Exports
export { 
  uploadUserImage,
  uploadStudentImage,
  uploadTeacherImage,
  uploadParentImage,
  uploadVoucherImage,
  deleteStudentImage,
  getImageUrls,
  CLOUDINARY_CONFIG
};
