import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

// Query Keys para aulas
export const aulasKeys = {
  all: ['aulas'],
  lists: () => [...aulasKeys.all, 'list'],
  list: (filters) => [...aulasKeys.lists(), { filters }],
  details: () => [...aulasKeys.all, 'detail'],
  detail: (id) => [...aulasKeys.details(), id],
};

/**
 * Hook para obtener todas las aulas
 */
export const useAulas = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: aulasKeys.list(filters),
    queryFn: async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://nidopro.up.railway.app/api/v1';

      const response = await fetch(`${API_BASE_URL}/aula`, {
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
        throw new Error('Error al cargar aulas');
      }

      const data = await response.json();

      if (data.success && data.info?.data) {
        return data.info.data;
      }

      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    ...options,
  });
};

/**
 * Hook personalizado para gestionar aulas
 */
export const useAulasDashboard = () => {
  const { data: aulas = [], isLoading, error } = useAulas();

  // Calcular estadísticas de aulas
  const statistics = {
    total: aulas.length,
    capacidadTotal: aulas.reduce((sum, aula) => sum + (aula.cantidadEstudiantes || 0), 0),
    secciones: aulas.map(aula => aula.seccion).filter(Boolean),
    loading: isLoading,
    error
  };

  return {
    aulas,
    statistics,
    isLoading,
    error
  };
};

export default useAulasDashboard;
