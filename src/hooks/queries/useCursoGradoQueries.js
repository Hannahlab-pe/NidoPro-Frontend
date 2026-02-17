// src/hooks/queries/useCursoGradoQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

// Query keys para curso-grado
export const cursoGradoKeys = {
  all: ['curso-grado'],
  lists: () => [...cursoGradoKeys.all, 'list'],
  list: (filters) => [...cursoGradoKeys.lists(), { filters }],
  details: () => [...cursoGradoKeys.all, 'detail'],
  detail: (id) => [...cursoGradoKeys.details(), id],
};

// Servicio API para curso-grado
const cursoGradoService = {
  // Obtener todas las asignaciones de curso-grado
  getCursosGrado: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/curso-grado`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });

    return response.data?.data || response.data?.cursosGrado || response.data || [];
  },

  // Obtener asignación por ID
  getCursoGradoById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/curso-grado/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data?.data || response.data;
  },

  // Obtener cursos asignados por grado
  getCursosGradoByGrado: async (idGrado) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/curso-grado/grado/${idGrado}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data?.data || response.data?.cursosGrado || response.data || [];
  },

  // Crear asignación de curso a grado
  createCursoGrado: async (cursoGradoData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_BASE_URL}/curso-grado`, cursoGradoData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Actualizar asignación de curso-grado
  updateCursoGrado: async ({ id, cursoGradoData }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.patch(`${API_BASE_URL}/curso-grado/${id}`, cursoGradoData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Eliminar asignación de curso-grado
  deleteCursoGrado: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.delete(`${API_BASE_URL}/curso-grado/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  }
};

// Hook principal para obtener cursos-grado
export const useCursosGrado = (filters = {}) => {
  return useQuery({
    queryKey: cursoGradoKeys.list(filters),
    queryFn: () => cursoGradoService.getCursosGrado(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un curso-grado por ID
export const useCursoGrado = (id) => {
  return useQuery({
    queryKey: cursoGradoKeys.detail(id),
    queryFn: () => cursoGradoService.getCursoGradoById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener cursos de un grado
export const useCursosGradoPorGrado = (idGrado) => {
  return useQuery({
    queryKey: cursoGradoKeys.detail(`grado-${idGrado}`),
    queryFn: () => cursoGradoService.getCursosGradoByGrado(idGrado),
    enabled: !!idGrado,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear asignación de curso-grado
export const useCreateCursoGrado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cursoGradoService.createCursoGrado,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cursoGradoKeys.lists() });
      toast.success(data.message || 'Curso asignado correctamente al grado');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al asignar el curso al grado';
      toast.error(message);
      console.error('Error al crear curso-grado:', error);
    }
  });
};

// Hook para actualizar asignación de curso-grado
export const useUpdateCursoGrado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cursoGradoService.updateCursoGrado,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cursoGradoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: cursoGradoKeys.details() });
      toast.success(data.message || 'Asignación actualizada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al actualizar la asignación';
      toast.error(message);
      console.error('Error al actualizar curso-grado:', error);
    }
  });
};

// Hook para eliminar asignación de curso-grado
export const useDeleteCursoGrado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cursoGradoService.deleteCursoGrado,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: cursoGradoKeys.lists() });
      toast.success(data.message || 'Asignación eliminada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al eliminar la asignación';
      toast.error(message);
      console.error('Error al eliminar curso-grado:', error);
    }
  });
};
