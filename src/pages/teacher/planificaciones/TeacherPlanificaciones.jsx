import React, { useState, useMemo } from "react";
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Users,
  BookOpen,
  ClipboardList,
  Loader2,
  ExternalLink,
  StickyNote,
} from "lucide-react";
import ModalAgregarPlanificacion from "../../admin/planificaciones/modales/ModalAgregarPlanificacion";
import { usePlanificacionesTrabajador } from "../../../hooks/usePlanificacionesTrabajador";
import { useAuthStore } from "../../../store/useAuthStore";
import { formatFechaEvaluacion } from "../../../utils/dateUtils";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";

const TeacherPlanificaciones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todas");

  const { user } = useAuthStore();
  const idTrabajadorUsuario = user?.entidadId;

  const { planificaciones = [], isLoading, error, refetch } =
    usePlanificacionesTrabajador(idTrabajadorUsuario);

  const tipos = [...new Set(planificaciones.map((p) => p.tipoPlanificacion).filter(Boolean))];

  const planificacionesFiltradas = useMemo(() => {
    return planificaciones.filter((p) => {
      const matchesSearch =
        searchTerm === "" ||
        p.tipoPlanificacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.aula?.seccion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.observaciones?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === "todas" || p.tipoPlanificacion === filterTipo;
      return matchesSearch && matchesTipo;
    });
  }, [planificaciones, searchTerm, filterTipo]);

  if (!idTrabajadorUsuario) {
    return <div className="text-gray-500 text-center py-10">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Planificaciones" theme="green" />

      {/* EstadÃ­sticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ClipboardList} label="Total"         value={planificaciones.length}                       color="#6b7280" />
        <StatCard icon={BookOpen}      label="Tipos Ãºnicos"  value={tipos.length}                                 color="#2563eb" />
        <StatCard icon={Users}         label="Con estudiantes" value={planificaciones.filter(p => p.aula?.cantidadEstudiantes > 0).length} color="#16a34a" />
        <StatCard icon={StickyNote}    label="Con observaciones" value={planificaciones.filter(p => p.observaciones).length} color="#ca8a04" />
      </div>

      {/* Filtros sin fondo de tarjeta */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* BÃºsqueda */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar planificaciÃ³n</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tipo, secciÃ³n, observaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500"
          >
            <option value="todas">Todos los tipos</option>
            {tipos.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* BotÃ³n Agregar */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva PlanificaciÃ³n</span>
        </button>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando planificaciones...</h3>
            <p className="text-gray-600">Obteniendo las planificaciones del profesor</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
            <p className="text-gray-600 text-center">{String(error)}</p>
          </div>
        </div>
      ) : planificacionesFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <ClipboardList className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {planificaciones.length === 0 ? "No tienes planificaciones registradas" : "No se encontraron planificaciones"}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {planificaciones.length === 0
                ? "Comienza agregando tu primera planificaciÃ³n"
                : "Intenta ajustar los filtros de bÃºsqueda"}
            </p>
            {planificaciones.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Agregar primera planificaciÃ³n</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planificacionesFiltradas.map((plan) => (
            <div
              key={plan.idPlanificacion}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-700 text-lg font-bold">
                    {plan.tipoPlanificacion?.charAt(0) || "P"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{plan.tipoPlanificacion}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatFechaEvaluacion(plan.fechaCreacion)}
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700 ml-2">
                  Activo
                </span>
              </div>

              {/* Fecha planificaciÃ³n */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>Planificado: {formatFechaEvaluacion(plan.fechaPlanificacion)}</span>
              </div>

              {/* Aula info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">SecciÃ³n</span>
                  <span className="font-semibold text-green-700">{plan.aula?.seccion || "â€”"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> Estudiantes</span>
                  <span className="font-semibold text-blue-700">{plan.aula?.cantidadEstudiantes ?? "N/A"}</span>
                </div>
              </div>

              {/* Observaciones */}
              {plan.observaciones && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800 mb-3 leading-relaxed line-clamp-3">
                  {plan.observaciones}
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 mt-auto">
                <a
                  href={plan.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver archivo
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalAgregarPlanificacion
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
};

export default TeacherPlanificaciones;
