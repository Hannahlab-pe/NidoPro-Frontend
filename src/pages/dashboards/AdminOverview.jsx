import React from "react";
import { useOutletContext } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { useAuthStore } from "../../store";
import {
  DashboardBarChart,
  CategoryPieChart,
} from "../../components/charts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

// Componente aislado: solo él re-renderiza cuando cambia el estado del sidebar
const SidebarToggle = () => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useOutletContext() || {};
  if (typeof setIsSidebarCollapsed !== "function") return null;
  return (
    <button
      className="hidden lg:flex p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
    >
      {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
    </button>
  );
};

const AdminOverview = () => {
  const { user } = useAuthStore();
  const {
    stats,
    loading: dashboardLoading,
    error: dashboardError,
    dashboardData,
    financialStats,
  } = useAdminDashboard();

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        {dashboardLoading && (
          <div className="flex items-center gap-2 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full self-start sm:self-auto">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-xs font-medium">Actualizando...</span>
          </div>
        )}
      </div>

      {/* ── ERROR ── */}
      {dashboardError && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
          <span className="text-red-700 text-sm">{dashboardError}</span>
        </div>
      )}

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
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
                {stat.loading ? (
                  <div className="animate-pulse bg-gray-200 h-7 w-20 rounded-lg"></div>
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

      {/* ── RESUMEN FINANCIERO ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-800">Resumen Financiero del Mes</h2>
          <p className="text-xs text-gray-400 mt-0.5">Movimientos registrados en caja</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

          {/* Ingresos */}
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Ingresos
              </p>
              {dashboardLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-24 rounded-lg"></div>
              ) : (
                <p className="text-xl font-bold text-green-600">
                  S/ {financialStats.ingresosMes?.toLocaleString() || 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Movimientos positivos</p>
            </div>
          </div>

          {/* Egresos */}
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Egresos
              </p>
              {dashboardLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-24 rounded-lg"></div>
              ) : (
                <p className="text-xl font-bold text-red-500">
                  S/ {financialStats.egresosMes?.toLocaleString() || 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">Movimientos negativos</p>
            </div>
          </div>

          {/* Utilidad */}
          <div className="p-6 flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                financialStats.utilidadMes >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <DollarSign
                className={`w-5 h-5 ${
                  financialStats.utilidadMes >= 0 ? "text-green-600" : "text-red-500"
                }`}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Utilidad
              </p>
              {dashboardLoading ? (
                <div className="animate-pulse bg-gray-200 h-6 w-24 rounded-lg"></div>
              ) : (
                <p
                  className={`text-xl font-bold ${
                    financialStats.utilidadMes >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  S/ {financialStats.utilidadMes?.toLocaleString() || 0}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">
                {financialStats.utilidadMes >= 0 ? "Resultado positivo" : "Resultado negativo"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── BANNER IA ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-blue-600" />
        </div>
        <p className="text-sm text-blue-700 font-medium flex-1">Asistente IA Administrativo</p>
        <span className="flex items-center gap-1 text-xs font-medium text-blue-500 bg-white border border-blue-200 px-3 py-1 rounded-full shrink-0">
          <Sparkles className="w-3 h-3" /> Próximamente
        </span>
      </div>

      {/* ── GRÁFICOS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 pb-4">
          <DashboardBarChart
            data={[
              {
                name: "Estudiantes",
                activos: dashboardData.estudiantes.activos,
                inactivos: dashboardData.estudiantes.inactivos,
              },
              {
                name: "Trabajadores",
                activos: dashboardData.trabajadores.activos,
                inactivos: dashboardData.trabajadores.inactivos,
              },
            ]}
            title="Estadísticas de Personal"
            height={280}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <CategoryPieChart
            data={[
              {
                name: "Docentes",
                value: Math.round(dashboardData.trabajadores.activos * 0.7),
                color: "#3b82f6",
              },
              {
                name: "Administrativos",
                value: Math.round(dashboardData.trabajadores.activos * 0.2),
                color: "#10b981",
              },
              {
                name: "Auxiliares",
                value: Math.round(dashboardData.trabajadores.activos * 0.1),
                color: "#f59e0b",
              },
            ]}
            title="Distribución de Trabajadores"
            height={280}
          />
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;
