import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store";
import { useParentDashboard } from "../../hooks/useParentDashboard";
import {
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Bot,
  CircleUser,
} from "lucide-react";
import PageHeader from "../../components/common/PageHeader";

const ParentOverview = () => {
  const { user } = useAuthStore();
  const { dashboardData, loading, error, refreshData, estadisticas } =
    useParentDashboard();

  const studentData = {
    name: `${user?.nombre || ""} ${user?.apellido || ""}`,
    grade: "Los Pequeños Exploradores",
  };

  // Calcular estadísticas dinámicas basadas en datos reales
  const dynamicStats = [
    {
      title: "Total de Tareas",
      value: estadisticas.totalTareas.toString(),
      change: `${estadisticas.tareasCompletadas} completadas`,
      icon: BookOpen,
      color: "#3B82F6",
    },
    {
      title: "Tareas Pendientes",
      value: estadisticas.tareasPendientes.toString(),
      change: `${estadisticas.tareasVencidas} vencidas`,
      icon: CheckCircle,
      color: estadisticas.tareasVencidas > 0 ? "#EF4444" : "#10B981",
    },
    {
      title: "¡Qué bien lo estás haciendo!",
      value:
        estadisticas.promedioCompletitud >= 80
          ? "¡Excelente!"
          : estadisticas.promedioCompletitud >= 60
          ? "¡Muy bien!"
          : "¡Ánimo!",
      change: "¡Sigue así!",
      icon: Star,
      color:
        estadisticas.promedioCompletitud >= 80
          ? "#10B981"
          : estadisticas.promedioCompletitud >= 60
          ? "#F59E0B"
          : "#EF4444",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader title="Panel Familiar" theme="yellow" />

      {/* Información del hijo */}
      <div className="bg-gradient-to-r from-yellow-200 to-yellow-100 rounded-xl p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-yellow-600 shadow bg-yellow-100 flex items-center justify-center">
          <CircleUser className="w-12 h-12 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">
            {studentData.name}
          </h3>
          <p className="text-blue-600 font-medium">{studentData.grade}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl mb-1">
            {estadisticas.tareasVencidas === 0
              ? "🌟"
              : estadisticas.tareasVencidas <= 2
              ? "⭐"
              : "⚠️"}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {estadisticas.tareasVencidas === 0
              ? "Excelente"
              : estadisticas.tareasVencidas <= 2
              ? "Bueno"
              : "Atención"}
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {dynamicStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const isTaskCard = index < 2;

          return (
            <Link
              key={index}
              to={isTaskCard ? "/parent/tareas" : "#"}
              className={`bg-white p-4 lg:p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                isTaskCard ? "cursor-pointer hover:bg-yellow-50" : ""
              }`}
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
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{stat.title}</p>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              {isTaskCard && (
                <div className="mt-3 text-xs text-green-600 font-medium">
                  Click para ver detalles →
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Asistente IA Quick Access */}
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl shadow-sm p-4 lg:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-600 bg-opacity-20 rounded-lg">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Asistente IA Educativo</h3>
              <p className="text-yellow-100">
                ¿Necesitas ayuda con el aprendizaje de tu hijo o consejos
                educativos?
              </p>
            </div>
          </div>
          <Link
            to="/parent/iachat"
            className="bg-white text-yellow-600 hover:bg-yellow-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
          >
            DIsponible pronto...
          </Link>
        </div>
      </div>

      {/* Tareas recientes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-100">
          <Link
            to="/parent/tareas"
            className="flex items-center space-x-2 text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-yellow-500" />
            <span>Tareas Recientes</span>
          </Link>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>
        <div className="p-4 lg:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-yellow-600" />
              <span className="ml-2 text-gray-600">Cargando tareas...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <span className="ml-2 text-red-600">
                Error al cargar tareas: {error}
              </span>
            </div>
          ) : dashboardData.tareas && dashboardData.tareas.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.tareas.slice(0, 5).map((tarea, index) => (
                <div
                  key={tarea.id || index}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <span className="text-lg">{tarea.emoji || "📝"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {tarea.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {tarea.subject} • Vence:{" "}
                      {new Date(tarea.fechaEntrega).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      tarea.status === "completed" || tarea.realizoTarea
                        ? "bg-green-100 text-green-800"
                        : tarea.isOverdue
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tarea.status === "completed" || tarea.realizoTarea
                      ? "Completada"
                      : tarea.isOverdue
                      ? "Vencida"
                      : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <BookOpen className="w-8 h-8 text-gray-400" />
              <span className="ml-2 text-gray-600">
                No hay tareas disponibles
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Próximas actividades */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Próximas Actividades
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/parent/tareas"
            className="bg-white rounded-lg p-4 border border-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Revisar Tareas Pendientes
                </p>
                <p className="text-sm text-gray-600">
                  Accede a la sección de Actividades
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/parent/iachat"
            className="bg-white rounded-lg p-4 border border-purple-100 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Consultar Asistente IA
                </p>
                <p className="text-sm text-gray-600">
                  Obtén ayuda educativa personalizada
                </p>
              </div>
            </div>
          </Link>
          <Link
            to="/parent/juegos"
            className="bg-white rounded-lg p-4 border border-green-100 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Jugar Juegos Educativos
                </p>
                <p className="text-sm text-gray-600">
                  ¡Aprende jugando con diversión!
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParentOverview;
