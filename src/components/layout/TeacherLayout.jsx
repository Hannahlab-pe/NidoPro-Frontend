import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuthStore } from "../../store";
import {
  BarChart3,
  MessageCircle,
  Calendar,
  Users,
  ClipboardList,
  StickyNote,
  Gamepad2,
  GraduationCap,
  School,
  LogOut,
  ChevronRight,
  Bot,
  Menu,
  X,
  FileText,
  BookOpen,
  CircleUser,
} from "lucide-react";

const TeacherLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const menuItems = [
    // DASHBOARD
    {
      path: "/teacher",
      label: "Panel Principal",
      icon: BarChart3,
      category: "dashboard",
    },

    // HERRAMIENTAS EDUCATIVAS
    {
      path: "/teacher/ai-chat",
      label: "Asistente IA",
      icon: MessageCircle,
      category: "herramientas",
    },
    {
      path: "/teacher/juegos",
      label: "Juegos",
      icon: Gamepad2,
      category: "herramientas",
    },

    // TRABAJO ACADÉMICO
    {
      path: "/teacher/cronograma",
      label: "Cronograma",
      icon: Calendar,
      category: "academico",
    },
    {
      path: "/teacher/asistencia",
      label: "Asistencias",
      icon: ClipboardList,
      category: "academico",
    },
    {
      path: "/teacher/tareas",
      label: "Tareas",
      icon: BookOpen,
      category: "academico",
    },
    {
      path: "/teacher/evaluaciones-estudiantes",
      label: "Evaluaciones Estudiantes",
      icon: FileText,
      category: "academico",
    },
    {
      path: "/teacher/anotaciones",
      label: "Anotaciones",
      icon: StickyNote,
      category: "academico",
    },
    {
      path: "/teacher/planificaciones",
      label: "Planificaciones",
      icon: FileText,
      category: "academico",
    },

    // GESTIÓN DE ESTUDIANTES
    {
      path: "/teacher/aulas",
      label: "Mis Aulas",
      icon: School,
      category: "gestion",
    },

    // EVALUACIONES PERSONALES
    {
      path: "/teacher/evaluaciones",
      label: "Mis Evaluaciones",
      icon: FileText,
      category: "evaluaciones",
    },
  ];

  const getCategoryLabel = (category) => {
    const labels = {
      dashboard: "Dashboard",
      herramientas: "Herramientas Educativas",
      academico: "Trabajo Académico",
      gestion: "Gestión de Estudiantes",
      evaluaciones: "Evaluaciones Personales",
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      dashboard: BarChart3,
      herramientas: Bot,
      academico: GraduationCap,
      gestion: Users,
      evaluaciones: ClipboardList,
    };
    return icons[category] || GraduationCap;
  };

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };
  const handleCancelLogout = () => setIsLogoutModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 border-r">
      {/* Top Header — fixed, green */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="flex w-full">
          <div className="w-full bg-green-600 border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 text-white hover:text-gray-300"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 ml-4">
                <h1 className="text-xl lg:text-2xl font-bold text-white">
                  Panel de Docente
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
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col leading-tight text-right">
                    <span className="text-white font-semibold text-sm truncate max-w-[180px]">
                      {user?.nombre || ""} {user?.apellido || ""}
                    </span>
                    <span className="text-xs text-white/80 truncate max-w-[180px]">
                      {user?.email || "correo@ejemplo.com"}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white/70 bg-white/10 flex items-center justify-center">
                    <CircleUser className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col pt-20 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <button
          className="lg:hidden absolute right-4 top-4 p-2 text-green-600 hover:text-green-500"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation */}
        <nav
          className={`mt-6 flex-1 overflow-y-auto ${
            isSidebarCollapsed ? "lg:px-2" : "px-3"
          }`}
        >
          <div className="space-y-1 pb-4">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              const prevItem = index > 0 ? menuItems[index - 1] : null;
              const showCategorySeparator =
                prevItem && prevItem.category !== item.category;

              return (
                <div key={item.path}>
                  {showCategorySeparator && (
                    <div
                      className={`my-4 ${
                        isSidebarCollapsed ? "lg:px-1" : "px-4"
                      }`}
                    >
                      <div className="h-px bg-gray-400"></div>
                      <div
                        className={`text-sm font-bold text-green-900 uppercase tracking-wider mt-2 mb-1 flex items-center gap-2 transition-opacity duration-200 ${
                          isSidebarCollapsed
                            ? "lg:opacity-0 lg:pointer-events-none"
                            : "lg:opacity-100 lg:delay-150"
                        }`}
                      >
                        {React.createElement(getCategoryIcon(item.category), {
                          className: "w-4 h-4",
                        })}
                        {getCategoryLabel(item.category)}
                      </div>
                      {!isSidebarCollapsed && (
                        <div className="h-px bg-gray-400"></div>
                      )}
                    </div>
                  )}

                  <Link
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    title={isSidebarCollapsed ? item.label : ""}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed
                        ? "lg:justify-center lg:px-2"
                        : "justify-between px-4"
                    } py-3 mb-1 rounded-lg text-left transition-all duration-200 group hover:translate-x-1 cursor-pointer ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center">
                      <IconComponent
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-200 ${
                          isSidebarCollapsed
                            ? "lg:w-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none"
                            : "lg:w-auto lg:opacity-100 lg:ml-3 lg:delay-150"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-all duration-200 ${
                        isSidebarCollapsed
                          ? "lg:w-0 lg:opacity-0 lg:overflow-hidden lg:translate-x-1"
                          : "lg:w-4 lg:opacity-100 lg:delay-150"
                      } ${isActive ? "rotate-90 text-white" : "text-gray-400"}`}
                    />
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* User + Logout */}
        <div
          className={`mt-auto border-t border-gray-200 ${
            isSidebarCollapsed ? "lg:p-2" : "p-3"
          }`}
        >
          {!isSidebarCollapsed && (
            <div className="flex flex-row items-center bg-gray-200 rounded-xl px-3 py-2 mb-3 w-full shadow gap-3 hover:-translate-y-1 transition-all hover:bg-green-100 cursor-pointer">
              <div className="w-11 h-11 rounded-full border-2 border-green-500 shadow bg-green-100 flex items-center justify-center">
                <CircleUser className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-gray-900 text-sm truncate">
                  {user?.nombre || ""} {user?.apellido || ""}
                </span>
                <span className="text-xs text-gray-700 truncate">
                  {user?.email || "correo@ejemplo.com"}
                </span>
              </div>
            </div>
          )}
          <button
            className={`w-full flex items-center bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer rounded-lg transition-colors duration-200 ${
              isSidebarCollapsed
                ? "lg:justify-center lg:px-2 lg:py-3"
                : "space-x-3 px-4 py-3"
            }`}
            onClick={handleLogoutClick}
            title={isSidebarCollapsed ? "Cerrar Sesión" : ""}
          >
            <LogOut className="w-5 h-5" />
            <span
              className={`font-medium whitespace-nowrap transition-opacity duration-200 ${
                isSidebarCollapsed
                  ? "lg:opacity-0 lg:pointer-events-none"
                  : "lg:opacity-100 lg:delay-150"
              }`}
            >
              Cerrar Sesión
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-20">
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          <Outlet context={{ isSidebarCollapsed, setIsSidebarCollapsed }} />
        </div>
      </main>

      {/* Logout Modal */}
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md" />
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
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <LogOut className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center mb-2"
                  >
                    ¿Seguro que quieres salir?
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      Estás a punto de cerrar sesión en{" "}
                      <span className="font-semibold text-green-600">EDA</span>.
                      ¿Estás seguro de que quieres continuar?
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
                      Sí, salir
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

export default TeacherLayout;
