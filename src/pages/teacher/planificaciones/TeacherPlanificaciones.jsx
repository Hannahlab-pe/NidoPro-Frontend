import React, { useState, useMemo, useEffect } from "react";
import ModalAgregarPlanificacion from "../../admin/planificaciones/modales/ModalAgregarPlanificacion";
import { usePlanificacionesTrabajador } from '../../../hooks/usePlanificacionesTrabajador';
import { useAuthStore } from '../../../store/useAuthStore';
import { useTrabajadores } from 'src/hooks/queries/useTrabajadoresQueries';
import { formatFechaEvaluacion } from '../../../utils/dateUtils';
import PageHeader from '../../../components/common/PageHeader';

const TeacherPlanificaciones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { trabajadores } = useTrabajadores();

  // Obtener el idTrabajador directamente del user.entidadId
  const idTrabajadorUsuario = user?.entidadId;

  // Usar el nuevo hook para obtener planificaciones del trabajador
  const { planificaciones, isLoading, error, refetch } = usePlanificacionesTrabajador(idTrabajadorUsuario);

  // Debug: Monitorear cambios en el estado del modal
  useEffect(() => {
    console.log('📊 Estado del modal cambió:', { isModalOpen, idTrabajadorUsuario });
  }, [isModalOpen, idTrabajadorUsuario]);
  const planificacionesFiltradas = planificaciones || [];

  if (!idTrabajadorUsuario) {
    return <div className="text-gray-500 text-center py-10">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planificaciones"
        theme="green"
        actions={
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
            onClick={() => setIsModalOpen(true)}
          >
            + Agregar Planificación
          </button>
        }
      />
      <div className="bg-white rounded-xl shadow p-6">
      <ModalAgregarPlanificacion open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />
      {/* Renderizar cards de planificaciones filtradas con mejor diseño */}
      {!idTrabajadorUsuario ? (
        <div className="text-gray-500 text-center py-10">Cargando...</div>
      ) : isLoading ? (
        <div className="text-gray-500 text-center py-10">Cargando planificaciones...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">Error al cargar planificaciones: {error}</div>
      ) : planificaciones && planificaciones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {planificaciones.map((plan) => (
            <div key={plan.idPlanificacion} className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition-shadow duration-200">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-2xl font-bold">{plan.tipoPlanificacion?.charAt(0) || 'P'}</span>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-xl text-blue-800">{plan.tipoPlanificacion}</div>
                  <div className="text-sm text-gray-500">{formatFechaEvaluacion(plan.fechaCreacion)}</div>
                </div>
              </div>

              <div className="mb-4 text-gray-700">
                <div className="font-medium text-gray-800 mb-1">Fecha de planificación:</div>
                <div className="text-sm">{formatFechaEvaluacion(plan.fechaPlanificacion)}</div>
              </div>

              <div className="mb-4">
                <div className="font-medium text-gray-800 mb-2">Información del Aula:</div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Sección:</span>
                    <span className="text-sm font-bold text-green-700">{plan.aula?.seccion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Estudiantes:</span>
                    <span className="text-sm font-bold text-blue-700">{plan.aula?.cantidadEstudiantes || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {plan.observaciones && (
                <div className="mb-4">
                  <div className="font-medium text-gray-800 mb-2">Observaciones:</div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 leading-relaxed">
                    {plan.observaciones}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <a href={plan.archivoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold hover:text-blue-800 transition-colors">Ver archivo</a>
                <span className="text-xs px-3 py-1 rounded-full font-bold bg-blue-100 text-blue-700">Activo</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-10">No hay planificaciones registradas.</div>
      )}
      </div>
    </div>
  );
};

export default TeacherPlanificaciones;
