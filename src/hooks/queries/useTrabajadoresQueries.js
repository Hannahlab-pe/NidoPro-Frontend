// src/hooks/queries/useTrabajadoresQueries.js
import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import trabajadorService from '../../services/trabajadorService';

// Query Keys para trabajadores
export const trabajadoresKeys = {
  all: ['trabajadores'],
  lists: () => [...trabajadoresKeys.all, 'list'],
  list: (filters) => [...trabajadoresKeys.lists(), { filters }],
  details: () => [...trabajadoresKeys.all, 'detail'],
  detail: (id) => [...trabajadoresKeys.details(), id],
};

/**
 * Hook para obtener todos los trabajadores con cache automático
 * @param {Object} filters - Filtros opcionales para la consulta
 * @param {Object} options - Opciones adicionales para useQuery
 */
export const useTrabajadores = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: trabajadoresKeys.list(filters),
    queryFn: () => trabajadorService.getAllTrabajadores(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook específico para obtener solo los docentes (trabajadores con rol DOCENTE)
 * @param {Object} filters - Filtros opcionales adicionales para la consulta
 * @param {Object} options - Opciones adicionales para useQuery
 */
export const useDocentes = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: [...trabajadoresKeys.list(filters), 'docentes'],
    queryFn: async () => {
      const response = await trabajadorService.getAllTrabajadores(filters);

      // Filtrar solo los trabajadores con rol DOCENTE
      if (response && Array.isArray(response)) {
        return response.filter(trabajador =>
          trabajador.idRol?.nombre === 'DOCENTE' ||
          trabajador.rol?.nombre === 'DOCENTE'
        );
      }

      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para obtener un trabajador específico por ID
 * @param {string|number} id - ID del trabajador
 * @param {Object} options - Opciones adicionales para useQuery
 */
export const useTrabajador = (id, options = {}) => {
  return useQuery({
    queryKey: trabajadoresKeys.detail(id),
    queryFn: () => trabajadorService.getTrabajadorById(id),
    enabled: !!id, // Solo ejecutar si hay ID
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook para crear un nuevo trabajador
 */
export const useCreateTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (trabajadorData) => trabajadorService.createTrabajador(trabajadorData),
    onMutate: () => {
      // Toast de loading
      const loadingToast = toast.loading('Creando trabajador...', {
        description: 'Guardando datos...'
      });
      return { loadingToast };
    },
    onSuccess: (newTrabajador, variables, context) => {
      // Invalidar y refetch todas las listas de trabajadores
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.lists() });
      
      // Toast de éxito
      toast.success('¡Trabajador creado exitosamente!', {
        id: context.loadingToast,
        description: `${newTrabajador.nombre} ${newTrabajador.apellido} ha sido agregado al sistema`
      });
      
      console.log('✅ Trabajador creado y cache invalidado');
    },
    onError: (error, variables, context) => {
      toast.error('Error al crear trabajador', {
        id: context?.loadingToast,
        description: error.message || 'Ha ocurrido un error inesperado'
      });
      console.error('❌ Error al crear trabajador:', error);
    },
  });
};

/**
 * Hook para actualizar un trabajador existente
 */
export const useUpdateTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => trabajadorService.updateTrabajador(id, data),
    onMutate: () => {
      const loadingToast = toast.loading('Actualizando trabajador...', {
        description: 'Guardando cambios...'
      });
      return { loadingToast };
    },
    onSuccess: (updatedTrabajador, variables, context) => {
      // Invalidar listas y detalle específico
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.detail(variables.id) });
      
      toast.success('Trabajador actualizado exitosamente', {
        id: context.loadingToast,
        description: `Los datos de ${updatedTrabajador.nombre} ${updatedTrabajador.apellido} han sido actualizados`
      });
      
      console.log('✅ Trabajador actualizado y cache invalidado');
    },
    onError: (error, variables, context) => {
      toast.error('Error al actualizar trabajador', {
        id: context?.loadingToast,
        description: error.message || 'Ha ocurrido un error inesperado'
      });
      console.error('❌ Error al actualizar trabajador:', error);
    },
  });
};

/**
 * Hook para eliminar un trabajador
 */
export const useDeleteTrabajador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => trabajadorService.deleteTrabajador(id),
    onMutate: () => {
      const loadingToast = toast.loading('Eliminando trabajador...', {
        description: 'Procesando eliminación...'
      });
      return { loadingToast };
    },
    onSuccess: (data, id, context) => {
      // Invalidar listas y remover detalle específico
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.lists() });
      queryClient.removeQueries({ queryKey: trabajadoresKeys.detail(id) });
      
      toast.success('Trabajador eliminado exitosamente', {
        id: context.loadingToast,
        description: 'El registro ha sido eliminado del sistema'
      });
      
      console.log('✅ Trabajador eliminado y cache invalidado');
    },
    onError: (error, variables, context) => {
      toast.error('Error al eliminar trabajador', {
        id: context?.loadingToast,
        description: error.message || 'Ha ocurrido un error inesperado'
      });
      console.error('❌ Error al eliminar trabajador:', error);
    },
  });
};

/**
 * Hook para cambiar el estado de un trabajador (activar/desactivar)
 */
export const useToggleTrabajadorStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ trabajador }) => {
      console.log('🔄 Toggleando estado del trabajador:', trabajador);
      
      // Obtener el ID correcto del trabajador (puede ser idTrabajador o id)
      const trabajadorId = trabajador.idTrabajador || trabajador.id;
      
      if (!trabajadorId) {
        console.error('❌ No se encontró ID del trabajador:', trabajador);
        throw new Error('ID del trabajador no encontrado');
      }
      
      console.log('🔄 ID del trabajador para toggle:', trabajadorId);
      console.log('🔄 Estado actual del trabajador:', trabajador.estaActivo);
      
      // Usar la función correcta del servicio que llama al PATCH endpoint
      return trabajadorService.toggleTrabajadorStatus(trabajadorId, !trabajador.estaActivo);
    },
    onMutate: ({ trabajador }) => {
      const action = trabajador.estaActivo ? 'desactivando' : 'activando';
      const loadingToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)} trabajador...`, {
        description: 'Procesando solicitud...'
      });
      return { loadingToast, trabajador };
    },
    onSuccess: (response, variables, context) => {
      // Invalidar listas y detalle específico
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: trabajadoresKeys.detail(variables.trabajador.idTrabajador || variables.trabajador.id) });
      
      // Determinar el estado según la respuesta del backend
      const wasActive = context.trabajador.estaActivo;
      const status = wasActive ? 'desactivado' : 'activado';
      
      toast.success(`Trabajador ${status} exitosamente`, {
        id: context.loadingToast,
        description: `${context.trabajador.nombre} ${context.trabajador.apellido} ha sido ${status}`
      });
      
      console.log(`✅ Trabajador ${status} y cache invalidado`);
    },
    onError: (error, variables, context) => {
      const action = context.trabajador.estaActivo ? 'desactivar' : 'activar';
      toast.error(`Error al ${action} trabajador`, {
        id: context?.loadingToast,
        description: error.message || 'Ha ocurrido un error inesperado'
      });
      console.error(`❌ Error al ${action} trabajador:`, error);
    },
  });
};

/**
 * Hook para obtener todos los comentarios docentes
 * @param {Object} options - Opciones adicionales para useQuery
 */
export const useComentariosDocentes = (options = {}) => {
  return useQuery({
    queryKey: ['comentarios-docentes'],
    queryFn: async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      const response = await fetch(`${API_BASE_URL}/comentario-docente`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token de autenticación inválido o expirado');
        }
        throw new Error('Error al cargar comentarios docentes');
      }

      const data = await response.json();

      // El API devuelve un array directamente, no dentro de una propiedad
      const comentarios = Array.isArray(data) ? data : data?.comentarios || data?.data || [];

      // Transformar los datos para que coincidan con lo que espera el frontend
      return comentarios.map(comentario => ({
        idComentario: comentario.idEvaluacionDocente,
        motivo: comentario.motivo,
        descripcion: comentario.descripcion,
        archivoUrl: comentario.archivoUrl,
        fechaCreacion: comentario.fechaCreacion,
        idTrabajador: comentario.trabajador || {
          idTrabajador: comentario.idTrabajador,
          nombre: comentario.trabajador?.nombre || 'N/A',
          apellido: comentario.trabajador?.apellido || ''
        },
        idCoordinador: comentario.coordinador || {
          idCoordinador: comentario.idCoordinador,
          nombre: comentario.coordinador?.nombre || 'N/A',
          apellido: comentario.coordinador?.apellido || ''
        }
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook para crear un comentario docente
 */
export const useCreateComentarioDocente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comentarioData) => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      const response = await fetch(`${API_BASE_URL}/comentario-docente`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(comentarioData)
      });

      if (!response.ok) {
        throw new Error('Error al crear comentario docente');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch todos los comentarios docentes
      queryClient.invalidateQueries({ queryKey: ['comentarios-docentes'] });
    },
  });
};

/**
 * Hook para actualizar un comentario docente
 */
export const useUpdateComentarioDocente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      // Usar idEvaluacionDocente para el endpoint del backend
      const response = await fetch(`${API_BASE_URL}/comentario-docente/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar comentario docente');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar y refetch todos los comentarios docentes
      queryClient.invalidateQueries({ queryKey: ['comentarios-docentes'] });
    },
  });
};

/**
 * Hook para eliminar un comentario docente
 */
export const useDeleteComentarioDocente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

      // Usar idEvaluacionDocente para el endpoint del backend
      const response = await fetch(`${API_BASE_URL}/comentario-docente/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar comentario docente');
      }
    },
    onSuccess: () => {
      // Invalidar y refetch todos los comentarios docentes
      queryClient.invalidateQueries({ queryKey: ['comentarios-docentes'] });
    },
  });
};

/**
 * Hook para invalidar cache de trabajadores
 */
export const useInvalidateTrabajadores = () => {
  const queryClient = useQueryClient();

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: trabajadoresKeys.all });
  }, [queryClient]);

  const invalidateLists = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: trabajadoresKeys.lists() });
  }, [queryClient]);

  const invalidateDetail = useCallback((id) => {
    queryClient.invalidateQueries({ queryKey: trabajadoresKeys.detail(id) });
  }, [queryClient]);

  return {
    invalidateAll,
    invalidateLists,
    invalidateDetail
  };
};
