// src/hooks/queries/usePadresQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { uploadStudentImage } from '../../services/cloudinaryService';

// Query keys para padres
export const padresKeys = {
  all: ['padres'],
  lists: () => [...padresKeys.all, 'list'],
  list: (filters) => [...padresKeys.lists(), { filters }],
  details: () => [...padresKeys.all, 'detail'],
  detail: (id) => [...padresKeys.details(), id],
};

// Servicio API para padres
const padresService = {
  // Obtener todos los padres con estudiantes
  getPadres: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_BASE_URL}/apoderado/estudiantes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });
    
    const responseData = response.data || {};
    return responseData.info?.data || responseData.apoderados || responseData.padres || [];
  },

  // Obtener padre por ID
  getPadreById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_BASE_URL}/apoderado/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.apoderado || response.data.padre;
  },

  // Crear padre
  createPadre: async (padreData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_BASE_URL}/apoderado`, padreData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.apoderado || response.data.padre;
  },

  // Actualizar padre
  updatePadre: async ({ id, ...padreData }) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.patch(`${API_BASE_URL}/apoderado/${id}`, padreData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.apoderado || response.data.padre;
  },

  // Eliminar padre
  deletePadre: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    await axios.delete(`${API_BASE_URL}/apoderado/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return id;
  },

  // Cambiar estado del padre
  togglePadreStatus: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.patch(`${API_BASE_URL}/apoderado/${id}/toggle-status`, {}, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.apoderado || response.data.padre;
  }
};

// Hook para obtener lista de padres
export const usePadres = (filters = {}) => {
  return useQuery({
    queryKey: padresKeys.list(filters),
    queryFn: () => padresService.getPadres(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook para obtener un padre por ID
export const usePadre = (id) => {
  return useQuery({
    queryKey: padresKeys.detail(id),
    queryFn: () => padresService.getPadreById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para crear padre
export const useCreatePadre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (padreData) => {
      let photoData = null;

      // Si hay una imagen, subirla primero a Cloudinary
      if (padreData.photoFile) {
        try {
          const uploadResult = await uploadStudentImage(padreData.photoFile);
          photoData = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            thumbnailUrl: uploadResult.thumbnailUrl,
            detailUrl: uploadResult.detailUrl
          };
        } catch (uploadError) {
          console.error('❌ Error al subir imagen:', uploadError);
          // Continuar sin imagen si falla la subida
          photoData = null;
        }
      }

      // Preparar datos finales
      const finalData = {
        ...padreData,
        photo: photoData || padreData.photo || null
      };
      delete finalData.photoFile;

      return padresService.createPadre(finalData);
    },
    onSuccess: (newPadre) => {
      // Invalidar y refetch de la lista de padres
      queryClient.invalidateQueries({ queryKey: padresKeys.lists() });
      
      toast.success('¡Padre/apoderado creado exitosamente!', {
        description: `${newPadre.nombre} ${newPadre.apellido} ha sido agregado al sistema`
      });
    },
    onError: (error) => {
      toast.error('Error al crear padre/apoderado', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

// Hook para actualizar padre
export const useUpdatePadre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...padreData }) => {
      let photoData = padreData.photo;

      // Si hay una nueva imagen, subirla primero
      if (padreData.photoFile) {
        try {
          const uploadResult = await uploadStudentImage(padreData.photoFile);
          photoData = {
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            thumbnailUrl: uploadResult.thumbnailUrl,
            detailUrl: uploadResult.detailUrl
          };
        } catch (uploadError) {
          console.error('❌ Error al subir nueva imagen:', uploadError);
          throw new Error('Error al subir la nueva imagen');
        }
      }

      // Preparar datos actualizados
      const finalData = {
        ...padreData,
        photo: photoData
      };
      delete finalData.photoFile;

      return padresService.updatePadre({ id, ...finalData });
    },
    onSuccess: (updatedPadre, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: padresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: padresKeys.detail(id) });
      
      // Mostrar mensaje de éxito, manejando el caso donde updatedPadre podría ser undefined
      const nombrePadre = updatedPadre?.nombre || 'Padre/Apoderado';
      const apellidoPadre = updatedPadre?.apellido || '';
      const nombreCompleto = apellidoPadre ? `${nombrePadre} ${apellidoPadre}` : nombrePadre;
      
      toast.success('Padre/apoderado actualizado exitosamente', {
        description: `Los datos de ${nombreCompleto} han sido actualizados`
      });
    },
    onError: (error) => {
      toast.error('Error al actualizar padre/apoderado', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

// Hook para eliminar padre
export const useDeletePadre = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: padresService.deletePadre,
    onSuccess: (deletedId) => {
      // Invalidar lista de padres
      queryClient.invalidateQueries({ queryKey: padresKeys.lists() });
      
      toast.success('Padre/apoderado eliminado exitosamente', {
        description: 'El registro ha sido eliminado del sistema'
      });
    },
    onError: (error) => {
      toast.error('Error al eliminar padre/apoderado', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

// Hook para cambiar estado del padre
export const useTogglePadreStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: padresService.togglePadreStatus,
    onSuccess: (updatedPadre) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: padresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: padresKeys.detail(updatedPadre.idApoderado || updatedPadre.id) });
      
      const newStatus = updatedPadre.estaActivo ? 'activado' : 'desactivado';
      toast.success(`¡Padre/apoderado ${newStatus} exitosamente!`, {
        description: `${updatedPadre.nombre} ${updatedPadre.apellido} ha sido ${newStatus}`
      });
    },
    onError: (error) => {
      toast.error('Error al cambiar estado del padre/apoderado', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};
