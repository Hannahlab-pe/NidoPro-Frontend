// src/hooks/usePlanilla.js
import { useState, useCallback, useMemo } from 'react';
import {
  useTrabajadoresTipoContratoPlanilla,
  usePlanillasMensuales,
  useCreatePlanilla,
  useAprobarPlanillasMasivo,
  useInvalidatePlanillas,
  usePlanillaPorPeriodo,
  useAgregarTrabajadoresAPlanilla
} from './queries/usePlanillaQueries';
import planillaService from '../services/planillaService';
import { useAuthStore } from '../store';

/**
 * Hook personalizado para gestionar planillas
 * Proporciona todas las funcionalidades CRUD y gestión de estado
 */
export const usePlanilla = (initialFilters = {}) => {
  // Estado para filtros y búsqueda
  const [filters, setFilters] = useState({
    mes: '',
    anio: '',
    estado: '',
    search: '',
    ...initialFilters
  });

  // Estado para trabajadores filtrados por período
  const [trabajadoresFiltradosPorPeriodo, setTrabajadoresFiltradosPorPeriodo] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState({ mes: '', anio: '' });

  // Obtener usuario del store
  const { user } = useAuthStore();

  // Queries y mutations de TanStack Query
  const {
    data: trabajadoresSinPlanilla = [],
    isLoading: loadingTrabajadoresSinPlanilla,
    error: errorTrabajadoresSinPlanilla,
    refetch: refetchTrabajadoresSinPlanilla
  } = useTrabajadoresTipoContratoPlanilla(filters);

  const {
    data: planillasMensuales,
    isLoading: loadingPlanillasMensuales,
    error: errorPlanillasMensuales,
    refetch: refetchPlanillasMensuales
  } = usePlanillasMensuales(filters);

  // Hook para obtener planilla por período (para filtrar trabajadores)
  const {
    data: planillaPorPeriodo,
    isLoading: loadingPlanillaPorPeriodo,
    error: errorPlanillaPorPeriodo,
    refetch: refetchPlanillaPorPeriodo
  } = usePlanillaPorPeriodo('', '', { enabled: false }); // Se ejecuta manualmente

  const createMutation = useCreatePlanilla();
  const aprobarMasivoMutation = useAprobarPlanillasMasivo();
  const { invalidateAll, invalidateLists, invalidateTrabajadoresSinPlanilla } = useInvalidatePlanillas();

  // Nuevos hooks para la funcionalidad de agregar trabajadores a planilla existente
  const agregarTrabajadoresMutation = useAgregarTrabajadoresAPlanilla();

  // --- Sección de Estadísticas ---
  /**
   * Calcular y memorizar estadísticas de planillas
   */
  const statistics = useMemo(() => {
    const trabajadoresSinPlanillaCount = Array.isArray(trabajadoresSinPlanilla) ? trabajadoresSinPlanilla.length : 0;
    const planillasCount = planillasMensuales?.planillas?.length || 0;

    return {
      trabajadoresSinPlanilla: trabajadoresSinPlanillaCount,
      planillasMensuales: planillasCount,
      totalRegistros: trabajadoresSinPlanillaCount + planillasCount,
    };
  }, [trabajadoresSinPlanilla, planillasMensuales]);
  // --- Fin de la Sección de Estadísticas ---

  // Funciones CRUD usando mutations
  const createPlanilla = useCallback(async (planillaData) => {
    return createMutation.mutateAsync(planillaData);
  }, [createMutation]);

  const aprobarPlanillasMasivo = useCallback(async (datosAprobacion) => {
    return aprobarMasivoMutation.mutateAsync(datosAprobacion);
  }, [aprobarMasivoMutation]);

  // Nueva función para generar planillas con trabajadores seleccionados
  const generarPlanillasConTrabajadores = useCallback(async (trabajadoresSeleccionados, mesSeleccionado = null, anioSeleccionado = null) => {
    if (!trabajadoresSeleccionados || trabajadoresSeleccionados.length === 0) {
      throw new Error('Debe seleccionar al menos un trabajador');
    }

    // Obtener generadoPor del store de autenticación
    const generadoPor = user?.entidadId;
    if (!generadoPor) {
      throw new Error('ID de entidad no encontrado en el estado de autenticación');
    }

    // Usar mes y año seleccionados, o la fecha actual si no se proporcionan
    const mes = mesSeleccionado ? parseInt(mesSeleccionado) : (new Date().getMonth() + 1);
    const anio = anioSeleccionado ? parseInt(anioSeleccionado) : new Date().getFullYear();

    // Validar que mes y año sean válidos
    if (mes < 1 || mes > 12) {
      throw new Error('Mes debe estar entre 1 y 12');
    }
    if (anio < 2020 || anio > 2030) {
      throw new Error('Año debe estar entre 2020 y 2030');
    }

    const payload = {
      mes: mes,
      anio: anio,
      fechaPagoProgramada: new Date(anio, mes - 1 + 1, 0).toISOString().split('T')[0], // último día del mes seleccionado
      trabajadores: trabajadoresSeleccionados,
      generadoPor: generadoPor
    };

    console.log('Generando planillas con payload:', payload);

    // Llamada real al servicio
    const response = await planillaService.generarPlanillasConTrabajadores(payload);

    // Invalidar las queries para refrescar los datos
    invalidateAll();

    return response;
  }, [user, invalidateAll]);

  // Nueva función para obtener planilla por período
  const obtenerPlanillaPorPeriodo = useCallback(async (mes, anio) => {
    if (!mes || !anio) {
      throw new Error('Mes y año son requeridos');
    }

    console.log('Obteniendo planilla por período:', { mes, anio });

    // Llamada directa al servicio
    const response = await planillaService.obtenerPlanillaPorPeriodo(mes, anio);

    return response;
  }, []);

  // Nueva función para filtrar trabajadores por período
  const filtrarTrabajadoresPorPeriodo = useCallback(async (mes, anio) => {
    if (!mes || !anio) {
      // Si no hay período seleccionado, mostrar todos los trabajadores
      setTrabajadoresFiltradosPorPeriodo([]);
      setPeriodoSeleccionado({ mes: '', anio: '' });
      console.log('Mostrando todos los trabajadores (sin filtro de período)');
      return trabajadoresSinPlanilla;
    }

    try {
      console.log('Filtrando trabajadores para período:', { mes, anio });

      // Obtener planilla del período (si existe)
      const planilla = await obtenerPlanillaPorPeriodo(mes, anio);

      if (!planilla || !planilla.detallePlanillas) {
        // Si no hay planilla para este período, mostrar todos los trabajadores
        console.log('No hay planilla para este período, mostrando todos los trabajadores');
        setTrabajadoresFiltradosPorPeriodo([]);
        setPeriodoSeleccionado({ mes, anio });
        return trabajadoresSinPlanilla;
      }

      // Obtener IDs de trabajadores que YA tienen planilla para este período
      const trabajadoresEnPlanilla = planilla.detallePlanillas.map(detalle => detalle.idTrabajador);

      console.log('Trabajadores en planilla:', trabajadoresEnPlanilla);

      // Filtrar trabajadores que NO están en la planilla del período
      const trabajadoresFiltrados = trabajadoresSinPlanilla.filter(trabajador =>
        !trabajadoresEnPlanilla.includes(trabajador.idTrabajador)
      );

      console.log('Trabajadores filtrados (sin planilla para este período):', trabajadoresFiltrados.length);

      // Actualizar estado
      setTrabajadoresFiltradosPorPeriodo(trabajadoresFiltrados);
      setPeriodoSeleccionado({ mes, anio });

      return trabajadoresFiltrados;

    } catch (error) {
      console.log('Error al filtrar trabajadores o no hay planilla para este período:', error.message);
      // Si hay error (planilla no existe), mostrar todos los trabajadores
      setTrabajadoresFiltradosPorPeriodo([]);
      setPeriodoSeleccionado({ mes, anio });
      return trabajadoresSinPlanilla;
    }
  }, [trabajadoresSinPlanilla, obtenerPlanillaPorPeriodo]);

  // Nueva función para agregar trabajadores a una planilla existente
  const agregarTrabajadoresAPlanilla = useCallback(async (idPlanilla, trabajadoresSeleccionados) => {
    if (!idPlanilla) {
      throw new Error('ID de planilla es requerido');
    }

    if (!trabajadoresSeleccionados || trabajadoresSeleccionados.length === 0) {
      throw new Error('Debe seleccionar al menos un trabajador');
    }

    // Obtener generadoPor del store de autenticación
    const generadoPor = user?.entidadId;
    if (!generadoPor) {
      throw new Error('ID de entidad no encontrado en el estado de autenticación');
    }

    const payload = {
      idPlanilla,
      trabajadores: trabajadoresSeleccionados,
      generadoPor: generadoPor
    };

    console.log('Agregando trabajadores a planilla:', payload);

    // Usar la mutation para agregar trabajadores
    return agregarTrabajadoresMutation.mutateAsync(payload);
  }, [user, agregarTrabajadoresMutation]);

  // Funciones de filtrado y búsqueda
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      mes: '',
      anio: '',
      estado: '',
      search: ''
    });
  }, []);

  const searchTrabajadores = useCallback((searchTerm) => {
    updateFilters({ search: searchTerm });
  }, [updateFilters]);

  const filterByMes = useCallback((mes) => {
    updateFilters({ mes });
  }, [updateFilters]);

  const filterByAnio = useCallback((anio) => {
    updateFilters({ anio });
  }, [updateFilters]);

  const filterByEstado = useCallback((estado) => {
    updateFilters({ estado });
  }, [updateFilters]);

  // Estados derivados
  const creating = createMutation.isPending;
  const approving = aprobarMasivoMutation.isPending;
  const loading = loadingTrabajadoresSinPlanilla || loadingPlanillasMensuales;
  const error = errorTrabajadoresSinPlanilla || errorPlanillasMensuales;

  // Funciones de utilidad
  const fetchTrabajadoresSinPlanilla = useCallback(async (customFilters = {}) => {
    if (Object.keys(customFilters).length > 0) {
      updateFilters(customFilters);
    } else {
      return refetchTrabajadoresSinPlanilla();
    }
  }, [refetchTrabajadoresSinPlanilla, updateFilters]);

  const fetchPlanillasMensuales = useCallback(async (customFilters = {}) => {
    if (Object.keys(customFilters).length > 0) {
      updateFilters(customFilters);
    } else {
      return refetchPlanillasMensuales();
    }
  }, [refetchPlanillasMensuales, updateFilters]);

  const refreshAll = useCallback(() => {
    refetchTrabajadoresSinPlanilla();
    refetchPlanillasMensuales();
  }, [refetchTrabajadoresSinPlanilla, refetchPlanillasMensuales]);

  // Objeto de retorno del hook
  return {
    // Estados
    trabajadoresSinPlanilla: trabajadoresFiltradosPorPeriodo.length > 0 ? trabajadoresFiltradosPorPeriodo : trabajadoresSinPlanilla,
    trabajadoresSinPlanillaOriginal: trabajadoresSinPlanilla, // Datos originales sin filtrar
    planillasMensuales: planillasMensuales?.planillas || [],
    loading,
    creating,
    approving,
    filters,
    error,
    statistics,
    periodoSeleccionado,

    // Funciones CRUD
    createPlanilla,
    aprobarPlanillasMasivo,
    generarPlanillasConTrabajadores,

    // Funciones de búsqueda y filtrado
    searchTrabajadores,
    filterByMes,
    filterByAnio,
    filterByEstado,
    updateFilters,
    resetFilters,

    // Funciones de utilidad
    fetchTrabajadoresSinPlanilla,
    fetchPlanillasMensuales,
    refreshAll,

    // Nuevas funciones para agregar trabajadores a planilla existente
    obtenerPlanillaPorPeriodo,
    agregarTrabajadoresAPlanilla,
    filtrarTrabajadoresPorPeriodo,
    isAgregandoTrabajadores: agregarTrabajadoresMutation.isPending,

    // Funciones de cache
    invalidateCache: invalidateAll,
    invalidateLists,
    invalidateTrabajadoresSinPlanilla,

    // Estados computados
    hasTrabajadoresSinPlanilla: Array.isArray(trabajadoresFiltradosPorPeriodo.length > 0 ? trabajadoresFiltradosPorPeriodo : trabajadoresSinPlanilla) &&
                                (trabajadoresFiltradosPorPeriodo.length > 0 ? trabajadoresFiltradosPorPeriodo : trabajadoresSinPlanilla).length > 0,
    hasPlanillasMensuales: planillasMensuales?.planillas?.length > 0,
    isOperating: creating || approving,
    isCached: true, // TanStack Query maneja el cache automáticamente
  };
};

export default usePlanilla;
