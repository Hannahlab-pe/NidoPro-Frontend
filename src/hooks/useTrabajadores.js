// src/hooks/useTrabajadores.js
import { useState, useCallback, useMemo } from 'react'; // <-- Agregar useMemo
import { 
  useTrabajadores as useTrabajadoresQuery,
  useCreateTrabajador,
  useUpdateTrabajador,
  useDeleteTrabajador,
  useToggleTrabajadorStatus,
  useInvalidateTrabajadores
} from './queries/useTrabajadoresQueries';

/**
 * Hook personalizado para gestionar trabajadores con TanStack Query
 * Proporciona todas las funcionalidades CRUD, gestión de estado y estadísticas
 */
export const useTrabajadores = (initialFilters = {}) => {
  // Estado para filtros y búsqueda
  const [filters, setFilters] = useState({
    tipoDocumento: '',
    estaActivo: '',
    search: '',
    ...initialFilters
  });

  // Queries y mutations de TanStack Query
  const { 
    data: trabajadores = [], 
    isLoading: loading, 
    error,
    refetch: refetchTrabajadores 
  } = useTrabajadoresQuery(filters);
  
  const createMutation = useCreateTrabajador();
  const updateMutation = useUpdateTrabajador();
  const deleteMutation = useDeleteTrabajador();
  const toggleStatusMutation = useToggleTrabajadorStatus();
  const { invalidateAll, invalidateLists } = useInvalidateTrabajadores();

  // --- Sección de Estadísticas ---
  /**
   * Calcular y memorizar estadísticas de los trabajadores
   */
  const statistics = useMemo(() => {
    if (!trabajadores || trabajadores.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byPosition: {},
        recentHires: 0
      };
    }

    const total = trabajadores.length;
    const active = trabajadores.filter(t => t.estaActivo === true).length;
    const inactive = trabajadores.filter(t => t.estaActivo === false || t.estaActivo === null || t.estaActivo === undefined).length;    // Agrupar por cargo/posición (asume una propiedad 'cargo' en el objeto trabajador)
    const byPosition = trabajadores.reduce((acc, trabajador) => {
      const position = trabajador.cargo?.nombre || 'Sin cargo';
      acc[position] = (acc[position] || 0) + 1;
      return acc;
    }, {});

    // Contrataciones recientes (último mes)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentHires = trabajadores.filter(t => 
      new Date(t.fechaContratacion) > oneMonthAgo
    ).length;

    return {
      total,
      active,
      inactive,
      byPosition,
      recentHires,
    };
  }, [trabajadores]);
  // --- Fin de la Sección de Estadísticas ---

  // Funciones CRUD usando mutations
  const createTrabajador = useCallback(async (trabajadorData) => {
    return createMutation.mutateAsync(trabajadorData);
  }, [createMutation]);

  const updateTrabajador = useCallback(async (id, trabajadorData) => {
    return updateMutation.mutateAsync({ id, data: trabajadorData });
  }, [updateMutation]);

  const deleteTrabajador = useCallback(async (id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const toggleTrabajadorStatus = useCallback(async (trabajador) => {
    console.log('🔄 Hook useTrabajadores - toggleTrabajadorStatus llamado con:', trabajador);
    return toggleStatusMutation.mutateAsync({ trabajador });
  }, [toggleStatusMutation]);  // Funciones de filtrado y búsqueda
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      tipoDocumento: '',
      estaActivo: '',
      search: ''
    });
  }, []);

  const searchTrabajadores = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const filterByTipoDocumento = useCallback((tipoDocumento) => {
    updateFilters({ tipoDocumento });
  }, [updateFilters]);

  const filterByEstado = useCallback((estaActivo) => {
    updateFilters({ estaActivo });
  }, [updateFilters]);

  // Estados derivados
  const creating = createMutation.isPending;
  const updating = updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const uploading = createMutation.isPending; // Considerar la creación como uploading cuando hay archivos
  
  // Funciones de utilidad
  const fetchTrabajadores = useCallback(async (customFilters = {}) => {
    if (Object.keys(customFilters).length > 0) {
      updateFilters(customFilters);
    } else {
      return refetchTrabajadores();
    }
  }, [refetchTrabajadores, updateFilters]);

  const refreshTrabajadores = useCallback(() => {
    return refetchTrabajadores();
  }, [refetchTrabajadores]);

  // Objeto de retorno del hook
  return {
    // Estados
    trabajadores,
    loading,
    creating,
    updating,
    deleting,
    uploading,
    filters,
    error,
    statistics, // <-- Agregar las estadísticas aquí

    // Funciones CRUD
    createTrabajador,
    updateTrabajador,
    deleteTrabajador,
    toggleTrabajadorStatus,
    
    // Funciones de búsqueda y filtrado
    searchTrabajadores,
    filterByTipoDocumento,
    filterByEstado,
    updateFilters,
    resetFilters,
    
    // Funciones de utilidad
    fetchTrabajadores,
    refreshTrabajadores,
    
    // Funciones de cache
    invalidateCache: invalidateAll,
    invalidateLists,
    
    // Funciones derivadas
    getActiveTrabajadores: () => trabajadores.filter(t => t.estaActivo === true),
    getInactiveTrabajadores: () => trabajadores.filter(t => t.estaActivo === false),
    getTotalTrabajadores: () => trabajadores.length,
    
    // Estados computados
    hasTrabajadores: trabajadores.length > 0,
    isOperating: creating || updating || deleting || uploading,
    isCached: true, // TanStack Query maneja el cache automáticamente
  };
};

export default useTrabajadores;
