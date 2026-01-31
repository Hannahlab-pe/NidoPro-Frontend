import { Fragment, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Loader2, Users, UserCircle, BookOpen } from "lucide-react";
import { useAulaDetalle } from "../../../../hooks/queries/useAulasQueries";

const getNombreCompleto = (persona) => {
  if (!persona) return "Sin asignar";
  const nombre = persona.nombre || persona.nombres || "";
  const apellido = persona.apellido || persona.apellidos || "";
  const full = `${nombre} ${apellido}`.trim();
  return full || persona.usuario || persona.email || "Sin asignar";
};

const normalizeDocentes = (detalle) => {
  if (!detalle) return [];
  if (Array.isArray(detalle.docentes)) return detalle.docentes;
  if (Array.isArray(detalle.docentesCursos)) return detalle.docentesCursos;
  if (Array.isArray(detalle.docentesAsignados)) return detalle.docentesAsignados;
  return [];
};

const normalizeCursos = (docente) => {
  if (!docente) return [];
  const cursos = docente.cursos || docente.cursosAsignados || docente.idCursos || docente.curso || docente.idCurso;
  if (!cursos) return [];
  if (Array.isArray(cursos)) return cursos;
  return [cursos];
};

const ModalDetalleAula = ({ isOpen, onClose, aulaId }) => {
  const { data, isLoading, error } = useAulaDetalle(aulaId, {
    enabled: isOpen && !!aulaId,
  });

  const detalle = data || {};
  const aula = detalle.aula || detalle;
  const tutor = detalle.tutor || detalle.tutorAsignado || aula?.tutor || aula?.idTutor;
  const docentes = useMemo(() => normalizeDocentes(detalle), [detalle]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      Detalle del Aula
                    </Dialog.Title>
                    <p className="text-sm text-gray-500">
                      {aula?.idGrado?.grado || aula?.grado || "Sin grado"} - Sección {aula?.seccion || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-6">
                  {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <p className="mt-2 text-sm text-gray-500">Cargando detalle del aula...</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="text-sm text-red-800">
                        Error al cargar detalle: {error.message}
                      </p>
                    </div>
                  )}

                  {!isLoading && !error && (
                    <div className="space-y-6">
                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-6 w-6 text-blue-600" />
                          <div>
                            <p className="text-sm text-gray-500">Tutor asignado</p>
                            <p className="text-base font-semibold text-gray-900">
                              {getNombreCompleto(tutor)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h4 className="text-sm font-semibold text-gray-700">Docentes y cursos</h4>
                        </div>

                        {docentes.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                            No hay docentes asignados para esta aula.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {docentes.map((docenteItem, index) => {
                              const docente = docenteItem.docente || docenteItem.idTrabajador || docenteItem.trabajador || docenteItem;
                              const cursos = normalizeCursos(docenteItem);
                              return (
                                <div key={`${docente?.idTrabajador || docente?.id || index}`} className="rounded-lg border border-gray-200 p-4">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {getNombreCompleto(docente)}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {cursos.length === 0 ? (
                                      <span className="text-xs text-gray-500">Sin cursos asignados</span>
                                    ) : (
                                      cursos.map((curso, cursoIndex) => {
                                        const nombreCurso = curso?.nombreCurso || curso?.nombre || curso?.descripcion || "Curso";
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalDetalleAula;
