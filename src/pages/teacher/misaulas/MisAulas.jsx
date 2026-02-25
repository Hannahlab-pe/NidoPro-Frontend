import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  BookOpen,
  Users,
  GraduationCap,
  School,
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import TablaAulas from "./tablas/TablaAulas";
import aulaService from "../../../services/aulaService";
import estudianteService from "../../../services/estudianteService";
import { toast } from "sonner";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";

const MisAulas = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState("aulas"); // 'aulas' o 'estudiantes'
  const [selectedAula, setSelectedAula] = useState(null);
  const [estudiantesAula, setEstudiantesAula] = useState([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);

  // Estadísticas calculadas
  const statistics = {
    total: aulas.length,
    aulasActivas: aulas.filter(
      (aula) => aula.estado?.toLowerCase() === "activa",
    ).length,
    promedioEstudiantes:
      aulas.length > 0
        ? Math.round(
            aulas.reduce(
              (total, aula) => total + (aula.cantidadEstudiantes || 0),
              0,
            ) / aulas.length,
          )
        : 0,
  };

  // Cargar aulas al montar el componente
  useEffect(() => {
    cargarAulas();
  }, []);

  const cargarAulas = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener idTrabajador del localStorage
      const authStorage = localStorage.getItem("auth-storage");
      const authData = JSON.parse(authStorage);
      const idTrabajador = authData?.state?.user?.entidadId;

      if (!idTrabajador) {
        throw new Error("No se pudo obtener el ID del trabajador");
      }

      console.log("🔍 Cargando aulas para trabajador:", idTrabajador);

      const response = await aulaService.getAulasByTrabajador(idTrabajador);

      console.log("✅ Respuesta de aulas:", response);

      if (response.success && response.aulas) {
        setAulas(response.aulas);
      } else {
        setAulas([]);
        toast.info("No tienes aulas asignadas");
      }
    } catch (err) {
      console.error("❌ Error al cargar aulas:", err);
      setError(err.message || "Error al cargar las aulas");
      toast.error("Error al cargar las aulas");
    } finally {
      setLoading(false);
    }
  };

  const handleVerEstudiantes = async (aula) => {
    setSelectedAula(aula);
    setLoadingEstudiantes(true);
    setCurrentView("estudiantes");

    try {
      console.log("🔍 Cargando estudiantes del aula:", aula.id_aula);
      const response = await estudianteService.getEstudiantesPorAula(
        aula.id_aula,
      );

      if (response.success && response.estudiantes) {
        setEstudiantesAula(response.estudiantes);
      } else {
        setEstudiantesAula([]);
        toast.info("No hay estudiantes en esta aula");
      }
    } catch (error) {
      console.error("❌ Error al cargar estudiantes:", error);
      toast.error("Error al cargar los estudiantes");
      setEstudiantesAula([]);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  const handleRegresar = () => {
    setCurrentView("aulas");
    setSelectedAula(null);
    setEstudiantesAula([]);
  };

  const handleOpenEstudianteModal = (estudiante) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
  };

  const handleCloseEstudianteModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          currentView === "estudiantes"
            ? `Estudiantes - Aula ${selectedAula?.seccion}`
            : "Mis Aulas"
        }
        theme="green"
        actions={
          currentView === "estudiantes" ? (
            <button
              onClick={handleRegresar}
              className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Regresar a Mis Aulas</span>
            </button>
          ) : null
        }
      />
      {/* Estadísticas - Solo mostrar en vista de aulas */}
      {currentView === "aulas" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Aulas"
            value={statistics.total}
            color="#16a34a"
          />
          <StatCard
            icon={School}
            label="Aulas Activas"
            value={statistics.aulasActivas}
            color="#16a34a"
          />
          <StatCard
            icon={Users}
            label="Promedio Estudiantes"
            value={statistics.promedioEstudiantes}
            color="#9333ea"
          />
        </div>
      )}

      {/* Contenido según la vista */}
      {currentView === "aulas" ? (
        <TablaAulas onVerEstudiantes={handleVerEstudiantes} />
      ) : (
        <EstudiantesAulaView
          aula={selectedAula}
          estudiantes={estudiantesAula}
          loading={loadingEstudiantes}
          onOpenEstudianteModal={handleOpenEstudianteModal}
        />
      )}

      {/* Modal de detalles del estudiante */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={handleCloseEstudianteModal}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/20 backdrop-blur-md bg-opacity-25" />
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold text-gray-900"
                    >
                      Información Completa del Estudiante
                    </Dialog.Title>
                    <button
                      onClick={handleCloseEstudianteModal}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>

                  {selectedEstudiante && (
                    <div className="space-y-6">
                      {/* Información Personal */}
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Información Personal
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              Nombre Completo
                            </p>
                            <p className="text-lg text-blue-900">
                              {selectedEstudiante.nombreCompleto}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              Documento
                            </p>
                            <p className="text-lg text-blue-900">
                              {selectedEstudiante.tipoDocumento}{" "}
                              {selectedEstudiante.nroDocumento}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              Grado
                            </p>
                            <p className="text-lg text-blue-900">
                              {selectedEstudiante.infoApoderado?.grado?.grado}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-700">
                              Aula
                            </p>
                            <p className="text-lg text-blue-900">
                              {selectedEstudiante.infoApoderado?.aula?.seccion}
                            </p>
                          </div>
                        </div>
                        {selectedEstudiante.observaciones && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-blue-700">
                              Observaciones
                            </p>
                            <p className="text-blue-900 bg-blue-100 p-3 rounded mt-1">
                              {selectedEstudiante.observaciones}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Información del Apoderado */}
                      {selectedEstudiante.infoApoderado?.apoderado && (
                        <div className="bg-purple-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2" />
                            Información del Apoderado (
                            {
                              selectedEstudiante.infoApoderado.apoderado
                                .tipoApoderado
                            }
                            )
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-purple-700">
                                Nombre Completo
                              </p>
                              <p className="text-lg text-purple-900">
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .nombreCompleto
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-700">
                                Documento
                              </p>
                              <p className="text-lg text-purple-900">
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .tipoDocumentoIdentidad
                                }{" "}
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .documentoIdentidad
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-700">
                                Teléfono
                              </p>
                              <p className="text-lg text-purple-900 flex items-center">
                                <Phone className="w-4 h-4 mr-2" />
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .numero
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-purple-700">
                                Correo
                              </p>
                              <p className="text-lg text-purple-900 flex items-center">
                                <Mail className="w-4 h-4 mr-2" />
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .correo
                                }
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-purple-700">
                                Dirección
                              </p>
                              <p className="text-lg text-purple-900 flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                {
                                  selectedEstudiante.infoApoderado.apoderado
                                    .direccion
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Información del Aula */}
                      {selectedEstudiante.infoApoderado?.aula && (
                        <div className="bg-green-50 p-6 rounded-lg">
                          <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                            <School className="w-5 h-5 mr-2" />
                            Información del Aula
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Sección
                              </p>
                              <p className="text-lg text-green-900">
                                {selectedEstudiante.infoApoderado.aula.seccion}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Cantidad de Estudiantes
                              </p>
                              <p className="text-lg text-green-900">
                                {
                                  selectedEstudiante.infoApoderado.aula
                                    .cantidadEstudiantes
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Estado
                              </p>
                              <p className="text-lg text-green-900">
                                {selectedEstudiante.infoApoderado.aula.estado}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-700">
                                Fecha de Asignación
                              </p>
                              <p className="text-lg text-green-900 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                {new Date(
                                  selectedEstudiante.infoApoderado.aula
                                    .fechaAsignacion,
                                ).toLocaleDateString("es-ES")}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contactos de Emergencia */}
                      {selectedEstudiante.contactosEmergencia &&
                        selectedEstudiante.contactosEmergencia.length > 0 && (
                          <div className="bg-orange-50 p-6 rounded-lg">
                            <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                              <Phone className="w-5 h-5 mr-2" />
                              Contactos de Emergencia
                            </h4>
                            <div className="space-y-4">
                              {selectedEstudiante.contactosEmergencia.map(
                                (contacto, index) => (
                                  <div
                                    key={contacto.idContacto}
                                    className="bg-white p-4 rounded-lg border border-orange-200"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="font-medium text-orange-900">
                                        {contacto.nombre} {contacto.apellido} (
                                        {contacto.relacionEstudiante})
                                      </h5>
                                      {contacto.esPrincipal && (
                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                          Principal
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                      <p className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-orange-600" />
                                        {contacto.telefono}
                                      </p>
                                      <p className="flex items-center">
                                        <Mail className="w-4 h-4 mr-2 text-orange-600" />
                                        {contacto.email}
                                      </p>
                                      <p className="text-gray-600">
                                        <span className="font-medium">
                                          Tipo:
                                        </span>{" "}
                                        {contacto.tipoContacto}
                                      </p>
                                      <p className="text-gray-600">
                                        <span className="font-medium">
                                          Prioridad:
                                        </span>{" "}
                                        {contacto.prioridad}
                                      </p>
                                    </div>
                                    {contacto.observaciones && (
                                      <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700">
                                          Observaciones:
                                        </p>
                                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-1">
                                          {contacto.observaciones}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

// Componente para mostrar estudiantes de un aula
const EstudiantesAulaView = ({
  aula,
  estudiantes,
  loading,
  onOpenEstudianteModal,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Cargando estudiantes...
        </h3>
        <p className="text-gray-600">Obteniendo la lista de estudiantes</p>
      </div>
    );
  }

  if (estudiantes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Users className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay estudiantes
        </h3>
        <p className="text-gray-600 text-center">
          Esta aula aún no tiene estudiantes asignados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {estudiantes.map((estudiante) => (
        <div
          key={estudiante.idEstudiante}
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:border-green-300"
          onClick={() => onOpenEstudianteModal(estudiante)}
        >
          <div className="p-4 md:p-6">
            {/* Header de la card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {estudiante.nombreCompleto}
                </h3>
                <p className="text-sm text-gray-600">
                  {estudiante.infoApoderado?.grado?.grado} -{" "}
                  {estudiante.infoApoderado?.aula?.seccion}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Información del estudiante */}
            <div className="space-y-3">
              {/* Documento */}
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2 text-green-500" />
                <span className="font-medium">Documento:</span>
                <span className="ml-2">
                  {estudiante.tipoDocumento} {estudiante.nroDocumento}
                </span>
              </div>

              {/* Apoderado Principal */}
              {estudiante.infoApoderado?.apoderado && (
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  <span className="font-medium">Apoderado:</span>
                  <span className="ml-2">
                    {estudiante.infoApoderado.apoderado.nombreCompleto} (
                    {estudiante.infoApoderado.apoderado.tipoApoderado})
                  </span>
                </div>
              )}

              {/* Contacto de Emergencia Principal */}
              {estudiante.contactosEmergencia &&
                estudiante.contactosEmergencia.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="font-medium">Contacto:</span>
                    <span className="ml-2">
                      {estudiante.contactosEmergencia[0].nombre}{" "}
                      {estudiante.contactosEmergencia[0].apellido} -{" "}
                      {estudiante.contactosEmergencia[0].telefono}
                    </span>
                  </div>
                )}

              {/* Estado del estudiante en el aula */}
              {estudiante.infoApoderado?.aula?.estado && (
                <div className="mt-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      estudiante.infoApoderado.aula.estado?.toLowerCase() ===
                      "activo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    Aula {estudiante.infoApoderado.aula.estado}
                  </span>
                </div>
              )}

              {/* Observaciones */}
              {estudiante.observaciones && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Observaciones:
                  </p>
                  <p className="text-sm text-gray-600">
                    {estudiante.observaciones}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MisAulas;
