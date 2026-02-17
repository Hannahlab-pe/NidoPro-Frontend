// src/hooks/queries/useRolesQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

// Query keys para roles
export const rolesKeys = {
  all: ['roles'],
  lists: () => [...rolesKeys.all, 'list'],
  list: (filters) => [...rolesKeys.lists(), { filters }],
  details: () => [...rolesKeys.all, 'detail'],
  detail: (id) => [...rolesKeys.details(), id],
};

// Servicio API para roles
const rolesService = {
  // Obtener todos los roles
  getRoles: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/rol`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });

    const responseData = response.data || {};
    return responseData.info?.data || responseData.roles || responseData.data || [];
  },

  // Obtener rol por ID
  getRolById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/rol/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data.rol || response.data.role;
  },

  // Crear rol
  createRol: async (rolData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_BASE_URL}/rol`, rolData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data.rol || response.data.role;
  },

  // Actualizar rol
  updateRol: async ({ id, ...rolData }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.patch(`${API_BASE_URL}/rol/${id}`, rolData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data.rol || response.data.role;
  },

  // Eliminar rol
  deleteRol: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    await axios.delete(`${API_BASE_URL}/rol/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return id;
  },

  // Cambiar estado del rol
  toggleRolStatus: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.patch(`${API_BASE_URL}/rol/${id}/toggle-status`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data.rol || response.data.role;
  },
};

/**
 * Hook para obtener todos los roles con filtros opcionales
 */
export const useRoles = (filters = {}) => {
  return useQuery({
    queryKey: rolesKeys.list(filters),
    queryFn: async () => {
      try {
        const response = await rolesService.getRoles(filters);

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
        console.error('Error en useRoles:', error);

        // En desarrollo, devolver datos mock si el backend no está disponible
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Backend no disponible, usando datos mock para roles');
          return [
            {
              idRol: '1',
              nombre: 'Directora',
              descripcion: 'Rol de directora del sistema',
              estaActivo: true,
              creado: '2025-09-19',
              actualizado: '2025-09-19'
            },
            {
              idRol: '2',
              nombre: 'Secretaria',
              descripcion: 'Rol de secretaria administrativa',
              estaActivo: true,
              creado: '2025-09-19',
              actualizado: '2025-09-19'
            },
            {
              idRol: '3',
              nombre: 'Docente',
              descripcion: 'Rol de docente en el sistema',
              estaActivo: true,
              creado: '2025-09-19',
              actualizado: '2025-09-19'
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
 * Hook para obtener un rol específico por ID
 */
export const useRol = (id) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesService.getRolById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para crear un nuevo rol
 */
export const useCreateRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesService.createRol,
    onSuccess: (newRol) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });

      toast.success('Rol creado exitosamente', {
        description: `El rol "${newRol.nombre}" ha sido creado`
      });
    },
    onError: (error) => {
      toast.error('Error al crear rol', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

/**
 * Hook para actualizar un rol existente
 */
export const useUpdateRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesService.updateRol,
    onSuccess: (updatedRol, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rolesKeys.detail(id) });

      // Mostrar mensaje de éxito, manejando el caso donde updatedRol podría ser undefined
      const nombreRol = updatedRol?.nombre || 'Rol';

      toast.success('Rol actualizado exitosamente', {
        description: `Los datos del rol "${nombreRol}" han sido actualizados`
      });
    },
    onError: (error) => {
      toast.error('Error al actualizar rol', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

/**
 * Hook para eliminar un rol
 */
export const useDeleteRol = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesService.deleteRol,
    onSuccess: (deletedId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });

      toast.success('Rol eliminado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar rol', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

/**
 * Hook para cambiar el estado de un rol
 */
export const useToggleRolStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesService.toggleRolStatus,
    onSuccess: (updatedRol) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });

      const statusText = updatedRol.estaActivo ? 'activado' : 'desactivado';
      toast.success(`Rol ${statusText} exitosamente`, {
        description: `El rol "${updatedRol.nombre}" ha sido ${statusText}`
      });
    },
    onError: (error) => {
      toast.error('Error al cambiar estado del rol', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};