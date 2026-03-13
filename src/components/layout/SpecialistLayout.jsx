import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuthStore } from "../../store";
import {
  BarChart3,
  ClipboardList,
  Users,
  FileText,
  StickyNote,
  Brain,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CircleUser,
  PanelLeftClose,
  PanelLeftOpen,
  HeartPulse,
  BookOpen,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

const SECTIONS = [
  {
    id: "evaluaciones",
    label: "Evaluaciones",
    icon: ClipboardList,
    items: [
      {
        path: "/specialist/evaluaciones",
        label: "Evaluaciones Psicopedagógicas",
        icon: Brain,
      },
    ],
  },
  {
    id: "estudiantes",
    label: "Estudiantes",
    icon: Users,
    items: [
      {
        path: "/specialist/estudiantes",
        label: "Mis Estudiantes",
        icon: Users,
      },
      {
        path: "/specialist/anotaciones",
        label: "Anotaciones",
        icon: StickyNote,
      },
    ],
  },
  {
    id: "seguimiento",
    label: "Seguimiento",
    icon: HeartPulse,
    items: [
      {
        path: "/specialist/informes",
        label: "Informes",
        icon: FileText,
      },
      {
        path: "/specialist/cronograma",
        label: "Cronograma",
        icon: CalendarDays,
      },
    ],
  },
  {
    id: "comunicacion",
    label: "Comunicación",
    icon: MessageSquare,
    items: [
      {
        path: "/specialist/observaciones",
        label: "Observaciones",
        icon: BookOpen,
      },
    ],
  },
];

const SidebarTooltip = ({ label }) => (
  <span
    className="
    absolute left-full top-1/2 -translate-y-1/2 ml-2 z-999
    bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-md
    whitespace-nowrap shadow-lg pointer-events-none
    opacity-0 group-hover/tip:opacity-100
    transition-opacity duration-150
  "
  >
    {label}
  </span>
);

const SpecialistLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({});
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const isItemActive = (path) => location.pathname === path;

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };
  const handleCancelLogout = () => setIsLogoutModalOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 border-r">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="w-full bg-teal-600 px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 text-white/80 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-base font-semibold text-white tracking-tight">
              Panel de Especialista
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/30 flex items-center justify-center shrink-0">
              <CircleUser className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-white font-medium text-sm truncate max-w-40">
                {user?.nombre || ""} {user?.apellido || ""}
              </span>
              <span className="text-xs text-white/60 truncate max-w-40">
                {user?.email || ""}
              </span>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col pt-14 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <button
          className="lg:hidden absolute right-4 top-4 p-2 text-teal-600 hover:text-teal-500"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>

        <nav
          className={`mt-6 flex-1 ${isSidebarCollapsed ? "overflow-visible" : "overflow-y-auto"} ${isSidebarCollapsed ? "lg:px-2" : "px-3"}`}
        >
          <div className="space-y-1 pb-4">
            {/* Panel Principal */}
            <div className="relative group/tip">
              <Link
                to="/specialist"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2"
                    : "justify-between px-4"
                } py-3 mb-1 rounded-lg transition-all duration-200 group hover:translate-x-1 cursor-pointer ${
                  isItemActive("/specialist")
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center">
                  <BarChart3
                    className={`w-5 h-5 ${isItemActive("/specialist") ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-200 ${
                      isSidebarCollapsed
                        ? "lg:w-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none"
                        : "lg:w-auto lg:opacity-100 lg:ml-3 lg:delay-150"
                    }`}
                  >
                    Panel Principal
                  </span>
                </div>
              </Link>
              {isSidebarCollapsed && <SidebarTooltip label="Panel Principal" />}
            </div>

            {/* Secciones colapsables */}
            {SECTIONS.map((section) => {
              const SectionIcon = section.icon;
              const isCollapsed = !!collapsedSections[section.id];
              const hasActiveItem = section.items.some((item) =>
                isItemActive(item.path),
              );

              return (
                <div key={section.id} className="mt-3">
                  <div className="relative group/tip">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed
                          ? "lg:justify-center lg:px-2"
                          : "px-3"
                      } py-1.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                        hasActiveItem
                          ? "bg-teal-200 text-teal-900"
                          : "bg-teal-100 text-teal-600 hover:bg-teal-200 hover:text-teal-900"
                      }`}
                    >
                      <SectionIcon className="w-4 h-4 shrink-0 text-teal-500 group-hover:text-teal-700" />
                      <span
                        className={`text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                          isSidebarCollapsed
                            ? "lg:w-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none"
                            : "lg:opacity-100 lg:ml-2 lg:delay-150"
                        }`}
                      >
                        {section.label}
                      </span>
                      <ChevronDown
                        className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-300 text-teal-400 ${
                          isSidebarCollapsed ? "lg:hidden" : ""
                        } ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                      />
                    </button>
                    {isSidebarCollapsed && (
                      <SidebarTooltip label={section.label} />
                    )}
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "overflow-hidden max-h-0 opacity-0"
                        : `max-h-96 opacity-100 ${isSidebarCollapsed ? "overflow-visible" : "overflow-hidden"}`
                    }`}
                  >
                    <div
                      className={`mt-1 space-y-0.5 ${isSidebarCollapsed ? "" : "pl-2"}`}
                    >
                      {section.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = isItemActive(item.path);
                        return (
                          <div key={item.path} className="relative group/tip">
                            <Link
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`w-full flex items-center ${
                                isSidebarCollapsed
                                  ? "lg:justify-center lg:px-2"
                                  : "justify-between px-4"
                              } py-2.5 rounded-lg transition-all duration-200 group hover:translate-x-1 cursor-pointer ${
                                isActive
                                  ? "bg-teal-600 text-white"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              }`}
                            >
                              <div className="flex items-center">
                                <ItemIcon
                                  className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`}
                                />
                                <span
                                  className={`text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                    isSidebarCollapsed
                                      ? "lg:w-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none"
                                      : "lg:w-auto lg:opacity-100 lg:ml-3 lg:delay-150"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>
                            </Link>
                            {isSidebarCollapsed && (
                              <SidebarTooltip label={item.label} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Colapsar sidebar (desktop) */}
        <div className="hidden lg:flex justify-end px-3 pb-2">
          <button
            className="p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Logout */}
        <div className="mt-auto border-t border-gray-200 p-3">
          <div className="relative group/tip">
            <button
              className={`w-full flex items-center bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer rounded-lg transition-colors duration-200 ${
                isSidebarCollapsed
                  ? "lg:justify-center lg:px-2 lg:py-3"
                  : "space-x-3 px-4 py-3"
              }`}
              onClick={handleLogoutClick}
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
            {isSidebarCollapsed && <SidebarTooltip label="Cerrar Sesión" />}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-14">
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          <Outlet context={{ isSidebarCollapsed, setIsSidebarCollapsed }} />
        </div>
      </main>

      {/* Modal Cerrar Sesión */}
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
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                    <LogOut className="w-6 h-6 text-red-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center mb-2"
                  >
                    ¿Cerrar sesión?
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Tu sesión actual será cerrada. Tendrás que iniciar sesión nuevamente para acceder al sistema.
                  </p>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={handleCancelLogout}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      onClick={handleConfirmLogout}
                    >
                      Cerrar Sesión
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

export default SpecialistLayout;
