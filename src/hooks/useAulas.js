// src/hooks/useAulas.js
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useAulas,
  useCreateAula,
  useUpdateAula,
  useDeleteAula,
  useToggleAulaStatus,
  useEstudiantesByAula
} from './queries/useAulasQueries';

/**
 * Hook personalizado para gestionar aulas usando TanStack Query
 * Proporciona todas las funcionalidades CRUD y gestión de estado
 */
export const useAulasHook = () => {
  // Estado para filtros y búsqueda
  const [filters, setFilters] = useState({
    seccion: '',
    estado: '',
    search: ''
  });

  // TanStack Query hooks
  const { data: aulas = [], isLoading: loading, refetch: fetchAulas } = useAulas(filters);
  const createMutation = useCreateAula();
  const updateMutation = useUpdateAula();
  const deleteMutation = useDeleteAula();
  const toggleStatusMutation = useToggleAulaStatus();

  // Estados de operaciones
  const creating = createMutation.isPending;
  const updating = updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const uploading = creating || updating;

  /**
   * Crear una nueva aula
   */
  const createAula = useCallback(async (aulaData) => {
    return createMutation.mutateAsync(aulaData);
  }, [createMutation]);

  /**
   * Actualizar un aula existente
   */
  const updateAula = useCallback(async (id, aulaData) => {
    return updateMutation.mutateAsync({ id, ...aulaData });
  }, [updateMutation]);

  /**
   * Eliminar un aula
   */
  const deleteAula = useCallback(async (id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  /**
   * Cambiar estado de un aula
   */
  const changeAulaStatus = useCallback(async (id, estado) => {
    return toggleStatusMutation.mutateAsync({ id, estado });
  }, [toggleStatusMutation]);

  /**
   * Buscar aulas (actualizar filtros)
   */
  const searchAulas = useCallback(async (query) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  /**
   * Filtrar aulas por sección
   */
  const filterBySeccion = useCallback(async (seccion) => {
    setFilters(prev => ({ ...prev, seccion }));
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Resetear filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      seccion: '',
      estado: '',
      search: ''
    });
  }, []);

  /**
   * Refrescar lista de aulas
   */
  const refreshAulas = useCallback(() => {
    fetchAulas();
  }, [fetchAulas]);

  /**
   * Obtener un aula por ID
   */
  const getAulaById = useCallback(async (id) => {
    const aula = aulas.find(a => a.id === id || a.idAula === id);
    return aula;
  }, [aulas]);

  // Objeto de retorno del hook
  return {
    // Estados
    aulas,
    loading,
    creating,
    updating,
    deleting,
    uploading,
    filters,

    // Funciones CRUD
    createAula,
    updateAula,
    deleteAula,
    changeAulaStatus,
    
    // Funciones de búsqueda y filtrado
    searchAulas,
    filterBySeccion,
    updateFilters,
    resetFilters,
    
    // Funciones de utilidad
    fetchAulas,
    refreshAulas,
    getAulaById,

    // Funciones derivadas
    getActiveAulas: () => aulas.filter(a => a.estado === 'activa'),
    getInactiveAulas: () => aulas.filter(a => a.estado === 'inactiva'),
    getAulasBySeccion: (seccion) => aulas.filter(a => a.seccion === seccion),
    getTotalAulas: () => aulas.length,
    getTotalStudentsInAulas: () => aulas.reduce((total, aula) => total + (aula.cantidadEstudiantes || 0), 0),
    getAverageStudentsPerAula: () => {
      const total = aulas.reduce((sum, aula) => sum + (aula.cantidadEstudiantes || 0), 0);
      return aulas.length > 0 ? Math.round(total / aulas.length) : 0;
    },
    
    // Estados computados
    hasAulas: aulas.length > 0,
    isOperating: creating || updating || deleting || uploading,
    isCached: true, // TanStack Query maneja el cache automáticamente
  };
};

export default useAulasHook;

// Alias para compatibilidad con componentes que esperan useAulas
export { useAulasHook as useAulas };

/**
 * Hook simple para crear aula (para modales rápidos)
 */
export const useAulasSimple = () => {
  const queryClient = useQueryClient();

  const crearAula = async (data) => {
    try {
      // Usar fetch directamente para el endpoint simple
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      const response = await fetch(`${API_BASE_URL}/aula`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear aula');
      }

      const result = await response.json();

      // Invalidar caché para refrescar la lista
      queryClient.invalidateQueries(['aulas']);
      toast.success('Aula creada exitosamente');

      return result;
    } catch (error) {
      console.error('❌ Error al crear aula:', error);
      toast.error(error.message || 'Error al crear aula');
      throw error;
    }
  };

  return { crearAula };
};

/**
 * Hook personalizado para obtener aulas y estudiantes por aula para el módulo de pensiones
 */
export const useAulasParaPensiones = () => {
  // Obtener todas las aulas
  const { data: aulas = [], isLoading: loadingAulas } = useAulas();

  return {
    aulas,
    loadingAulas
  };
};

/**
 * Hook personalizado para obtener estudiantes de un aula específica para pensiones
 */
export const useEstudiantesAulaParaPensiones = (idAula) => {
  // Obtener estudiantes del aula
  const { data: estudiantes = [], isLoading: loadingEstudiantes } = useEstudiantesByAula(idAula);

  return {
    estudiantes,
    loadingEstudiantes
  };
};
