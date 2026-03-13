import React, { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuthStore } from "../../store";
import { useTeacherDashboard } from "../../hooks/useTeacherDashboard";
import {
  StudentsByClassroomChart,
  GradesDistributionChart,
} from "../../components/charts/TeacherCharts";
import {
  Users,
  School,
  GraduationCap,
  BarChart3,
  RefreshCw,
  Bot,
  Sparkles,
  ArrowUpRight,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const SidebarToggle = () => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useOutletContext() || {};
  if (typeof setIsSidebarCollapsed !== "function") return null;
  return (
    <button
      className="hidden lg:flex p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
    >
      {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
    </button>
  );
};

const TeacherOverview = () => {
  const { user } = useAuthStore();
  const { chartData, dashboardData, loading, error, refreshData } =
    useTeacherDashboard();

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dynamicStats = useMemo(() => {
    const estudiantesData = dashboardData?.estudiantes?.porAula || {};
    const aulasData = dashboardData?.aulas?.data || [];
    const totalEstudiantes = Object.values(estudiantesData).reduce(
      (total, estudiantes) =>
        total + (Array.isArray(estudiantes) ? estudiantes.length : 0),
      0
    );
    const totalAulas = aulasData.length;
    return [
      {
        title: "Mis Estudiantes",
        value: totalEstudiantes.toString(),
        sub: `${totalAulas} aulas`,
        icon: Users,
        color: "#3B82F6",
      },
      {
        title: "Mis Aulas",
        value: totalAulas.toString(),
        sub: "Asignadas",
        icon: School,
        color: "#10B981",
      },
      {
        title: "Promedio por Aula",
        value:
          totalAulas > 0
            ? Math.round(totalEstudiantes / totalAulas).toString()
            : "0",
        sub: "estudiantes",
        icon: GraduationCap,
        color: "#F59E0B",
      },
      {
        title: "Total Registros",
        value: (totalEstudiantes + totalAulas).toString(),
        sub: "activos",
        icon: BarChart3,
        color: "#8B5CF6",
      },
    ];
  }, [dashboardData]);

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <SidebarToggle />
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
              Bienvenido, {user?.nombre || ""}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5 capitalize">{today}</p>
          </div>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">Actualizando...</span>
          </div>
        )}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 hover:shadow-md transition-shadow"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
              >
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                  {stat.title}
                </p>
                {loading ? (
                  <div className="animate-pulse bg-gray-200 h-7 w-16 rounded-lg"></div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                )}
              </div>
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}12` }}
              >
                <ArrowUpRight className="w-4 h-4" style={{ color: stat.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BANNER IA ── */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-sm text-emerald-700 font-medium flex-1">Asistente IA Educativo</p>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-white border border-emerald-200 px-3 py-1 rounded-full shrink-0">
          <Sparkles className="w-3 h-3" /> Próximamente
        </span>
      </div>

      {/* ── GRÁFICOS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Estadísticas</p>
            <h3 className="text-base font-semibold text-gray-800">Mis Aulas</h3>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-40 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <span className="ml-2 text-sm text-gray-500">Cargando datos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentsByClassroomChart data={chartData} />
              <GradesDistributionChart data={chartData} />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeacherOverview;
