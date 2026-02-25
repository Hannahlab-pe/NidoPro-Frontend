import React, { useState, useMemo } from "react";
import {
  X,
  FileText,
  Users,
  BookOpen,
  Calendar,
  Search,
  Plus,
  Loader2,
} from "lucide-react";
import ModalAgregarPlanificacion from "./modales/ModalAgregarPlanificacion";
import { usePlanificaciones } from "../../../hooks/usePlanificaciones";
import { useAuthStore } from "../../../store/useAuthStore";
import { useTrabajadores } from "src/hooks/queries/useTrabajadoresQueries";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";

const Planificaciones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    tipoPlanificacion: "",
    docente: "",
    mes: "",
  });
  const { user, rol } = useAuthStore();
  const { trabajadores } = useTrabajadores();

  // Obtener el idTrabajador del usuario logueado
  const idTrabajadorUsuario = useMemo(() => {
    if (!user || !trabajadores) return null;
    const found = trabajadores.find(
      (t) =>
        t.id_Usuario_Tabla === user.id ||
        (t.idUsuario && t.idUsuario.idUsuario === user.id),
    );
    return found ? found.idTrabajador : null;
  }, [user, trabajadores]);

  const { planificaciones, isLoading, error, refetch } = usePlanificaciones(
    rol,
    idTrabajadorUsuario,
  );

  // Opciones para filtros
  const tiposPlanificacion = useMemo(() => {
    if (!planificaciones) return [];
    const tipos = [...new Set(planificaciones.map((p) => p.tipoPlanificacion))];
    return tipos.filter(Boolean);
  }, [planificaciones]);

  const docentes = useMemo(() => {
    if (!planificaciones) return [];
    const docs = planificaciones.map((p) => ({
      id: p.idTrabajador,
      nombre:
        `${p.trabajador?.nombre || ""} ${p.trabajador?.apellido || ""}`.trim(),
    }));
    return [...new Map(docs.map((d) => [d.id, d])).values()];
  }, [planificaciones]);

  const meses = useMemo(() => {
    if (!planificaciones) return [];
    const mesesUnicos = [
      ...new Set(
        planificaciones.map((p) => {
          const fecha = new Date(p.fechaPlanificacion);
          return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
        }),
      ),
    ];
    return mesesUnicos.sort().reverse();
  }, [planificaciones]);

  // Filtrar planificaciones
  const planificacionesFiltradas = useMemo(() => {
    if (!planificaciones) return [];

    return planificaciones.filter((plan) => {
      // Filtro por tipo de planificación
      if (
        filters.tipoPlanificacion &&
        plan.tipoPlanificacion !== filters.tipoPlanificacion
      ) {
        return false;
      }

      // Filtro por docente
      if (filters.docente && plan.idTrabajador !== filters.docente) {
        return false;
      }

      // Filtro por mes
      if (filters.mes) {
        const fechaPlan = new Date(plan.fechaPlanificacion);
        const mesPlan = `${fechaPlan.getFullYear()}-${String(fechaPlan.getMonth() + 1).padStart(2, "0")}`;
        if (mesPlan !== filters.mes) {
          return false;
        }
      }

      return true;
    });
  }, [planificaciones, filters]);

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      tipoPlanificacion: "",
      docente: "",
      mes: "",
    });
  };

  const getMesNombre = (mesValue) => {
    if (!mesValue) return "";
    const [year, month] = mesValue.split("-");
    const fecha = new Date(year, month - 1);
    return fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planificaciones"
        actions={
          user?.rol === "DOCENTE" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Planificacion</span>
            </button>
          )
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-44">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Planificacion
          </label>
          <select
            value={filters.tipoPlanificacion}
            onChange={(e) =>
              handleFilterChange("tipoPlanificacion", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {tiposPlanificacion.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-44">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Docente
          </label>
          <select
            value={filters.docente}
            onChange={(e) => handleFilterChange("docente", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los docentes</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-36">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mes
          </label>
          <select
            value={filters.mes}
            onChange={(e) => handleFilterChange("mes", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los meses</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {getMesNombre(mes)}
              </option>
            ))}
          </select>
        </div>

        {(filters.tipoPlanificacion || filters.docente || filters.mes) && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Cargando planificaciones...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">Error al cargar planificaciones</p>
        </div>
      ) : planificacionesFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">
            No hay planificaciones registradas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {planificacionesFiltradas.map((plan) => (
            <div
              key={plan.idPlanificacion}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
            >
              {/* Header de la card */}
              <div className="flex items-center mb-4">
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-xl font-bold">
                    {plan.tipoPlanificacion?.charAt(0) || "P"}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-blue-800">
                    {plan.tipoPlanificacion}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(plan.fechaPlanificacion).toLocaleDateString(
                      "es-ES",
                    )}
                  </div>
                </div>
              </div>

              {/* Info del aula */}
              <div className="mb-4 bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Seccion:
                  </span>
                  <span className="text-sm font-semibold text-green-700">
                    {plan.aula?.seccion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Estudiantes:
                  </span>
                  <span className="text-sm font-semibold text-blue-700">
                    {plan.aula?.cantidadEstudiantes || "N/A"}
                  </span>
                </div>
              </div>

              {/* Docente */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 font-medium">
                    {plan.trabajador?.nombre} {plan.trabajador?.apellido}
                  </span>
                </div>
              </div>

              {/* Observaciones */}
              {plan.observaciones && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    {plan.observaciones}
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <a
                  href={plan.archivoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold underline transition-colors"
                >
                  Ver archivo
                </a>
                <span className="text-xs px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                  ACTIVO
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalAgregarPlanificacion
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default Planificaciones;
