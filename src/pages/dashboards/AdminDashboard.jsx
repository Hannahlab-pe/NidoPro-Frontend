import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuthStore } from "../../store";
import { useAdminDashboard } from "../../hooks/useAdminDashboard";

import {
  DashboardBarChart,
  FinancialTrendChart,
  CategoryPieChart,
} from "../../components/charts";
import {
  BarChart3,
  Users as UsersIcon,
  GraduationCap,
  UserCheck,
  BookOpen,
  DollarSign,
  FileText,
  Settings,
  School,
  LogOut,
  Banknote,
  CircleUser,
  Baby,
  Search,
  TrendingUp,
  Banana,
  Calendar,
  Clock,
  ChevronRight,
  Menu,
  X,
  ClipboardList,
  Award,
  RefreshCw,
  MessageCircle,
  Bot,
  Shield,
} from "lucide-react";

// Importar todos los componentes de administración
import Estudiantes from "../admin/estudiantes/Estudiantes";
import Matricula from "../admin/matricula/Matricula";
import Trabajadores from "../admin/trabajadores/Trabajadores";
import Padres from "../admin/padres/Padres";
import AsignacionAula from "../admin/aulas/AsignacionAula";
import Aulas from "../admin/aulas/Aulas";
import GestionFinanciera from "../admin/finanzas/GestionFinanciera";
import MovimientosCaja from "../admin/finanzas/movimientos/MovimientosCaja";
import PagosPensiones from "../admin/finanzas/pensiones/PagosPensiones";
import PagosMatriculas from "../admin/finanzas/matriculas/PagosMatriculas";
import PagosPlanillas from "../admin/finanzas/planillas/PagosPlanillas";
import Reportes from "../admin/reportes/Reportes";
import Configuraciones from "../admin/configuraciones/Configuracion";
import Usuarios from "../admin/usuarios/Usuarios";
import Planificaciones from "../admin/planificaciones/Planificaciones";
import Grados from "../admin/grados/aulas";
import Pensiones from "../admin/pensiones/pensiones";
import Cursos from "../admin/cursos/Cursos";
import Contratos from "../admin/contratos/Contratos";
import Planilla from "../admin/planilla/Planilla";
import Cronogramas from "../admin/cronogramas/Cronogramas";
import EvaluacionDocente from "../admin/evaluacion/EvaluacionDocente";
import AnioEscolar from "../admin/anioescolar/AnioEscolar";
import Seguros from "../admin/seguros/Seguros";
import AIChat from "../admin/iachat/AIChat";
import BimestralDocente from "../admin/bimestralDocente/BimestralDocente";
import Roles from "../admin/roles/Roles";
import AsignacionCursos from "../admin/asignacion-cursos/AsignacionCursos";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [financeComponent, setFinanceComponent] = useState("GestionFinanciera");
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout, user } = useAuthStore();

  // Usar el hook personalizado para obtener datos reales del dashboard
  const {
    stats,
    loading: dashboardLoading,
    refreshData,
    error: dashboardError,
    dashboardData,
    financialStats,
    students, // Agregar estudiantes para debug
  } = useAdminDashboard();

  // Effect para escuchar eventos de cambio de vista en finanzas
  React.useEffect(() => {
    const handleFinanceViewChange = (event) => {
      setFinanceComponent(event.detail.component);
    };

    window.addEventListener("changeFinanceView", handleFinanceViewChange);
    return () => {
      window.removeEventListener("changeFinanceView", handleFinanceViewChange);
    };
  }, []);

  const menuItems = [
    // 📊 DASHBOARD PRINCIPAL
    {
      id: "overview",
      label: "Panel Principal",
      icon: BarChart3,
      category: "dashboard",
    },

    // 👥 GESTIÓN DE PERSONAS (Lo más usado día a día)
    {
      id: "students",
      label: "Estudiantes",
      icon: CircleUser,
      category: "personas",
    },
    {
      id: "parents",
      label: "Padres de Familia",
      icon: UserCheck,
      category: "personas",
    },
    {
      id: "trabajadores",
      label: "Trabajadores",
      icon: UsersIcon,
      category: "personas",
    },

    // 📚 GESTIÓN ACADÉMICA (Operaciones diarias)
    {
      id: "matricula",
      label: "Matrícula",
      icon: GraduationCap,
      category: "academico",
    },
    {
      id: "asignacion-aula",
      label: "Asignación de Aulas",
      icon: School,
      category: "academico",
    },
    {
      id: "asignacion-cursos",
      label: "Asignación de Cursos",
      icon: UserCheck,
      category: "academico",
    },
    {
      id: "planificaciones",
      label: "Planificaciones",
      icon: FileText,
      category: "academico",
    },
    {
      id: "cronogramas",
      label: "Cronogramas",
      icon: Clock,
      category: "academico",
    },

    // 📝 EVALUACIÓN Y SEGUIMIENTO
    {
      id: "evaluacion-docente",
      label: "Comentarios Docente",
      icon: Award,
      category: "evaluacion",
    },
    {
      id: "bimestral-docente",
      label: "Evaluación Bimestral",
      icon: ClipboardList,
      category: "evaluacion",
    },

    // 💰 GESTIÓN FINANCIERA (Importante para admin)
    {
      id: "finances",
      label: "Caja y Movimientos",
      icon: DollarSign,
      category: "finanzas",
    },
    {
      id: "pensiones",
      label: "Pensiones",
      icon: Banknote,
      category: "finanzas",
    },

    // � GESTIÓN DE PERSONAS
    {
      id: "students",
      label: "Estudiantes",
      icon: CircleUser,
      category: "personas",
    },
    {
      id: "parents",
      label: "Padres de Familia",
      icon: UserCheck,
      category: "personas",
    },
    {
      id: "trabajadores",
      label: "Trabajadores",
      icon: UsersIcon,
      category: "personas",
    },
    {
      id: "roles",
      label: "Roles del Sistema",
      icon: Shield,
      category: "personas",
    },

    // 📚 ACADÉMICO
    {
      id: "matricula",
      label: "Matrícula",
      icon: GraduationCap,
      category: "academico",
    },
    {
      id: "asignacion-cursos",
      label: "Asignación de Cursos",
      icon: UserCheck,
      category: "academico",
    },
    {
      id: "planificaciones",
      label: "Planificaciones",
      icon: FileText,
      category: "academico",
    },
    {
      id: "cronogramas",
      label: "Cronogramas",
      icon: Clock,
      category: "academico",
    },
    {
      id: "evaluacion-docente",
      label: "Comentario Docente",
      icon: Award,
      category: "academico",
    },

    // 🏫 INFRAESTRUCTURA
    {
      id: "aulas",
      label: "Gestión de Aulas",
      icon: School,
      category: "infraestructura",
    },
    {
      id: "asignacion-aula",
      label: "Asignación de Aulas",
      icon: BookOpen,
      category: "infraestructura",
    },

    // 📄 ADMINISTRATIVO
    {
      id: "contratos",
      label: "Contratos",
      icon: FileText,
      category: "administrativo",
    },
    {
      id: "planilla",
      label: "Planilla",
      icon: ClipboardList,
      category: "administrativo",
    },
    {
      id: "seguros",
      label: "Tipos de Seguro",
      icon: Shield,
      category: "administrativo",
    },
    {
      id: "reports",
      label: "Reportes",
      icon: BarChart3,
      category: "reportes",
    },
    {
      id: "ai-chat",
      label: "Asistente IA",
      icon: MessageCircle,
      category: "herramientas",
    },
    {
      id: "users",
      label: "Usuarios del Sistema",
      icon: UsersIcon,
      category: "usuarios",
    },
    {
      id: "roles",
      label: "Roles y Permisos",
      icon: Shield,
      category: "usuarios",
    },
    {
      id: "anio-escolar",
      label: "Periodo Escolar",
      icon: Calendar,
      category: "configuracion",
    },
    {
      id: "grados",
      label: "Grados Académicos",
      icon: School,
      category: "configuracion",
    },
    {
      id: "cursos",
      label: "Cursos y Materias",
      icon: BookOpen,
      category: "configuracion",
    },
    {
      id: "aulas",
      label: "Aulas y Espacios",
      icon: School,
      category: "configuracion",
    },
    {
      id: "settings",
      label: "Configuración Avanzada",
      icon: Settings,
      category: "configuracion",
    },
  ];

  const recentActivities = [
    {
      action: "Nuevo estudiante registrado",
      user: "María González",
      time: "Hace 10 minutos",
      icon: UsersIcon,
    },
    {
      action: "Profesor asignado a aula",
      user: "Carlos Rodríguez",
      time: "Hace 30 minutos",
      icon: GraduationCap,
    },
    {
      action: "Clase programada",
      user: "Matemáticas - Aula 101",
      time: "Hace 1 hora",
      icon: BookOpen,
    },
    {
      action: "Reportes generados",
      user: "Sistema automático",
      time: "Hace 2 horas",
      icon: FileText,
    },
  ];

  // Función para cerrar el menú móvil al seleccionar una opción
  const handleMenuItemClick = (sectionId) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    // Resetear el componente de finanzas al cambiar de sección
    if (sectionId === "finances") {
      setFinanceComponent("GestionFinanciera");
    }
  };

  // Función para manejar el logout con confirmación
  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  const handleCancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  // Función para renderizar el componente de finanzas según el estado
  const renderFinanceComponent = () => {
    switch (financeComponent) {
      case "MovimientosCaja":
        return <MovimientosCaja />;
      case "PagosPensiones":
        return <PagosPensiones />;
      case "PagosMatriculas":
        return <PagosMatriculas />;
      case "PagosPlanillas":
        return <PagosPlanillas />;
      default:
        return <GestionFinanciera />;
    }
  };

  // Función para obtener la etiqueta de categoría (sin emojis)
  const getCategoryLabel = (category) => {
    const labels = {
      dashboard: "Dashboard",
      personas: "Personas",
      academico: "Académico",
      evaluacion: "Evaluación",
      finanzas: "Finanzas",
      administrativo: "Administrativo",
      reportes: "Reportes",
      herramientas: "Herramientas",
      usuarios: "Usuarios",
      configuracion: "Configuración",
      infraestructura: "Infraestructura",
    };
    return labels[category] || category;
  };

  // Función para obtener el icono de categoría
  const getCategoryIcon = (category) => {
    const icons = {
      dashboard: BarChart3,
      personas: UsersIcon,
      academico: GraduationCap,
      evaluacion: ClipboardList,
      finanzas: DollarSign,
      administrativo: FileText,
      reportes: BarChart3,
      herramientas: MessageCircle,
      usuarios: CircleUser,
      configuracion: Settings,
      infraestructura: School,
    };
    return icons[category] || GraduationCap;
  };

  return (
    <div className="flex h-screen bg-gray-50 border-r">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile close button */}
        <div className="flex items-center bg-blue-800 justify-between p-7 border-b border-gray-200 lg:justify-start">
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xl font-bold text-white tracking-wider">
              EDA
            </span>
          </div>
          <button
            className="lg:hidden p-2 text-white hover:text-gray-300"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 overflow-y-auto">
          <div className="space-y-1 pb-4">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeSection === item.id;

              // Determinar si mostrar separador de categoría
              const prevItem = index > 0 ? menuItems[index - 1] : null;
              const showCategorySeparator =
                prevItem && prevItem.category !== item.category;

              return (
                <div key={item.id}>
                  {/* Separador de categoría */}
                  {showCategorySeparator && (
                    <div className="my-4 px-4 ">
                      <div className="h-px bg-gray-400"></div>
                      <div className="text-sm font-bold text-blue-900 uppercase tracking-wider mt-2 mb-1 flex items-center gap-2">
                        {React.createElement(getCategoryIcon(item.category), {
                          className: "w-4 h-4",
                        })}
                        {getCategoryLabel(item.category)}
                      </div>
                      <div className="h-px bg-gray-400"></div>
                    </div>
                  )}

                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 mb-1 rounded-lg text-left transition-all duration-200 group hover:translate-x-2 cursor-pointer ${
                      isActive
                        ? "bg-blue-800 text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => handleMenuItemClick(item.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive ? "rotate-90 text-white" : "text-gray-400"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Info Card & Logout Button */}
        <div className="mt-auto p-3 border-t border-gray-200">
          {/* User Info */}
          <div className="flex flex-row items-center bg-gray-200 rounded-xl px-3 py-2 mb-3 w-full shadow gap-3 hover:-translate-y-1 transition-all hover:bg-blue-100 cursor-pointer">
            <div className="w-11 h-11 rounded-full border-2 border-blue-500 shadow bg-blue-100 flex items-center justify-center">
              <CircleUser className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {user?.nombre || ""} {user?.apellido || ""}
              </span>
              <span className="text-xs text-gray-700 truncate">
                {user?.email || "correo@ejemplo.com"}
              </span>
              {user?.role?.nombre && (
                <span className="text-[10px] text-white bg-blue-500 rounded px-2 py-0.5 mt-1 mb-1 w-fit font-semibold tracking-wide uppercase">
                  {user.role.nombre}
                </span>
              )}
            </div>
          </div>
          {/* Logout Button */}
          <button
            className="w-full flex items-center bg-red-50 space-x-3 px-4 py-3 text-red-600 hover:bg-red-100 cursor-pointer rounded-lg transition-colors duration-200"
            onClick={handleLogoutClick}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-blue-800 border-gray-200 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-white hover:text-gray-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:ml-0 ml-4">
              <h1 className="text-xl lg:text-2xl font-bold text-white">
                Panel de Administración
              </h1>
              <p className="text-sm text-white mt-1 hidden sm:block">
                {new Date().toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          {activeSection === "overview" && (
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center justify-between">
                <h1 className="text-5xl font-bold text-gray-700">
                  Bienvenido, {user?.nombre || ""}
                </h1>
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
                    <div className="text-red-600">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-red-800 text-sm">
                      {dashboardError}
                    </span>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
                        <p className="text-sm text-gray-600 mb-2">
                          {stat.title}
                        </p>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {stat.loading ? "..." : stat.change}
                        </span>
                      </div>
                    </div>
                  );
                })}
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
                  <button
                    onClick={() => setActiveSection("ai-chat")}
                    className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    DIsponible pronto...
                  </button>
                </div>
              </div>

              {/* Gráficos y Visualizaciones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Gráfico de barras - Estadísticas generales */}
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

                {/* Gráfico circular - Distribución por categorías */}
                <CategoryPieChart
                  data={[
                    {
                      name: "Docentes",
                      value: Math.round(
                        dashboardData.trabajadores.activos * 0.7
                      ),
                      color: "#3b82f6",
                    },
                    {
                      name: "Administrativos",
                      value: Math.round(
                        dashboardData.trabajadores.activos * 0.2
                      ),
                      color: "#10b981",
                    },
                    {
                      name: "Auxiliares",
                      value: Math.round(
                        dashboardData.trabajadores.activos * 0.1
                      ),
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
          )}

          {/* Renderizar componentes según la sección activa */}
          {activeSection === "students" && <Estudiantes />}
          {activeSection === "matricula" && <Matricula />}
          {activeSection === "trabajadores" && <Trabajadores />}
          {activeSection === "contratos" && <Contratos />}
          {activeSection === "planilla" && <Planilla />}
          {activeSection === "parents" && <Padres />}
          {activeSection === "roles" && <Roles />}
          {activeSection === "asignacion-aula" && <AsignacionAula />}
          {activeSection === "aulas" && <Aulas />}
          {activeSection === "cursos" && <Cursos />}
          {activeSection === "asignacion-cursos" && <AsignacionCursos />}
          {activeSection === "finances" && renderFinanceComponent()}
          {activeSection === "pensiones" && <Pensiones />}
          {activeSection === "reports" && <Reportes />}
          {activeSection === "users" && <Usuarios />}
          {activeSection === "settings" && <Configuraciones />}
          {activeSection === "planificaciones" && <Planificaciones />}
          {activeSection === "grados" && <Grados />}
          {activeSection === "cronogramas" && <Cronogramas />}
          {activeSection === "evaluacion-docente" && <EvaluacionDocente />}
          {activeSection === "bimestral-docente" && <BimestralDocente />}
          {activeSection === "anio-escolar" && <AnioEscolar />}
          {activeSection === "seguros" && <Seguros />}
          {activeSection === "ai-chat" && <AIChat />}
        </div>
      </main>

      {/* Modal de confirmación de logout */}
      <Transition appear show={isLogoutModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCancelLogout}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>

                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center mb-2"
                  >
                    ¿Cerrar sesión?
                  </Dialog.Title>

                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      ¿Estás seguro de que quieres cerrar sesión? Perderás el
                      acceso a tu cuenta administrativa.
                    </p>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                      onClick={handleCancelLogout}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                      onClick={handleConfirmLogout}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default AdminDashboard;
