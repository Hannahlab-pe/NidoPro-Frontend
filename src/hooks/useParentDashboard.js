import { useState, useEffect } from 'react';
import { useTareasEstudiante } from './useTareasEstudiante';

/**
 * Hook personalizado para el dashboard de padres
 * Proporciona datos consolidados para el panel familiar
 */
export const useParentDashboard = () => {
  const { tareas, loading: tareasLoading, error: tareasError, refrescarTareas } = useTareasEstudiante();
  const [dashboardData, setDashboardData] = useState({
    tareas: [],
    estadisticas: {
      totalTareas: 0,
      tareasCompletadas: 0,
      tareasPendientes: 0,
      tareasVencidas: 0,
      promedioCompletitud: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calcular estadísticas basadas en las tareas
  useEffect(() => {
    if (tareas && Array.isArray(tareas)) {
      const totalTareas = tareas.length;
      const tareasCompletadas = tareas.filter(tarea =>
        tarea.status === 'completed' || tarea.realizoTarea
      ).length;
      const tareasPendientes = tareas.filter(tarea =>
        tarea.status === 'pending' && !tarea.isOverdue
      ).length;
      const tareasVencidas = tareas.filter(tarea => tarea.isOverdue).length;

      const promedioCompletitud = totalTareas > 0
        ? Math.round((tareasCompletadas / totalTareas) * 100)
        : 0;

      setDashboardData({
        tareas,
        estadisticas: {
          totalTareas,
          tareasCompletadas,
          tareasPendientes,
          tareasVencidas,
          promedioCompletitud
        }
      });
    }
  }, [tareas]);

  // Manejar estados de carga y error
  useEffect(() => {
    setLoading(tareasLoading);
    setError(tareasError);
  }, [tareasLoading, tareasError]);

  /**
   * Refrescar todos los datos del dashboard
   */
  const refreshData = async () => {
    await refrescarTareas();
  };

  return {
    dashboardData,
    loading,
    error,
    refreshData,
    tareas: dashboardData.tareas,
    estadisticas: dashboardData.estadisticas
  };
};

export default useParentDashboard;
