// src/hooks/useContratos.js
import { useState, useCallback, useMemo } from 'react';
import {
  useContratos as useContratosQuery,
  useCreateContrato,
  useUpdateContrato,
  useDeleteContrato,
  useFinalizarContrato,
  useInvalidateContratos
} from './queries/useContratosQueries';

/**
 * Hook personalizado para gestionar contratos con TanStack Query
 * Proporciona todas las funcionalidades CRUD, gestión de estado y estadísticas
 */
export const useContratos = (initialFilters = {}) => {
  // Estado para filtros y búsqueda
  const [filters, setFilters] = useState({
    estadoContrato: '',
    idTipoContrato: '',
    search: '',
    ...initialFilters
  });

  // Queries y mutations de TanStack Query
  const {
    data: contratos = [],
    isLoading: loading,
    error,
    refetch: refetchContratos
  } = useContratosQuery(filters);

  const createMutation = useCreateContrato();
  const updateMutation = useUpdateContrato();
  const deleteMutation = useDeleteContrato();
  const finalizarMutation = useFinalizarContrato();
  const { invalidateAll, invalidateLists } = useInvalidateContratos();

  // --- Sección de Estadísticas ---
  /**
   * Calcular y memorizar estadísticas de los contratos
   */
  const statistics = useMemo(() => {
    if (!contratos || contratos.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        expired: 0,
        expiringSoon: 0,
        byType: {},
        recentContracts: 0
      };
    }

    const total = contratos.length;
    const active = contratos.filter(c => c.estadoContrato === 'ACTIVO').length;
    const inactive = contratos.filter(c => c.estadoContrato === 'INACTIVO').length;
    const expired = contratos.filter(c => {
      if (!c.fechaFin) return false;
      return new Date(c.fechaFin) < new Date();
    }).length;

    // Contratos que expiran en los próximos 30 días
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = contratos.filter(c => {
      if (!c.fechaFin || c.estadoContrato !== 'ACTIVO') return false;
      const fechaFin = new Date(c.fechaFin);
      return fechaFin >= new Date() && fechaFin <= thirtyDaysFromNow;
    }).length;

    // Agrupar por tipo de contrato
    const byType = contratos.reduce((acc, contrato) => {
      const tipo = contrato.idTipoContrato?.nombreTipo || 'Sin tipo';
      acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    // Contratos recientes (último mes)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentContracts = contratos.filter(c =>
      new Date(c.creadoEn) > oneMonthAgo
    ).length;

    return {
      total,
      active,
      inactive,
      expired,
      expiringSoon,
      byType,
      recentContracts,
    };
  }, [contratos]);
  // --- Fin de la Sección de Estadísticas ---

  // Funciones CRUD usando mutations
  const createContrato = useCallback(async (contratoData) => {
    return createMutation.mutateAsync(contratoData);
  }, [createMutation]);

  const updateContrato = useCallback(async (id, contratoData) => {
    return updateMutation.mutateAsync({ id, data: contratoData });
  }, [updateMutation]);

  const deleteContrato = useCallback(async (id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const finalizarContrato = useCallback(async (id, finalizacionData) => {
    return finalizarMutation.mutateAsync({ id, data: finalizacionData });
  }, [finalizarMutation]);

  // Funciones de filtrado y búsqueda
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      estadoContrato: '',
      idTipoContrato: '',
      search: ''
    });
  }, []);

  const searchContratos = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const filterByEstado = useCallback((estadoContrato) => {
    updateFilters({ estadoContrato });
  }, [updateFilters]);

  const filterByTipo = useCallback((idTipoContrato) => {
    updateFilters({ idTipoContrato });
  }, [updateFilters]);

  // Estados derivados
  const creating = createMutation.isPending;
  const updating = updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const finalizing = finalizarMutation.isPending;

  // Funciones de utilidad
  const fetchContratos = useCallback(async (customFilters = {}) => {
    if (Object.keys(customFilters).length > 0) {
      updateFilters(customFilters);
    } else {
      return refetchContratos();
    }
  }, [refetchContratos, updateFilters]);

  const refreshContratos = useCallback(() => {
    return refetchContratos();
  }, [refetchContratos]);

  // Objeto de retorno del hook
  return {
    // Estados
    contratos,
    loading,
    creating,
    updating,
    deleting,
    finalizing,
    filters,
    error,
    statistics,

    // Funciones CRUD
    createContrato,
    updateContrato,
    deleteContrato,
    finalizarContrato,

    // Funciones de búsqueda y filtrado
    searchContratos,
    filterByEstado,
    filterByTipo,
    updateFilters,
    resetFilters,

    // Funciones de utilidad
    fetchContratos,
    refreshContratos,

    // Funciones de cache
    invalidateCache: invalidateAll,
    invalidateLists,

    // Funciones derivadas
    getActiveContratos: () => contratos.filter(c => c.estadoContrato === 'ACTIVO'),
    getInactiveContratos: () => contratos.filter(c => c.estadoContrato === 'INACTIVO'),
    getExpiredContratos: () => contratos.filter(c => {
      if (!c.fechaFin) return false;
      return new Date(c.fechaFin) < new Date();
    }),
    getExpiringSoonContratos: () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return contratos.filter(c => {
        if (!c.fechaFin || c.estadoContrato !== 'ACTIVO') return false;
        const fechaFin = new Date(c.fechaFin);
        return fechaFin >= new Date() && fechaFin <= thirtyDaysFromNow;
      });
    },
    getTotalContratos: () => contratos.length,

    // Estados computados
    hasContratos: contratos.length > 0,
    isOperating: creating || updating || deleting || finalizing,
    isCached: true, // TanStack Query maneja el cache automáticamente
  };
};

export default useContratos;
