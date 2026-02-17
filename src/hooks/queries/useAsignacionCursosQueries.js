// src/hooks/queries/useAsignacionCursosQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

// Query keys para asignaciones de cursos
export const asignacionCursosKeys = {
  all: ['asignacion-cursos'],
  lists: () => [...asignacionCursosKeys.all, 'list'],
  list: (filters) => [...asignacionCursosKeys.lists(), { filters }],
  details: () => [...asignacionCursosKeys.all, 'detail'],
  detail: (id) => [...asignacionCursosKeys.details(), id],
};

// Servicio API para asignaciones de cursos
const asignacionCursosService = {
  // Obtener todas las asignaciones de cursos
  getAsignacionCursos: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/asignacion-curso`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });

    const responseData = response.data || {};
    return responseData.asignacionesCurso || responseData.asignaciones || responseData.data || [];
  },

  // Obtener asignación por ID
  getAsignacionCursoById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/asignacion-curso/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data.asignacion || response.data;
  },

  // Crear asignación de curso
  createAsignacionCurso: async (asignacionData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_BASE_URL}/asignacion-curso`, asignacionData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Actualizar asignación de curso
  updateAsignacionCurso: async ({ id, asignacionData }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.patch(`${API_BASE_URL}/asignacion-curso/${id}`, asignacionData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Eliminar asignación de curso (desactivar)
  deleteAsignacionCurso: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.delete(`${API_BASE_URL}/asignacion-curso/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  }
};

// Hooks para asignaciones de cursos
export const useAsignacionCursos = (filters = {}) => {
  return useQuery({
    queryKey: asignacionCursosKeys.list(filters),
    queryFn: () => asignacionCursosService.getAsignacionCursos(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useAsignacionCurso = (id) => {
  return useQuery({
    queryKey: asignacionCursosKeys.detail(id),
    queryFn: () => asignacionCursosService.getAsignacionCursoById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateAsignacionCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionCursosService.createAsignacionCurso,
    onSuccess: (data) => {
      toast.success('Asignación de curso creada exitosamente');
      queryClient.invalidateQueries({ queryKey: asignacionCursosKeys.all });
    },
    onError: (error) => {
      console.error('Error al crear asignación de curso:', error);
      toast.error(error.response?.data?.message || 'Error al crear asignación de curso');
    }
  });
};

export const useUpdateAsignacionCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionCursosService.updateAsignacionCurso,
    onSuccess: (data) => {
      toast.success('Asignación de curso actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: asignacionCursosKeys.all });
    },
    onError: (error) => {
      console.error('Error al actualizar asignación de curso:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar asignación de curso');
    }
  });
};

export const useDeleteAsignacionCurso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionCursosService.deleteAsignacionCurso,
    onSuccess: (data) => {
      toast.success('Asignación de curso eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: asignacionCursosKeys.all });
    },
    onError: (error) => {
      console.error('Error al eliminar asignación de curso:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar asignación de curso');
    }
  });
};