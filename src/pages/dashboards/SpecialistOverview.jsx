import React from "react";
import { Link } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useAuthStore } from "../../store";
import {
  Brain,
  Users,
  FileText,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  HeartPulse,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

const SidebarToggle = () => {
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useOutletContext() || {};
  if (typeof setIsSidebarCollapsed !== "function") return null;
  return (
    <button
      className="hidden lg:flex p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
    >
      {isSidebarCollapsed ? (
        <PanelLeftOpen className="w-5 h-5" />
      ) : (
        <PanelLeftClose className="w-5 h-5" />
      )}
    </button>
  );
};

const SpecialistOverview = () => {
  const { user } = useAuthStore();

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    {
      title: "Evaluaciones Activas",
      value: "—",
      sub: "en seguimiento",
      icon: Brain,
      color: "#0d9488",
    },
    {
      title: "Estudiantes Asignados",
      value: "—",
      sub: "casos activos",
      icon: Users,
      color: "#3B82F6",
    },
    {
      title: "Informes Pendientes",
      value: "—",
      sub: "por completar",
      icon: FileText,
      color: "#F59E0B",
    },
    {
      title: "Sesiones Este Mes",
      value: "—",
      sub: "programadas",
      icon: CalendarDays,
      color: "#10B981",
    },
  ];

  const quickLinks = [
    {
      label: "Nueva Evaluación",
      desc: "Registrar evaluación psicopedagógica",
      to: "/specialist/evaluaciones",
      icon: Brain,
      color: "darkgreen",
    },
    {
      label: "Mis Estudiantes",
      desc: "Ver listado de estudiantes asignados",
      to: "/specialist/estudiantes",
      icon: Users,
      color: "blue",
    },
    {
      label: "Anotaciones",
      desc: "Registrar observaciones del día",
      to: "/specialist/anotaciones",
      icon: ClipboardList,
      color: "green",
    },
    {
      label: "Informes",
      desc: "Gestionar reportes e informes",
      to: "/specialist/informes",
      icon: FileText,
      color: "yellow",
    },
    {
      label: "Cronograma",
      desc: "Ver agenda y sesiones programadas",
      to: "/specialist/cronograma",
      icon: CalendarDays,
      color: "indigo",
    },
    {
      label: "Observaciones",
      desc: "Registro de observaciones generales",
      to: "/specialist/observaciones",
      icon: HeartPulse,
      color: "pink",
    },
  ];

  const colorMap = {
    darkgreen: { bg: "bg-teal-50", border: "border-teal-200", icon: "text-teal-600", hover: "hover:border-green-400" },
    blue: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", hover: "hover:border-blue-300" },
    green: { bg: "bg-teal-50", border: "border-teal-100", icon: "text-teal-500", hover: "hover:border-green-300" },
    yellow: { bg: "bg-yellow-50", border: "border-yellow-100", icon: "text-yellow-600", hover: "hover:border-yellow-300" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-100", icon: "text-indigo-600", hover: "hover:border-indigo-300" },
    pink: { bg: "bg-pink-50", border: "border-pink-100", icon: "text-pink-600", hover: "hover:border-pink-300" },
  };

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* HEADER */}
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
      </div>

      {/* BANNER */}
      <div className="bg-linear-to-r from-teal-600 to-green-500 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div className="text-white">
          <p className="text-sm font-medium text-white/80 mb-1">Panel de Especialista</p>
          <h2 className="text-xl font-bold">
            {user?.nombre || ""} {user?.apellido || ""}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Gestión psicopedagógica y seguimiento estudiantil
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <Brain className="w-9 h-9 text-white" />
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK ACCESS */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const c = colorMap[link.color];
            const IconComponent = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`group flex items-center gap-4 bg-white rounded-xl border ${c.border} ${c.hover} p-4 hover:shadow-md transition-all duration-200`}
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                  <IconComponent className={`w-6 h-6 ${c.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{link.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{link.desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SpecialistOverview;
