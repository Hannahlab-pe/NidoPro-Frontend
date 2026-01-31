// src/hooks/queries/useAulasQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aulaService } from '../../services/aulaService';
import { estudianteService } from '../../services/estudianteService';
import { toast } from 'sonner';

// Claves de query para aulas
export const AULAS_QUERY_KEYS = {
  all: ['aulas'],
  lists: () => [...AULAS_QUERY_KEYS.all, 'list'],
  list: (filters) => [...AULAS_QUERY_KEYS.lists(), { filters }],
  details: () => [...AULAS_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...AULAS_QUERY_KEYS.details(), id],
  detailView: (id) => [...AULAS_QUERY_KEYS.details(), 'view', id],
  stats: () => [...AULAS_QUERY_KEYS.all, 'stats'],
  byTrabajador: (idTrabajador) => [...AULAS_QUERY_KEYS.all, 'trabajador', idTrabajador],
};

/**
 * Hook para obtener todas las aulas con filtros opcionales
 */
export const useAulas = (filters = {}) => {
  return useQuery({
    queryKey: AULAS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      try {
        const response = await aulaService.getAllAulas(filters);
        
        // Manejar diferentes estructuras de respuesta del backend
        if (response.success && response.info?.data) {
          return response.info.data;
        } else if (response.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        }
        
        return [];
      } catch (error) {
        console.error('Error en useAulas:', error);
        
        // En desarrollo, devolver datos mock si el backend no está disponible
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Backend no disponible, usando datos mock para aulas');
          return [
            {
              idAula: '1',
              seccion: 'A',
              cantidadEstudiantes: 25,
              capacidadMaxima: 30,
              descripcion: 'Aula de primer grado',
              ubicacion: 'Primer piso',
              equipamiento: 'Proyector, pizarra digital',
              estado: 'activa'
            },
            {
              idAula: '2',
              seccion: 'B',
              cantidadEstudiantes: 28,
              capacidadMaxima: 30,
              descripcion: 'Aula de segundo grado',
              ubicacion: 'Primer piso',
              equipamiento: 'Proyector, computadoras',
              estado: 'activa'
            },
            {
              idAula: '3',
              seccion: 'C',
              cantidadEstudiantes: 22,
              capacidadMaxima: 30,
              descripcion: 'Aula de tercer grado',
              ubicacion: 'Segundo piso',
              equipamiento: 'Pizarra tradicional',
              estado: 'activa'
            }
          ];
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener un aula específica por ID
 */
export const useAula = (id) => {
  return useQuery({
    queryKey: AULAS_QUERY_KEYS.detail(id),
    queryFn: () => aulaService.getAulaById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para obtener detalle de aula (tutor + docentes con cursos)
 */
export const useAulaDetalle = (id, options = {}) => {
  return useQuery({
    queryKey: AULAS_QUERY_KEYS.detailView(id),
    queryFn: () => aulaService.getAulaDetalle(id),
    enabled: !!id && (options.enabled ?? true),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para obtener todas las aulas (para admin)
 */
export const useAulasAdmin = (options = {}) => {
  return useAulas({}, options);
};

/**
 * Hook para crear una nueva aula
 */
export const useCreateAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aulaService.createAula,
    onSuccess: (data) => {
      // Invalidar y refetch todas las queries de aulas
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.all });
      
      toast.success('Aula creada exitosamente', {
        description: `Aula sección ${data.seccion || data.info?.seccion} creada correctamente`
      });
    },
    onError: (error) => {
      console.error('Error al crear aula:', error);
      toast.error('Error al crear aula', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    },
  });
};

/**
 * Hook para actualizar un aula existente
 */
export const useUpdateAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...aulaData }) => aulaService.updateAula(id, aulaData),
    onSuccess: (data, variables) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.detail(variables.id) });
      
      toast.success('Aula actualizada exitosamente', {
        description: `Los datos del aula han sido actualizados`
      });
    },
    onError: (error) => {
      console.error('Error al actualizar aula:', error);
      toast.error('Error al actualizar aula', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    },
  });
};

/**
 * Hook para eliminar un aula
 */
export const useDeleteAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aulaService.deleteAula,
    onSuccess: () => {
      // Invalidar todas las queries de aulas
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.all });
      
      toast.success('Aula eliminada exitosamente', {
        description: 'El aula ha sido eliminada del sistema'
      });
    },
    onError: (error) => {
      console.error('Error al eliminar aula:', error);
      toast.error('Error al eliminar aula', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    },
  });
};

/**
 * Hook para cambiar el estado de un aula
 */
export const useToggleAulaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado }) => aulaService.changeAulaStatus(id, estado),
    onSuccess: (data, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: AULAS_QUERY_KEYS.detail(variables.id) });
      
      toast.success('Estado del aula actualizado', {
        description: `El aula ahora está ${variables.estado}`
      });
    },
    onError: (error) => {
      console.error('Error al cambiar estado del aula:', error);
      toast.error('Error al cambiar estado', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    },
  });
};

/**
 * Hook para obtener aulas asignadas a un trabajador específico
 */
export const useAulasByTrabajador = (idTrabajador, options = {}) => {
  return useQuery({
    queryKey: AULAS_QUERY_KEYS.byTrabajador(idTrabajador),
    queryFn: async () => {
      try {
        console.log('🔍 Ejecutando query para trabajador:', idTrabajador);
        const resultado = await aulaService.getAulasByTrabajador(idTrabajador);
        console.log('✅ Resultado final del hook:', resultado);
        return resultado;
      } catch (error) {
        console.error('❌ Error en useAulasByTrabajador:', error);
        
        // En desarrollo, devolver datos mock si el backend no está disponible
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Backend no disponible, usando datos mock para aulas por trabajador');
          return [
            {
              idAula: '1',
              seccion: 'A',
              cantidadEstudiantes: 25,
              capacidadMaxima: 30,
              descripcion: 'Aula asignada - 5to A',
              ubicacion: 'Primer piso',
              equipamiento: 'Proyector, pizarra digital',
              estado: 'activo'
            },
            {
              idAula: '2', 
              seccion: 'B',
              cantidadEstudiantes: 28,
              capacidadMaxima: 30,
              descripcion: 'Aula asignada - 5to B',
              ubicacion: 'Primer piso',
              equipamiento: 'Proyector, pizarra digital',
              estado: 'activo'
            }
          ];
        }
        
        throw error;
      }
    },
    enabled: !!idTrabajador, // Solo ejecutar si hay idTrabajador
    staleTime: 5 * 60 * 1000, // 5 minutos
    ...options
  });
};

/**
 * Hook para obtener los estudiantes de un aula específica
 */
export const useEstudiantesByAula = (idAula, options = {}) => {
  return useQuery({
    queryKey: ['estudiantes-aula', idAula],
    queryFn: async () => {
      try {
        console.log('🔍 Obteniendo estudiantes del aula:', idAula);
        const resultado = await estudianteService.getEstudiantesPorAula(idAula);
        console.log('✅ Estudiantes obtenidos:', resultado);
        
        // Manejar diferentes estructuras de respuesta del backend
        if (resultado.success && resultado.estudiantes) {
          return resultado.estudiantes;
        } else if (resultado.success && resultado.info?.data) {
          return resultado.info.data;
        } else if (resultado.data) {
          return resultado.data;
        } else if (Array.isArray(resultado)) {
          return resultado;
        }
        
        return [];
      } catch (error) {
        console.error('❌ Error al obtener estudiantes del aula:', error);
        throw error;
      }
    },
    enabled: !!idAula,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    ...options
  });
};

/**
 * Hook para obtener todos los estudiantes de las aulas asignadas a un trabajador
 */
export const useEstudiantesByTrabajadorAulas = (idTrabajador, options = {}) => {
  // Primero obtenemos las aulas del trabajador
  const {
    data: aulasData,
    isLoading: loadingAulas,
    error: errorAulas
  } = useAulasByTrabajador(idTrabajador, { enabled: !!idTrabajador });

  console.log('🏫 Aulas del trabajador:', aulasData);

  // Extraemos los IDs de las aulas - aseguramos que siempre sea un array
  const aulaIds = Array.isArray(aulasData?.aulas)
    ? aulasData.aulas.map(aula => aula.id_aula || aula.idAula || aula.id).filter(Boolean)
    : [];
  console.log('🆔 IDs de aulas extraídos:', aulaIds);
  console.log('🏫 Estructura completa de aulas:', aulasData?.aulas);

  // SIEMPRE llamamos a useQuery, pero lo deshabilitamos cuando no hay aulas
  const estudiantesQueries = useQuery({
    queryKey: ['estudiantes-trabajador-aulas', idTrabajador, aulaIds.sort().join(',')],
    queryFn: async () => {
      if (aulaIds.length === 0) {
        return {
          estudiantes: [],
          aulas: [],
          totalEstudiantes: 0,
          totalAulas: 0
        };
      }

      console.log('🔍 Obteniendo estudiantes para aulas:', aulaIds);

      // Obtener estudiantes de todas las aulas en paralelo
      const promesas = aulaIds.map(idAula =>
        estudianteService.getEstudiantesPorAula(idAula)
      );

      const resultados = await Promise.all(promesas);

      // Combinar todos los estudiantes de todas las aulas
      const todosLosEstudiantes = resultados
        .filter(resultado => resultado?.estudiantes)
        .flatMap(resultado => resultado.estudiantes)
        .filter((estudiante, index, array) =>
          // Eliminar duplicados basados en idEstudiante (la propiedad correcta del backend)
          index === array.findIndex(e => e.idEstudiante === estudiante.idEstudiante)
        );

      console.log('✅ Total estudiantes combinados:', todosLosEstudiantes);

      return {
        estudiantes: todosLosEstudiantes,
        aulas: aulasData?.aulas || [],
        totalEstudiantes: todosLosEstudiantes.length,
        totalAulas: aulasData?.aulas?.length || 0
      };
    },
    enabled: !!idTrabajador && aulaIds.length > 0 && !loadingAulas,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    ...options
  });

  return {
    data: estudiantesQueries.data || {
      estudiantes: [],
      aulas: [],
      totalEstudiantes: 0,
      totalAulas: 0
    },
    isLoading: loadingAulas || estudiantesQueries.isLoading,
    error: errorAulas || estudiantesQueries.error,
    refetch: estudiantesQueries.refetch
  };
};
