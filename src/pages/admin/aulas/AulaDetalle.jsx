import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, UserCircle, Users, Loader2 } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { useAulaDetalle } from "../../../hooks/queries/useAulasQueries";

const getNombreCompleto = (persona) => {
  if (!persona) return "Sin asignar";
  const nombre = persona.nombre || persona.nombres || "";
  const apellido = persona.apellido || persona.apellidos || "";
  const full = `${nombre} ${apellido}`.trim();
  return full || persona.usuario || persona.email || "Sin asignar";
};

const normalizeDocentes = (detalle) => {
  if (!detalle) return [];
  if (Array.isArray(detalle.asignacionDocenteCursoAulas)) {
    return detalle.asignacionDocenteCursoAulas;
  }
  if (Array.isArray(detalle.docentes)) return detalle.docentes;
  if (Array.isArray(detalle.docentesCursos)) return detalle.docentesCursos;
  if (Array.isArray(detalle.docentesAsignados)) return detalle.docentesAsignados;
  return [];
};

const normalizeCursos = (docenteItem) => {
  if (!docenteItem) return [];
  const cursos =
    docenteItem.cursos ||
    docenteItem.cursosAsignados ||
    docenteItem.asignacionDocenteCursoAulas ||
    docenteItem.idCursos ||
    docenteItem.curso ||
    docenteItem.idCurso;

  if (!cursos) return [];
  if (Array.isArray(cursos)) return cursos;
  return [cursos];
};

const AulaDetalle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, error } = useAulaDetalle(id, { enabled: !!id });

  const detalle = data || {};
  const aula = detalle.aula || detalle;
  const tutorAsignaciones = detalle.asignacionAulas || [];
  const tutor = tutorAsignaciones[0]?.idTrabajador || aula?.idTutor || detalle.tutor || detalle.tutorAsignado;
  const docentes = normalizeDocentes(detalle);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle del Aula"
        actions={
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        }
      />

      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
          Cargando detalle del aula...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          Error al cargar detalle: {error.message}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {aula?.idGrado?.grado || aula?.grado || "Sin grado"} - Sección {aula?.seccion || "N/A"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Estudiantes: {aula?.cantidadEstudiantes || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <UserCircle className="w-6 h-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Tutor asignado</p>
                <p className="text-base font-semibold text-gray-900">
                  {getNombreCompleto(tutor)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-700">
                Docentes y cursos asignados
              </h3>
            </div>

            {docentes.length === 0 ? (
              <p className="text-sm text-gray-500">No hay docentes asignados.</p>
            ) : (
              <div className="space-y-4">
                {docentes.map((docenteItem, index) => {
                  const docente = docenteItem.idTrabajador || docenteItem.docente || docenteItem.trabajador || docenteItem;
                  const cursos = normalizeCursos(docenteItem);

                  return (
                    <div
                      key={`${docente?.idTrabajador || docente?.id || index}`}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <p className="text-sm font-semibold text-gray-900">
                        {getNombreCompleto(docente)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {cursos.length === 0 ? (
                          <span className="text-xs text-gray-500">Sin cursos asignados</span>
                        ) : (
                          cursos.map((curso, cursoIndex) => {
                            const nombreCurso =
                              curso?.nombreCurso ||
                              curso?.nombre ||
                              curso?.descripcion ||
                              "Curso";
                            return (
                              <span
                                key={`${nombreCurso}-${cursoIndex}`}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                              >
                                <BookOpen className="h-3 w-3" />
                                {nombreCurso}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AulaDetalle;
