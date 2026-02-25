import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useAuthStore } from "../../store";
import {
  BarChart3,
  FileText,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CircleUser,
  DollarSign,
  Banknote,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  Settings,
  FolderOpen,
} from "lucide-react";

const SECTIONS = [
  {
    id: "academico",
    label: "Académico",
    icon: GraduationCap,
    items: [
      { path: "/secretaria/pensiones", label: "Pensiones", icon: Banknote },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    icon: Settings,
    items: [{ path: "/secretaria/caja", label: "Caja", icon: DollarSign }],
  },
  {
    id: "otros",
    label: "Otros",
    icon: FolderOpen,
    items: [
      { path: "/secretaria/reportes", label: "Reportes", icon: FileText },
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

const SecretaryLayout = () => {
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
        <div className="flex w-full">
          <div className="w-full bg-blue-300 border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <button
                  className="lg:hidden p-2 text-blue-900 hover:text-blue-700"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="w-6 h-6" />
                </button>
                <button
                  className="hidden lg:flex p-2 text-blue-900 hover:text-blue-700 transition-colors rounded-md hover:bg-blue-100"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  title={isSidebarCollapsed ? "Expandir menu" : "Colapsar menu"}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="w-5 h-5" />
                  ) : (
                    <PanelLeftClose className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="flex-1 ml-4">
                <h1 className="text-xl lg:text-2xl font-bold text-black">
                  Panel de Secretaría
                </h1>
                <p className="text-sm text-blue-900/70 mt-1 hidden sm:block">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col leading-tight text-right">
                  <span className="text-blue-900 font-semibold text-sm truncate max-w-45">
                    {user?.nombre || ""} {user?.apellido || ""}
                  </span>
                  <span className="text-xs text-blue-900/70 truncate max-w-45">
                    {user?.email || "correo@ejemplo.com"}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-blue-900/30 bg-white/40 flex items-center justify-center">
                  <CircleUser className="w-5 h-5 text-blue-900" />
                </div>
              </div>
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
        className={`fixed inset-y-0 left-0 z-40 bg-blue-50 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col pt-20 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <button
          className="lg:hidden absolute right-4 top-4 p-2 text-blue-700 hover:text-blue-600"
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
                to="/secretaria"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed
                    ? "lg:justify-center lg:px-2"
                    : "justify-between px-4"
                } py-3 mb-1 rounded-lg text-left transition-all duration-200 group hover:translate-x-2 cursor-pointer ${
                  isItemActive("/secretaria")
                    ? "bg-blue-300 text-blue-900"
                    : "text-blue-900/70 hover:bg-blue-100 hover:text-blue-900"
                }`}
              >
                <div className="flex items-center">
                  <BarChart3
                    className={`w-5 h-5 ${isItemActive("/secretaria") ? "text-blue-900" : "text-blue-400 group-hover:text-blue-700"}`}
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
                  {/* Encabezado de sección */}
                  <div className="relative group/tip">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-full flex items-center ${
                        isSidebarCollapsed
                          ? "lg:justify-center lg:px-2"
                          : "px-3"
                      } py-1.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                        hasActiveItem
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      <SectionIcon className="w-4 h-4 shrink-0 text-blue-100 group-hover:text-white" />
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
                        className={`ml-auto w-4 h-4 shrink-0 transition-transform duration-300 text-blue-100 ${
                          isSidebarCollapsed ? "lg:hidden" : ""
                        } ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                      />
                    </button>
                    {isSidebarCollapsed && (
                      <SidebarTooltip label={section.label} />
                    )}
                  </div>

                  {/* Items con animación */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isCollapsed
                        ? "overflow-hidden max-h-0 opacity-0"
                        : `max-h-96 opacity-100 ${isSidebarCollapsed ? "overflow-visible" : "overflow-hidden"}`
                    }`}
                  >
                    <div
                      className={`mt-1 space-y-1 ${isSidebarCollapsed ? "" : "pl-2"}`}
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
                              } py-2.5 rounded-lg text-left transition-all duration-200 group hover:translate-x-1 cursor-pointer ${
                                isActive
                                  ? "bg-blue-300 text-blue-900"
                                  : "text-blue-900/70 hover:bg-blue-100 hover:text-blue-900"
                              }`}
                            >
                              <div className="flex items-center">
                                <ItemIcon
                                  className={`w-4 h-4 ${isActive ? "text-blue-900" : "text-blue-400 group-hover:text-blue-700"}`}
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

        {/* Logout */}
        <div className="mt-auto border-t border-blue-200 p-3">
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

      <main className="flex-1 flex flex-col overflow-hidden lg:ml-0 pt-20">
        <div className="p-4 lg:p-6 h-full overflow-y-auto">
          <Outlet context={{ isSidebarCollapsed, setIsSidebarCollapsed }} />
        </div>
      </main>

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
                    ¿Estás seguro de que quieres cerrar sesión? Perderás el
                    acceso a tu cuenta administrativa.
                  </p>
                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                      onClick={handleCancelLogout}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none transition-colors duration-200"
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

export default SecretaryLayout;
