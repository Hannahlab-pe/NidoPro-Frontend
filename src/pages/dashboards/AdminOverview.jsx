import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";
import { useAuthStore } from "../../store";
import {
  DashboardBarChart,
  FinancialTrendChart,
  CategoryPieChart,
} from "../../components/charts";
import { TrendingUp, DollarSign, RefreshCw, Bot, PanelLeftClose, PanelLeftOpen } from "lucide-react";

// Componente aislado: solo él re-renderiza cuando cambia el estado del sidebar
const SidebarToggle = () => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useOutletContext() || {};
  if (typeof setIsSidebarCollapsed !== "function") return null;
  return (
    <button
      className="hidden lg:flex p-2 text-gray-500 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50"
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

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarToggle />
          <h1 className="text-5xl font-bold text-gray-700">
            Bienvenido, {user?.nombre || ""}
          </h1>
        </div>
        {dashboardLoading && (
          <div className="flex items-center space-x-2 text-blue-600">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Actualizando datos...</span>
          </div>
        )}
      </div>

      {/* Mostrar errores si existen */}
      {dashboardError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-800 text-sm">{dashboardError}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                  {stat.loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 rounded"></div>
                  ) : (
                    stat.value
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.loading ? "..." : stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estadísticas Financieras Detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ingresos del Mes
            </h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600 mb-2">
            {dashboardLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 rounded w-24"></div>
            ) : (
              `S/ ${financialStats.ingresosMes?.toLocaleString() || 0}`
            )}
          </div>
          <p className="text-sm text-gray-600">Movimientos positivos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Egresos del Mes
            </h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-red-600 transform rotate-180" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600 mb-2">
            {dashboardLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 rounded w-24"></div>
            ) : (
              `S/ ${financialStats.egresosMes?.toLocaleString() || 0}`
            )}
          </div>
          <p className="text-sm text-gray-600">Movimientos negativos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Utilidad del Mes
            </h3>
            <div
              className={`p-2 rounded-lg ${
                financialStats.utilidadMes >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <DollarSign
                className={`w-5 h-5 ${
                  financialStats.utilidadMes >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>
          </div>
          <div
            className={`text-2xl font-bold mb-2 ${
              financialStats.utilidadMes >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {dashboardLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 rounded w-24"></div>
            ) : (
              `S/ ${financialStats.utilidadMes?.toLocaleString() || 0}`
            )}
          </div>
          <p className="text-sm text-gray-600">
            {financialStats.utilidadMes >= 0
              ? "Resultado positivo"
              : "Resultado negativo"}
          </p>
        </div>
      </div>

      {/* Asistente IA Quick Access */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl shadow-sm p-4 lg:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-900 bg-opacity-20 rounded-lg">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Asistente IA Administrativo
              </h3>
              <p className="text-blue-100">
                ¿Necesitas ayuda con análisis financiero o gestión
                institucional?
              </p>
            </div>
          </div>
          <Link
            to="/admin/ai-chat"
            className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            DIsponible pronto...
          </Link>
        </div>
      </div>

      {/* Gráficos y Visualizaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <DashboardBarChart
          data={[
            {
              name: "Estudiantes",
              total: dashboardData.estudiantes.total,
              activos: dashboardData.estudiantes.activos,
              inactivos: dashboardData.estudiantes.inactivos,
            },
            {
              name: "Trabajadores",
              total: dashboardData.trabajadores.total,
              activos: dashboardData.trabajadores.activos,
              inactivos: dashboardData.trabajadores.inactivos,
            },
          ]}
          title="Estadísticas de Personal"
          height={350}
        />

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
          height={350}
        />
      </div>

      {/* Gráfico de tendencias financieras - Ancho completo */}
      <div className="mb-6">
        <FinancialTrendChart
          data={[
            {
              mes: "Ago",
              ingresos: financialStats.ingresosMes * 0.8,
              egresos: financialStats.egresosMes * 0.9,
              utilidad:
                financialStats.ingresosMes * 0.8 -
                financialStats.egresosMes * 0.9,
            },
            {
              mes: "Sep",
              ingresos: financialStats.ingresosMes * 0.9,
              egresos: financialStats.egresosMes * 0.85,
              utilidad:
                financialStats.ingresosMes * 0.9 -
                financialStats.egresosMes * 0.85,
            },
            {
              mes: "Oct",
              ingresos: financialStats.ingresosMes * 1.1,
              egresos: financialStats.egresosMes * 0.95,
              utilidad:
                financialStats.ingresosMes * 1.1 -
                financialStats.egresosMes * 0.95,
            },
            {
              mes: "Nov",
              ingresos: financialStats.ingresosMes * 1.2,
              egresos: financialStats.egresosMes * 1.0,
              utilidad:
                financialStats.ingresosMes * 1.2 -
                financialStats.egresosMes * 1.0,
            },
            {
              mes: "Dic",
              ingresos: financialStats.ingresosMes,
              egresos: financialStats.egresosMes,
              utilidad: financialStats.utilidadMes,
            },
          ]}
          title="Tendencias Financieras Mensuales"
          height={400}
        />
      </div>
    </div>
  );
};

export default AdminOverview;
