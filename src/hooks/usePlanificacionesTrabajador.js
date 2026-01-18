import { useState, useEffect } from 'react';
import { planificacionService } from '../services/planificacionService';

export const usePlanificacionesTrabajador = (idTrabajador) => {
  const [planificaciones, setPlanificaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlanificaciones = async () => {
    if (!idTrabajador) {
      setPlanificaciones([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await planificacionService.getPlanificacionesTrabajador(idTrabajador);
      setPlanificaciones(response || []);
    } catch (err) {
      console.error('Error al obtener planificaciones del trabajador:', err);
      setError(err.response?.data?.message || 'Error al obtener planificaciones');
      setPlanificaciones([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanificaciones();
  }, [idTrabajador]);

  return {
    planificaciones,
    isLoading,
    error,
    refetch: fetchPlanificaciones,
  };
};
