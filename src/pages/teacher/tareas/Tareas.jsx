import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  PaperclipIcon,
  CalendarDays,
  Target,
  GraduationCap,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTareasTrabajador } from "../../../hooks/useTareasTrabajador";
import CrearTareaModal from "./modales/CrearTareaModal";
import EditarTareaModal from "./modales/EditarTareaModal";
import DetallesTareaModal from "./modales/DetallesTareaModal";
import EliminarTareaModal from "./modales/EliminarTareaModal";
import VerEntregasModal from "./modales/VerEntregasModal";
import TareaCompletaModal from "./modales/TareaCompletaModal";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";

const Tareas = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [filterMateria, setFilterMateria] = useState("todas");
  const [sortBy, setSortBy] = useState("fecha_vencimiento");

  // Estados de modales
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [showTareaCompletaModal, setShowTareaCompletaModal] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  // Hook para obtener tareas del trabajador
  const {
    tareas,
    loading,
    error,
    refrescarTareas,
    crearTarea,
    actualizarTarea,
    eliminarTarea,
  } = useTareasTrabajador();

  // Manejar la creación exitosa de una tarea
  const handleTareaCreada = async (tareaData) => {
    try {
      console.log("✅ [TAREAS] Iniciando creación de tarea:", tareaData);
      await crearTarea(tareaData);
      setShowCrearModal(false);
    } catch (error) {
      console.error("❌ [TAREAS] Error al crear tarea:", error);
    }
  };

  // Manejar actualización de tarea
  const handleTareaActualizada = async (idTarea, tareaData) => {
    try {
      console.log(
        "✅ [TAREAS] Iniciando actualización de tarea:",
        idTarea,
        tareaData,
      );
      await actualizarTarea(idTarea, tareaData);
      setShowEditarModal(false);
      setTareaSeleccionada(null);
    } catch (error) {
      console.error("❌ [TAREAS] Error al actualizar tarea:", error);
    }
  };

  // Manejar eliminación de tarea
  const handleTareaEliminada = async (idTarea) => {
    try {
      console.log("✅ [TAREAS] Iniciando eliminación de tarea:", idTarea);
      await eliminarTarea(idTarea);
      setShowEliminarModal(false);
      setTareaSeleccionada(null);
    } catch (error) {
      console.error("❌ [TAREAS] Error al eliminar tarea:", error);
    }
  };

  // Filtrar y ordenar tareas
  const tareasFiltradas = useMemo(() => {
    let filtered = tareas.filter((tarea) => {
      const matchesSearch =
        tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tarea.materia.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "todas" || tarea.estado === filterStatus;
      const matchesMateria =
        filterMateria === "todas" || tarea.materia === filterMateria;

      return matchesSearch && matchesStatus && matchesMateria;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fecha_vencimiento":
          return (
            new Date(a.fechaVencimiento || a.fechaEntrega) -
            new Date(b.fechaVencimiento || b.fechaEntrega)
          );
        case "fecha_creacion":
          return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        case "titulo":
          return a.titulo.localeCompare(b.titulo);
        case "materia":
          return a.materia.localeCompare(b.materia);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tareas, searchTerm, filterStatus, filterMateria, sortBy]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = tareas.length;
    const activas = tareas.filter((t) => t.estado === "activa").length;
    const vencidas = tareas.filter((t) => t.estado === "vencida").length;
    const borradores = tareas.filter((t) => t.estado === "borrador").length;
    const totalEntregadas = tareas.reduce((acc, t) => acc + t.entregadas, 0);
    const totalPendientes = tareas.reduce((acc, t) => acc + t.pendientes, 0);

    return {
      total,
      activas,
      vencidas,
      borradores,
      totalEntregadas,
      totalPendientes,
      porcentajeEntrega:
        totalEntregadas + totalPendientes > 0
          ? Math.round(
              (totalEntregadas / (totalEntregadas + totalPendientes)) * 100,
            )
          : 0,
    };
  }, [tareas]);

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case "activa":
        return {
          label: "Activa",
          color: "bg-green-100 text-green-800",
          icon: CheckCircle,
        };
      case "vencida":
        return {
          label: "Vencida",
          color: "bg-red-100 text-red-800",
          icon: XCircle,
        };
      case "borrador":
        return {
          label: "Borrador",
          color: "bg-gray-100 text-gray-800",
          icon: FileText,
        };
      default:
        return {
          label: "Sin estado",
          color: "bg-gray-100 text-gray-800",
          icon: AlertCircle,
        };
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "text-red-600";
      case "media":
        return "text-yellow-600";
      case "baja":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const materias = [
    ...new Set(tareas.map((t) => t.materia).filter((m) => m && m.trim())),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Gestión de Tareas" theme="green" />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          label="Total"
          value={estadisticas.total}
          color="#2563eb"
        />
        <StatCard
          icon={CheckCircle}
          label="Activas"
          value={estadisticas.activas}
          color="#16a34a"
        />
        <StatCard
          icon={XCircle}
          label="Vencidas"
          value={estadisticas.vencidas}
          color="#dc2626"
        />
        <StatCard
          icon={FileText}
          label="Borradores"
          value={estadisticas.borradores}
          color="#6b7280"
        />
        <StatCard
          icon={Upload}
          label="Entregadas"
          value={estadisticas.totalEntregadas}
          color="#9333ea"
        />
        <StatCard
          icon={Target}
          label="% Entrega"
          value={`${estadisticas.porcentajeEntrega}%`}
          color="#ca8a04"
        />
      </div>

      {/* Filtros y búsqueda - sin fondo de tarjeta */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Búsqueda */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar tarea
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="todas">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="vencida">Vencidas</option>
            <option value="borrador">Borradores</option>
          </select>
        </div>

        {/* Ordenar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="fecha_vencimiento">Por vencimiento</option>
            <option value="fecha_creacion">Por creación</option>
            <option value="titulo">Por título</option>
          </select>
        </div>

        {/* Botón Nueva Tarea */}
        <button
          onClick={() => setShowCrearModal(true)}
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando tareas...
            </h3>
            <p className="text-gray-600">
              Obteniendo las tareas del profesor desde el servidor
            </p>
          </div>
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tareas.length === 0
                ? "No tienes tareas creadas"
                : "No se encontraron tareas"}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {tareas.length === 0
                ? "Comienza creando tu primera tarea para asignar a tus estudiantes"
                : "Intenta ajustar los filtros para encontrar las tareas que buscas"}
            </p>
            {tareas.length === 0 && (
              <button
                onClick={() => setShowCrearModal(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Crear primera tarea</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareasFiltradas.map((tarea) => {
            const estadoInfo = getEstadoInfo(tarea.estado);
            const EstadoIcon = estadoInfo.icon;

            return (
              <div
                key={tarea.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {tarea.titulo}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}
                        >
                          <EstadoIcon className="w-3 h-3 mr-1" />
                          {estadoInfo.label}
                        </span>
                        {tarea.prioridad && (
                          <span
                            className={`text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}
                          >
                            ● {tarea.prioridad.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative"></div>
                  </div>

                  {/* Información de la tarea */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>
                        {tarea.aulaInfo?.grado || "Sin grado"} -{" "}
                        {tarea.aulaInfo?.seccion || "Sin sección"}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Vence: {formatFecha(tarea.fechaEntrega)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>
                        {tarea.entregadas}/{tarea.totalEstudiantes} entregadas
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        Asignada: {formatFecha(tarea.fechaAsignacion)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowTareaCompletaModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                      title="Ver tarea completa"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowEditarModal(true);
                      }}
                      className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar tarea"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowEliminarModal(true);
                      }}
                      className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <CrearTareaModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSave={handleTareaCreada}
      />

      <EditarTareaModal
        isOpen={showEditarModal}
        onClose={() => setShowEditarModal(false)}
        tarea={tareaSeleccionada}
        onSave={handleTareaActualizada}
      />

      <EliminarTareaModal
        isOpen={showEliminarModal}
        onClose={() => setShowEliminarModal(false)}
        tarea={tareaSeleccionada}
        onConfirm={handleTareaEliminada}
      />

      {/* Modal unificado para ver toda la información de la tarea */}
      <TareaCompletaModal
        isOpen={showTareaCompletaModal}
        onClose={() => setShowTareaCompletaModal(false)}
        tarea={tareaSeleccionada}
      />
    </div>
  );
};

export default Tareas;
