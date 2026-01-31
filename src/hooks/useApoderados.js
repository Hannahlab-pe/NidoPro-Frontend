// src/hooks/useApoderados.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import apoderadoService from '../services/apoderadoService';

/**
 * Hook personalizado para gestionar apoderados
 * Proporciona todas las funcionalidades CRUD y gestión de estado
 */
export const useApoderados = () => {
  // Estados principales
  const [apoderados, setApoderados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para operaciones específicas
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para filtros y paginación
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
    limit: 10
  });

  // Estados para estadísticas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  // Manejo de errores centralizado
  const handleError = useCallback((error, action) => {
    console.error(`Error al ${action}:`, error);
    const message = error.response?.data?.message || error.message || `Error al ${action}`;
    toast.error(message);
  }, []);

  /**
   * Obtener lista de apoderados
   */
  const fetchApoderados = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apoderadoService.getApoderados(filters);
      
      // Extraer datos según la estructura de respuesta del backend
      const apoderadosData = response.info?.data || [];
      setApoderados(Array.isArray(apoderadosData) ? apoderadosData : []);
      
      
      // Log después de setApoderados para ver si se actualiza
      setTimeout(() => {
      }, 100);
      
      // Actualizar estadísticas si están disponibles
      if (response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      handleError(error, 'cargar apoderados');
      setApoderados([]);
    } finally {
      setLoading(false);
    }
  }, [filters, handleError]);

  /**
   * Crear un nuevo apoderado
   */
  const createApoderado = useCallback(async (apoderadoData) => {
    setCreating(true);
    
    // Toast de carga
    const loadingToast = toast.loading('Creando apoderado...', {
      description: 'Guardando información del apoderado...'
    });
    
    try {
      console.log('🔄 Iniciando creación de apoderado...');
      
      // Crear apoderado en el backend
      console.log('💾 Guardando apoderado en el backend...');
      const newApoderado = await apoderadoService.createApoderado(apoderadoData);
      
      // Actualizar lista local
      setApoderados(prevApoderados => {
        const currentApoderados = Array.isArray(prevApoderados) ? prevApoderados : [];
        return [newApoderado.data || newApoderado, ...currentApoderados];
      });
      
      // Toast de éxito
      const apoderadoInfo = newApoderado.data || newApoderado;
      toast.success('¡Apoderado creado exitosamente!', {
        id: loadingToast,
        description: `${apoderadoInfo.nombre} ${apoderadoInfo.apellido} ha sido registrado`
      });
      
      return newApoderado;
      
    } catch (error) {
      toast.error('Error al crear apoderado', {
        id: loadingToast,
        description: error.message
      });
      throw error;
    } finally {
      setCreating(false);
    }
  }, []);

  /**
   * Actualizar información de un apoderado
   * NOTA: Esta función está deshabilitada porque no existe el endpoint en el backend
   */
  const updateApoderado = useCallback(async (apoderadoId, apoderadoData) => {
    console.warn('⚠️ updateApoderado está deshabilitado - no existe endpoint PATCH en backend');
    throw new Error('La funcionalidad de actualización no está disponible - no existe endpoint en backend');
  }, []);

  /**
   * Eliminar un apoderado
   */
  const deleteApoderado = useCallback(async (apoderadoId) => {
    setDeleting(true);
    
    // Toast de carga
    const loadingToast = toast.loading('Eliminando apoderado...', {
      description: 'Procesando eliminación...'
    });
    
    try {
      console.log('🗑️ Eliminando apoderado:', apoderadoId);
      
      await apoderadoService.deleteApoderado(apoderadoId);
      
      // Actualizar lista local
      setApoderados(prevApoderados => 
        prevApoderados.filter(apoderado => apoderado.idApoderado !== apoderadoId)
      );
      
      // Toast de éxito
      toast.success('¡Apoderado eliminado exitosamente!', {
        id: loadingToast,
        description: 'El apoderado ha sido eliminado del sistema'
      });
      
    } catch (error) {
      toast.error('Error al eliminar apoderado', {
        id: loadingToast,
        description: error.message
      });
      throw error;
    } finally {
      setDeleting(false);
    }
  }, []);

  /**
   * Cambiar estado de un apoderado (activar/desactivar)
   */
  const toggleApoderadoStatus = useCallback(async (apoderadoId) => {
    // Toast de carga
    const loadingToast = toast.loading('Cambiando estado...', {
      description: 'Actualizando estado del apoderado...'
    });
    
    try {
      console.log('🔄 Cambiando estado del apoderado:', apoderadoId);
      
      const updatedApoderado = await apoderadoService.toggleApoderadoStatus(apoderadoId);
      
      // Actualizar lista local
      setApoderados(prevApoderados => 
        prevApoderados.map(apoderado => 
          apoderado.idApoderado === apoderadoId ? (updatedApoderado.data || updatedApoderado) : apoderado
        )
      );
      
      // Toast de éxito
      const apoderadoInfo = updatedApoderado.data || updatedApoderado;
      const newStatus = apoderadoInfo.estaActivo ? 'activado' : 'desactivado';
      toast.success(`¡Apoderado ${newStatus} exitosamente!`, {
        id: loadingToast,
        description: `${apoderadoInfo.nombre} ${apoderadoInfo.apellido} ha sido ${newStatus}`
      });
      
      return updatedApoderado;
      
    } catch (error) {
      toast.error('Error al cambiar estado', {
        id: loadingToast,
        description: error.message
      });
      throw error;
    }
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      page: 1,
      limit: 10
    });
  }, []);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    fetchApoderados();
  }, [fetchApoderados]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchApoderados();
  }, [fetchApoderados]);

  // Funciones de utilidad para estadísticas
  const getActiveApoderados = useCallback(() => {
    // Todos los apoderados se consideran activos por defecto ya que no hay campo de estado
    return apoderados.length;
  }, [apoderados]);

  const getInactiveApoderados = useCallback(() => {
    // No hay campo de estado inactivo en el backend
    return 0;
  }, [apoderados]);

  const getTotalApoderados = useCallback(() => {
    return apoderados.length;
  }, [apoderados]);

  // Funciones de búsqueda y filtrado
  const searchApoderados = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const filterByStatus = useCallback((status) => {
    updateFilters({ status });
  }, [updateFilters]);

  return {
    // Estados
    apoderados,
    loading,
    creating,
    updating,
    deleting,
    filters,
    stats: {
      total: getTotalApoderados(),
      active: getActiveApoderados(),
      inactive: getInactiveApoderados()
    },

    // Acciones CRUD
    createApoderado,
    updateApoderado,
    deleteApoderado,
    toggleApoderadoStatus,

    // Funciones de utilidad
    fetchApoderados,
    refresh,
    updateFilters,
    clearFilters,
    searchApoderados,
    filterByStatus,

    // Funciones de estadísticas
    getActiveApoderados,
    getInactiveApoderados,
    getTotalApoderados
  };
};

export default useApoderados;
