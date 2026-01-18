import { useState, useEffect, useMemo } from 'react';
import { useStudents } from './useStudents';
import { useTrabajadores } from './useTrabajadores';
import { useAulasDashboard } from './useAulasDashboard';
import { Users, GraduationCap, BookOpen, DollarSign } from 'lucide-react';
import cajaService from '../services/cajaService';

/**
 * Hook personalizado para el dashboard administrativo
 * Obtiene datos reales de estudiantes, trabajadores y finanzas
 */
export const useAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    estudiantes: {
      total: 0,
      activos: 0,
      inactivos: 0,
      loading: true
    },
    trabajadores: {
      total: 0,
      activos: 0,
      inactivos: 0,
      loading: true
    },
    finanzas: {
      saldoActual: 0,
      ingresosMes: 0,
      egresosMes: 0,
      loading: true
    }
  });

  const [error, setError] = useState(null);

  // Usar hooks existentes
  const { students, loading: studentsLoading, statistics: studentsStats } = useStudents();
  const { trabajadores, loading: trabajadoresLoading, statistics: trabajadoresStats } = useTrabajadores();
  const { statistics: aulasStats } = useAulasDashboard();

  // Función para obtener datos financieros
  const fetchFinancialData = async () => {
    try {
      const response = await cajaService.obtenerDashboardFinanciero();

      if (response.success) {
        const data = response.dashboard;
        setDashboardData(prev => ({
          ...prev,
          finanzas: {
            saldoActual: data.saldoActual?.saldo || 0,
            ingresosMes: parseFloat(data.movimientosMes?.ingresos_mes || 0),
            egresosMes: parseFloat(data.movimientosMes?.egresos_mes || 0),
            loading: false
          }
        }));
      }
    } catch (error) {
      console.error('Error obteniendo datos financieros:', error);
      setDashboardData(prev => ({
        ...prev,
        finanzas: {
          ...prev.finanzas,
          loading: false
        }
      }));
    }
  };

  // Actualizar datos cuando cambien los hooks
  useEffect(() => {
    setDashboardData(prev => ({
      ...prev,
      estudiantes: {
        total: studentsStats.total || 0,
        activos: studentsStats.active || 0,
        inactivos: studentsStats.inactive || 0,
        loading: studentsLoading
      }
    }));
  }, [studentsStats.total, studentsStats.active, studentsStats.inactive, studentsLoading]);

  useEffect(() => {
    setDashboardData(prev => ({
      ...prev,
      trabajadores: {
        total: trabajadoresStats.total || 0,
        activos: trabajadoresStats.active || 0,
        inactivos: trabajadoresStats.inactive || 0,
        loading: trabajadoresLoading
      }
    }));
  }, [trabajadoresStats.total, trabajadoresStats.active, trabajadoresStats.inactive, trabajadoresLoading]);

  // Cargar datos financieros al montar
  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Función para refrescar todos los datos
  const refreshData = async () => {
    try {
      setError(null);
      await fetchFinancialData();
    } catch (error) {
      setError('Error al refrescar los datos del dashboard');
      console.error('Error refreshing dashboard data:', error);
    }
  };

  // Memoizar estadísticas para evitar re-renders infinitos
  const stats = useMemo(() => [
    {
      title: "Total Estudiantes",
      value: dashboardData.estudiantes.total.toString(),
      icon: Users,
      color: "#3B82F6",
      change: dashboardData.estudiantes.loading ? "..." : "+5%",
      loading: dashboardData.estudiantes.loading
    },
    {
      title: "Profesores Activos",
      value: dashboardData.trabajadores.activos.toString(),
      icon: GraduationCap,
      color: "#10B981",
      change: dashboardData.trabajadores.loading ? "..." : "+2%",
      loading: dashboardData.trabajadores.loading
    },
    {
      title: "Aulas Disponibles",
      value: aulasStats.total.toString(),
      icon: BookOpen,
      color: "#F59E0B",
      change: "+1",
      loading: aulasStats.loading
    },
    {
      title: "Saldo Actual",
      value: `S/ ${dashboardData.finanzas.saldoActual.toLocaleString()}`,
      icon: DollarSign,
      color: "#EF4444",
      change: dashboardData.finanzas.loading ? "..." : "+8%",
      loading: dashboardData.finanzas.loading
    },
  ], [dashboardData, aulasStats]);

  // Memoizar estadísticas financieras
  const financialStats = useMemo(() => ({
    ingresosMes: dashboardData.finanzas.ingresosMes,
    egresosMes: dashboardData.finanzas.egresosMes,
    saldoActual: dashboardData.finanzas.saldoActual,
    utilidadMes: dashboardData.finanzas.ingresosMes - dashboardData.finanzas.egresosMes
  }), [dashboardData.finanzas]);

  return {
    // Datos del dashboard
    stats,
    dashboardData,

    // Estados de carga
    loading: dashboardData.estudiantes.loading || dashboardData.trabajadores.loading || dashboardData.finanzas.loading,

    // Datos detallados
    students,
    trabajadores,

    // Funciones
    refreshData,

    // Estadísticas financieras detalladas
    financialStats,

    // Error handling
    error
  };
};

export default useAdminDashboard;
