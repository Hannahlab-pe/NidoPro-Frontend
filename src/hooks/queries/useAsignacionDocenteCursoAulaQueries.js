// src/hooks/queries/useAsignacionDocenteCursoAulaQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';

// Query keys para asignación docente-curso-aula
export const asignacionDocenteCursoAulaKeys = {
  all: ['asignacion-docente-curso-aula'],
  lists: () => [...asignacionDocenteCursoAulaKeys.all, 'list'],
  list: (filters) => [...asignacionDocenteCursoAulaKeys.lists(), { filters }],
  details: () => [...asignacionDocenteCursoAulaKeys.all, 'detail'],
  detail: (id) => [...asignacionDocenteCursoAulaKeys.details(), id],
};

// Servicio API para asignación docente-curso-aula
const asignacionDocenteCursoAulaService = {
  // Obtener todas las asignaciones
  getAsignaciones: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/asignacion-docente-curso-aula`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });

    return response.data?.data || response.data || [];
  },

  // Obtener asignación por ID
  getAsignacionById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.get(`${API_BASE_URL}/asignacion-docente-curso-aula/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data?.data || response.data;
  },

  // Crear asignación
  createAsignacion: async (asignacionData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.post(`${API_BASE_URL}/asignacion-docente-curso-aula`, asignacionData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Actualizar asignación
  updateAsignacion: async ({ id, asignacionData }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.patch(`${API_BASE_URL}/asignacion-docente-curso-aula/${id}`, asignacionData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  },

  // Eliminar asignación
  deleteAsignacion: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');

    const response = await axios.delete(`${API_BASE_URL}/asignacion-docente-curso-aula/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });

    return response.data;
  }
};

// Hook principal para obtener asignaciones
export const useAsignacionesDocenteCursoAula = (filters = {}) => {
  return useQuery({
    queryKey: asignacionDocenteCursoAulaKeys.list(filters),
    queryFn: () => asignacionDocenteCursoAulaService.getAsignaciones(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una asignación por ID
export const useAsignacionDocenteCursoAula = (id) => {
  return useQuery({
    queryKey: asignacionDocenteCursoAulaKeys.detail(id),
    queryFn: () => asignacionDocenteCursoAulaService.getAsignacionById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para crear asignación
export const useCreateAsignacionDocenteCursoAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionDocenteCursoAulaService.createAsignacion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: asignacionDocenteCursoAulaKeys.lists() });
      toast.success(data.message || 'Asignación creada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al crear la asignación';
      toast.error(message);
      console.error('Error al crear asignación:', error);
    }
  });
};

// Hook para actualizar asignación
export const useUpdateAsignacionDocenteCursoAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionDocenteCursoAulaService.updateAsignacion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: asignacionDocenteCursoAulaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: asignacionDocenteCursoAulaKeys.details() });
      toast.success(data.message || 'Asignación actualizada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al actualizar la asignación';
      toast.error(message);
      console.error('Error al actualizar asignación:', error);
    }
  });
};

// Hook para eliminar asignación
export const useDeleteAsignacionDocenteCursoAula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: asignacionDocenteCursoAulaService.deleteAsignacion,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: asignacionDocenteCursoAulaKeys.lists() });
      toast.success(data.message || 'Asignación eliminada correctamente');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al eliminar la asignación';
      toast.error(message);
      console.error('Error al eliminar asignación:', error);
    }
  });
};
