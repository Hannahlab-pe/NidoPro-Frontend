// src/hooks/useCrearTarea.js
import { useState } from 'react';
import { toast } from 'sonner';
import { tareaService } from '../services/tareaService';
import { aulaService } from '../services/aulaService';
import { getIdTrabajadorFromToken } from '../utils/tokenUtils';
import { useAuthStore } from '../store/useAuthStore';
import { StorageService } from '../services/storageService';

/**
 * Hook personalizado para crear tareas con subida de archivos a Firebase Storage
 */
export const useCrearTarea = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aulas, setAulas] = useState([]);
  const [loadingAulas, setLoadingAulas] = useState(false);

  /**
   * Carga las aulas asignadas al trabajador
   */
  const cargarAulas = async () => {
    try {
      setLoadingAulas(true);
      console.log('🔍 [HOOK CREAR TAREA] Cargando aulas asignadas al trabajador...');

      // Usar la función específica para obtener el ID del trabajador del token
      const trabajadorId = getIdTrabajadorFromToken();
      console.log('👨‍🏫 [HOOK CREAR TAREA] ID Trabajador del token:', trabajadorId);
      
      // Fallback al store si no se encuentra en el token
      const fallbackId = user?.entidadId || localStorage.getItem('entidadId');
      console.log('� [HOOK CREAR TAREA] ID Fallback (store/localStorage):', fallbackId);
      
      const finalTrabajadorId = trabajadorId || fallbackId;
      console.log('🎯 [HOOK CREAR TAREA] ID final usado:', finalTrabajadorId);

      if (!finalTrabajadorId) {
        console.warn('⚠️ [HOOK CREAR TAREA] No se encontró ID del trabajador ni en token ni en store');
        setAulas([]);
        return;
      }

      const response = await aulaService.getAulasByTrabajador(finalTrabajadorId);
      console.log('📥 [HOOK CREAR TAREA] Respuesta del endpoint trabajador/aulas:', response);

      const aulasData = response?.aulas || response?.data || [];
      console.log('📚 [HOOK CREAR TAREA] Aulas asignadas obtenidas:', aulasData);

      setAulas(aulasData);
    } catch (error) {
      console.error('❌ [HOOK CREAR TAREA] Error al cargar aulas asignadas:', error);
      toast.error('Error al cargar las aulas asignadas');
      setAulas([]);
    } finally {
      setLoadingAulas(false);
    }
  };

  /**
   * Crea una nueva tarea con archivo opcional
   * @param {Object} tareaData - Datos de la tarea
   * @param {File} archivo - Archivo opcional a subir
   * @returns {Promise<Object>} - Resultado de la creación
   */
  const crearTarea = async (tareaData, archivo = null) => {
    try {
      setLoading(true);
      console.log('🚀 [HOOK CREAR TAREA] Iniciando creación de tarea...');

      // Obtener el ID del trabajador del token
      const idTrabajador = getIdTrabajadorFromToken();
      if (!idTrabajador) {
        throw new Error('No se pudo obtener el ID del trabajador del token');
      }

      console.log('👨‍🏫 [HOOK CREAR TAREA] ID Trabajador obtenido:', idTrabajador);

      let archivoUrl = null;

      // Subir archivo a Firebase Storage si hay un archivo
      if (archivo) {
        try {
          setUploadingFile(true);
          toast.info('Subiendo archivo a la nube...');

          const uploadResult = await StorageService.uploadFile(
            archivo,
            'tareas',
            idTrabajador
          );

          archivoUrl = uploadResult.url;
          toast.success('Archivo subido exitosamente');

          console.log('📁 [HOOK CREAR TAREA] Archivo subido:', uploadResult);

        } catch (error) {
          console.error('❌ [HOOK CREAR TAREA] Error al subir archivo:', error);
          toast.error('Error al subir archivo', {
            description: 'El archivo no se pudo subir. Inténtalo de nuevo.'
          });
          throw error;
        } finally {
          setUploadingFile(false);
        }
      }

      // Preparar datos para el backend según el endpoint especificado
      const payload = {
        titulo: tareaData.titulo.trim(),
        descripcion: tareaData.descripcion.trim(),
        fechaEntrega: tareaData.fechaEntrega,
        estado: 'pendiente',
        archivoUrl: archivoUrl, // URL del archivo subido a Firebase
        idAula: tareaData.idAula,
        idTrabajador: idTrabajador
      };

      console.log('📝 [HOOK CREAR TAREA] Datos a enviar:', payload);

      // Crear la tarea usando el servicio
      const response = await tareaService.createTarea(payload);

      console.log('✅ [HOOK CREAR TAREA] Tarea creada exitosamente:', response);
      toast.success('Tarea creada exitosamente');

      return response;

    } catch (error) {
      console.error('❌ [HOOK CREAR TAREA] Error al crear tarea:', error);

      // Si hay error y se subió un archivo, intentar eliminarlo de Firebase
      if (archivoUrl) {
        try {
          const urlParts = archivoUrl.split('/o/')[1]?.split('?')[0];
          if (urlParts) {
            const filePath = decodeURIComponent(urlParts);
            await StorageService.deleteFile(filePath);
            console.log('🗑️ [HOOK CREAR TAREA] Archivo eliminado por error en creación');
          }
        } catch (cleanupError) {
          console.error('❌ [HOOK CREAR TAREA] Error al limpiar archivo:', cleanupError);
        }
      }

      toast.error('Error al crear la tarea', {
        description: error.message || 'Ocurrió un error inesperado'
      });

      throw error;
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  /**
   * Valida los datos de la tarea
   * @param {Object} tareaData - Datos a validar
   * @returns {Object} - { isValid: boolean, errors: Object }
   */
  const validarTarea = (tareaData) => {
    const errors = {};

    if (!tareaData.titulo?.trim()) {
      errors.titulo = 'El título es obligatorio';
    }

    if (!tareaData.descripcion?.trim()) {
      errors.descripcion = 'La descripción es obligatoria';
    }

    if (!tareaData.fechaEntrega) {
      errors.fechaEntrega = 'La fecha de entrega es obligatoria';
    } else {
      const today = new Date();
      const entrega = new Date(tareaData.fechaEntrega);
      if (entrega <= today) {
        errors.fechaEntrega = 'La fecha de entrega debe ser futura';
      }
    }

    if (!tareaData.idAula) {
      errors.idAula = 'Debe seleccionar un aula';
    } else {
      const aulaExiste = aulas.find(aula =>
        aula.id_aula === tareaData.idAula || aula.idAula === tareaData.idAula
      );
      if (!aulaExiste) {
        errors.idAula = 'El aula seleccionada no es válida';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  return {
    // Estado
    loading,
    uploadingFile,
    aulas,
    loadingAulas,

    // Acciones
    cargarAulas,
    crearTarea,
    validarTarea
  };
};
