// src/hooks/usePensionesPadre.js
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store';
import axios from 'axios';

// Query Keys para pensiones de padre
const pensionesPadreKeys = {
  all: ['pensiones-padre'],
  apoderado: () => [...pensionesPadreKeys.all, 'apoderado'],
  pensiones: (apoderadoId) => [...pensionesPadreKeys.all, 'pensiones', apoderadoId]
};

/**
 * Hook personalizado para obtener pensiones de los hijos de un padre
 */
export const usePensionesPadre = () => {
  const { user } = useAuthStore();
  const [apoderadoId, setApoderadoId] = useState(null);

  // Query para obtener el apoderado con sus estudiantes
  const {
    data: apoderadoData,
    isLoading: loadingApoderado,
    error: errorApoderado
  } = useQuery({
    queryKey: pensionesPadreKeys.apoderado(),
    queryFn: async () => {
      const response = await axios.get('/api/v1/apoderado/estudiantes');
      return response.data;
    },
    enabled: !!user // Solo ejecutar si hay usuario
  });

  // Encontrar el apoderado correspondiente al usuario actual
  useEffect(() => {
    if (apoderadoData?.info?.data && user) {
      // Buscar el apoderado que tenga un estudiante con el mismo nombre que el usuario
      const apoderadoEncontrado = apoderadoData.info.data.find(apoderado =>
        apoderado.matriculas?.some(matricula =>
          matricula.idEstudiante?.nombre === user.nombre &&
          matricula.idEstudiante?.apellido === user.apellido
        )
      );

      if (apoderadoEncontrado) {
        setApoderadoId(apoderadoEncontrado.idApoderado);
      }
    }
  }, [apoderadoData, user]);

  // Query para obtener las pensiones del apoderado
  const {
    data: pensionesData,
    isLoading: loadingPensiones,
    error: errorPensiones,
    refetch: refetchPensiones
  } = useQuery({
    queryKey: pensionesPadreKeys.pensiones(apoderadoId),
    queryFn: async () => {
      if (!apoderadoId) return [];
      const response = await axios.get(`/api/v1/pension-estudiante/apoderado/${apoderadoId}`);
      return response.data;
    },
    enabled: !!apoderadoId // Solo ejecutar si tenemos el apoderadoId
  });

  return {
    // Datos
    pensiones: pensionesData || [],
    apoderado: apoderadoData?.info?.data?.find(apoderado =>
      apoderado.matriculas?.some(matricula =>
        matricula.idEstudiante?.nombre === user?.nombre &&
        matricula.idEstudiante?.apellido === user?.apellido
      )
    ),

    // Estados de carga
    loading: loadingApoderado || loadingPensiones,
    loadingApoderado,
    loadingPensiones,

    // Errores
    error: errorApoderado || errorPensiones,
    errorApoderado,
    errorPensiones,

    // Acciones
    refetchPensiones,

    // IDs útiles
    apoderadoId
  };
};
