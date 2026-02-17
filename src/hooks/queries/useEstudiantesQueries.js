// src/hooks/queries/useEstudiantesQueries.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { uploadStudentImage } from '../../services/cloudinaryService';

// Query keys para estudiantes
export const estudiantesKeys = {
  all: ['estudiantes'],
  lists: () => [...estudiantesKeys.all, 'list'],
  list: (filters) => [...estudiantesKeys.lists(), { filters }],
  details: () => [...estudiantesKeys.all, 'detail'],
  detail: (id) => [...estudiantesKeys.details(), id],
};

// Servicio API para estudiantes
const estudiantesService = {
  getEstudiantes: async (filters = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_BASE_URL}/estudiante`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      params: filters
    });
    
    const responseData = response.data || {};
    return responseData.estudiantes || [];
  },

  // Obtener estudiante por ID
  getEstudianteById: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_BASE_URL}/estudiante/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.estudiante;
  },

  // Crear estudiante
  createEstudiante: async (estudianteData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_BASE_URL}/estudiante`, estudianteData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.estudiante;
  },

  // Actualizar estudiante
  updateEstudiante: async ({ id, ...estudianteData }) => {
    console.log('🔧 Service updateEstudiante - ID recibido:', id);
    console.log('🔧 Service updateEstudiante - Datos:', estudianteData);
    
    if (!id) {
      throw new Error('ID del estudiante es requerido para actualizar');
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    const response = await axios.patch(`${API_BASE_URL}/estudiante/${id}`, estudianteData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return response.data.estudiante;
  },

  // Eliminar estudiante
  deleteEstudiante: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    await axios.delete(`${API_BASE_URL}/estudiante/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    return id;
  },

  // Cambiar estado del estudiante (desactivar)
  toggleEstudianteStatus: async (id) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const token = localStorage.getItem('token');
    
    console.log(`🔄 Cambiando estado del estudiante ID: ${id}`);
    
    const response = await axios.delete(`${API_BASE_URL}/estudiante/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    
    console.log('✅ Estado del estudiante actualizado:', response.data);
    return response.data;
  }
};

// Hook para obtener lista de estudiantes
export const useEstudiantes = (filters = {}) => {
  return useQuery({
    queryKey: estudiantesKeys.list(filters),
    queryFn: () => estudiantesService.getEstudiantes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// Hook para obtener un estudiante por ID
export const useEstudiante = (id) => {
  return useQuery({
    queryKey: estudiantesKeys.detail(id),
    queryFn: () => estudiantesService.getEstudianteById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// Hook para crear estudiante
export const useCreateEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (estudianteData) => {
      let photoData = null;

      // Si hay una imagen, subirla primero a Cloudinary
      if (estudianteData.photoFile) {
        try {
          const uploadResult = await uploadStudentImage(estudianteData.photoFile);
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
        ...estudianteData,
        photo: photoData || estudianteData.photo || null
      };
      delete finalData.photoFile;

      return estudiantesService.createEstudiante(finalData);
    },
    onSuccess: (newEstudiante) => {
      // Invalidar y refetch de la lista de estudiantes
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
      
      toast.success('¡Estudiante creado exitosamente!', {
        description: `${newEstudiante.nombre} ${newEstudiante.apellido} ha sido agregado al sistema`
      });
    },
    onError: (error) => {
      toast.error('Error al crear estudiante', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

// Hook para actualizar estudiante
export const useUpdateEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...estudianteData }) => {
      console.log('🔧 useUpdateEstudiante mutation - ID recibido:', id);
      console.log('🔧 useUpdateEstudiante mutation - Datos recibidos:', estudianteData);
      
      if (!id) {
        console.error('❌ ID del estudiante es undefined o null');
        throw new Error('ID del estudiante es requerido');
      }
      
      let photoData = estudianteData.photo;

      // Si hay una nueva imagen, subirla primero
      if (estudianteData.photoFile) {
        try {
          const uploadResult = await uploadStudentImage(estudianteData.photoFile);
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
        ...estudianteData,
        photo: photoData
      };
      delete finalData.photoFile;

      console.log('🔧 Datos finales a enviar:', finalData);
      return estudiantesService.updateEstudiante({ id, ...finalData });
    },
    onSuccess: (updatedEstudiante, { id }) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.detail(id) });
      
      toast.success('Estudiante actualizado exitosamente', {
        description: `Los datos de ${updatedEstudiante.nombre} ${updatedEstudiante.apellido} han sido actualizados`
      });
    },
    onError: (error) => {
      toast.error('Error al actualizar estudiante', {
        description: error.message || 'Ocurrió un error inesperado'
      });
    }
  });
};

// Hook para eliminar estudiante (desactivar)
export const useDeleteEstudiante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🔄 Desactivando estudiante ID:', id);
      
      if (!id) {
        console.error('❌ No se encontró ID del estudiante:', id);
        throw new Error('ID del estudiante no encontrado');
      }
      
      // Usar la función correcta del servicio que llama al DELETE endpoint
      return estudiantesService.toggleEstudianteStatus(id);
    },
    onMutate: () => {
      const loadingToast = toast.loading('Desactivando estudiante...', {
        description: 'Procesando desactivación...'
      });
      return { loadingToast };
    },
    onSuccess: (data, id, context) => {
      // Invalidar lista de estudiantes
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.detail(id) });
      
      toast.success('Estudiante desactivado exitosamente', {
        id: context.loadingToast,
        description: 'El estudiante ha sido desactivado del sistema'
      });
      
      console.log('✅ Estudiante desactivado y cache invalidado');
    },
    onError: (error, variables, context) => {
      toast.error('Error al desactivar estudiante', {
        id: context?.loadingToast,
        description: error.message || 'Ocurrió un error inesperado'
      });
      console.error('❌ Error al desactivar estudiante:', error);
    }
  });
};

// Hook para cambiar estado del estudiante
export const useToggleEstudianteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      console.log('🔄 Cambiando estado del estudiante ID:', id);
      
      if (!id) {
        console.error('❌ No se encontró ID del estudiante:', id);
        throw new Error('ID del estudiante no encontrado');
      }
      
      return estudiantesService.toggleEstudianteStatus(id);
    },
    onMutate: () => {
      const loadingToast = toast.loading('Cambiando estado del estudiante...', {
        description: 'Procesando cambio...'
      });
      return { loadingToast };
    },
    onSuccess: (data, id, context) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: estudiantesKeys.detail(id) });
      
      toast.success('¡Estado del estudiante actualizado exitosamente!', {
        id: context.loadingToast,
        description: 'El estado ha sido cambiado correctamente'
      });
      
      console.log('✅ Estado del estudiante actualizado y cache invalidado');
    },
    onError: (error, variables, context) => {
      toast.error('Error al cambiar estado del estudiante', {
        id: context?.loadingToast,
        description: error.message || 'Ocurrió un error inesperado'
      });
      console.error('❌ Error al cambiar estado del estudiante:', error);
    }
  });
};
