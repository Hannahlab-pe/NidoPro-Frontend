import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Edit,
  Save,
  X,
  School,
  Loader2,
  BookOpen,
  RefreshCw,
  Plus,
} from "lucide-react";
import {
  useAsistenciaProfesor,
  useEstudiantesAula,
  useAsistenciasPorAulaYFecha,
} from "../../../hooks/queries/useAsistenciaQueries";
import { toast } from "sonner";

const Asistencia = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedAula, setSelectedAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [asistencias, setAsistencias] = useState({});

  // Hook principal para gestión de asistencia
  const {
    aulas,
    loadingAulas,
    errorAulas,
    registrarAsistencia,
    loadingRegistro,
    tieneAulas,
  } = useAsistenciaProfesor();

  // Hook para obtener estudiantes del aula seleccionada
  const {
    data: estudiantesData,
    isLoading: loadingEstudiantes,
    error: errorEstudiantes,
    refetch: refetchEstudiantes,
  } = useEstudiantesAula(selectedAula?.id_aula || selectedAula?.idAula);

  // Hook para obtener asistencias existentes por aula y fecha
  const {
    data: asistenciasExistentes,
    isLoading: loadingAsistenciasExistentes,
    error: errorAsistenciasExistentes,
    refetch: refetchAsistenciasExistentes,
  } = useAsistenciasPorAulaYFecha(
    selectedAula?.id_aula || selectedAula?.idAula,
    selectedDate,
  );

  // Seleccionar la primera aula disponible por defecto
  useEffect(() => {
    if (aulas.length > 0 && !selectedAula) {
      setSelectedAula(aulas[0]);
    }
  }, [aulas, selectedAula]);

  // Procesar datos de estudiantes y asistencias
  const estudiantes =
    estudiantesData?.estudiantes || estudiantesData?.data || [];
  const asistenciasRegistradas =
    asistenciasExistentes?.info?.data ||
    asistenciasExistentes?.asistencias ||
    asistenciasExistentes?.data ||
    [];
  const tieneAsistenciasRegistradas = asistenciasRegistradas.length > 0;

  // Log solo para verificar cambios importantes
  useEffect(() => {
    if (selectedAula && estudiantes.length > 0) {
      console.log("📊 Estado cargado:", {
        aula: selectedAula?.nombre,
        fecha: selectedDate,
        estudiantes: estudiantes.length,
        asistenciasExistentes: tieneAsistenciasRegistradas,
        totalAsistenciasRegistradas: asistenciasRegistradas.length,
      });
    }
  }, [
    selectedAula?.nombre,
    selectedDate,
    estudiantes.length,
    tieneAsistenciasRegistradas,
    asistenciasRegistradas.length,
  ]);

  // Inicializar asistencias cuando se cargan estudiantes o asistencias existentes
  useEffect(() => {
    if (estudiantes.length > 0) {
      const asistenciasIniciales = {};

      estudiantes.forEach((estudiante) => {
        const idEstudiante =
          estudiante.id_estudiante || estudiante.idEstudiante;

        // Buscar si ya tiene asistencia registrada para esta fecha
        const asistenciaExistente = asistenciasRegistradas.find(
          (asist) =>
            (asist.id_estudiante || asist.idEstudiante) === idEstudiante,
        );

        if (asistenciaExistente) {
          asistenciasIniciales[idEstudiante] = asistenciaExistente.estado;
        } else {
          asistenciasIniciales[idEstudiante] = "";
        }
      });

      setAsistencias(asistenciasIniciales);
    }
  }, [estudiantes, asistenciasRegistradas]);

  // Refrescar asistencias cuando cambie la fecha o el aula
  useEffect(() => {
    if (selectedAula && selectedDate) {
      refetchAsistenciasExistentes();
    }
  }, [selectedAula, selectedDate, refetchAsistenciasExistentes]);

  const handleAsistenciaChange = (estudianteId, estado) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: estado,
    }));
  };

  const handleGuardarAsistencias = async () => {
    if (!selectedAula) {
      toast.error("Selecciona un aula primero");
      return;
    }

    // Preparar datos para el registro masivo
    const asistenciasData = {
      fecha: selectedDate,
      id_aula: selectedAula.id_aula || selectedAula.idAula,
      asistencias: Object.entries(asistencias)
        .filter(([_, estado]) => estado !== "") // Solo enviar asistencias que tienen estado
        .map(([estudianteId, estado]) => ({
          id_estudiante: estudianteId,
          estado: estado,
        })),
    };

    if (asistenciasData.asistencias.length === 0) {
      toast.error("No hay asistencias para registrar");
      return;
    }

    try {
      await registrarAsistencia(asistenciasData);
      toast.success(
        `Asistencias guardadas correctamente para ${estudiantes.length} estudiantes`,
      );

      // Refrescar datos después del registro
      await refetchAsistenciasExistentes();
    } catch (error) {
      toast.error("Error al guardar las asistencias");
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "presente":
        return "bg-green-100 text-green-800 border-green-200";
      case "ausente":
        return "bg-red-100 text-red-800 border-red-200";
      case "tardanza":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "justificado":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "presente":
        return <UserCheck className="w-4 h-4" />;
      case "ausente":
        return <UserX className="w-4 h-4" />;
      case "tardanza":
        return <Clock className="w-4 h-4" />;
      case "justificado":
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Filtrar estudiantes por término de búsqueda
  const estudiantesFiltrados = estudiantes.filter((estudiante) =>
    `${estudiante.nombres} ${estudiante.apellido_paterno} ${estudiante.apellido_materno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Estadísticas
  const estadisticas = {
    total: estudiantesFiltrados.length,
    presentes: Object.values(asistencias).filter(
      (estado) => estado === "presente",
    ).length,
    ausentes: Object.values(asistencias).filter(
      (estado) => estado === "ausente",
    ).length,
    tardanzas: Object.values(asistencias).filter(
      (estado) => estado === "tardanza",
    ).length,
    justificados: Object.values(asistencias).filter(
      (estado) => estado === "justificado",
    ).length,
    pendientes: Object.values(asistencias).filter((estado) => estado === "")
      .length,
  };

  const porcentajeAsistencia =
    estadisticas.total > 0
      ? (
          ((estadisticas.presentes + estadisticas.tardanzas) /
            estadisticas.total) *
          100
        ).toFixed(1)
      : 0;

  if (loadingAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando aulas...</span>
        </div>
      </div>
    );
  }

  if (errorAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error al cargar las aulas</p>
          <p className="text-sm text-red-600">{errorAulas}</p>
        </div>
      </div>
    );
  }

  if (!tieneAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No tienes aulas asignadas</p>
          <p className="text-sm text-gray-500">
            Contacta al administrador para asignar aulas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Registro de Asistencia
        </h1>
        <p className="text-gray-600">
          Gestiona la asistencia de estudiantes por aula y fecha
        </p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Aula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aula
            </label>
            <select
              value={selectedAula?.id_aula || selectedAula?.idAula || ""}
              onChange={(e) => {
                const aula = aulas.find(
                  (a) => (a.id_aula || a.idAula) === e.target.value,
                );
                setSelectedAula(aula);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar aula</option>
              {aulas.map((aula) => (
                <option
                  key={aula.id_aula || aula.idAula}
                  value={aula.id_aula || aula.idAula}
                >
                  {aula.nombre} - {aula.grado}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar estudiante
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nombre del estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            onClick={() => {
              if (selectedAula) {
                refetchEstudiantes();
                refetchAsistenciasExistentes();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleGuardarAsistencias}
            disabled={
              loadingRegistro ||
              !selectedAula ||
              estudiantesFiltrados.length === 0
            }
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRegistro ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Asistencias</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {selectedAula && estudiantesFiltrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas.total}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Presentes</p>
                <p className="text-2xl font-bold text-green-700">
                  {estadisticas.presentes}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Ausentes</p>
                <p className="text-2xl font-bold text-red-700">
                  {estadisticas.ausentes}
                </p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Tardanzas</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {estadisticas.tardanzas}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">
                  Justificados
                </p>
                <p className="text-2xl font-bold text-blue-700">
                  {estadisticas.justificados}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  % Asistencia
                </p>
                <p className="text-2xl font-bold text-purple-700">
                  {porcentajeAsistencia}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {selectedAula && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estudiantes - {selectedAula.nombre} SDA
                </h3>
                <p className="text-sm text-gray-600">
                  Fecha:{" "}
                  {new Date(selectedDate).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {tieneAsistenciasRegistradas && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <UserCheck className="w-4 h-4" />
                  <span>Asistencias ya registradas</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loadingEstudiantes || loadingAsistenciasExistentes ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Cargando estudiantes...</span>
                </div>
              </div>
            ) : errorEstudiantes ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">Error al cargar estudiantes</p>
                <p className="text-sm text-red-600">{errorEstudiantes}</p>
              </div>
            ) : estudiantesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {searchTerm
                    ? "No se encontraron estudiantes"
                    : "No hay estudiantes en esta aula"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {estudiantesFiltrados.map((estudiante, index) => {
                  const idEstudiante =
                    estudiante.id_estudiante || estudiante.idEstudiante;
                  const estadoActual = asistencias[idEstudiante] || "";

                  return (
                    <div
                      key={idEstudiante}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900">
                            {estudiante.nombres} {estudiante.apellido_paterno}{" "}
                            {estudiante.apellido_materno}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Estado actual */}
                        {estadoActual && (
                          <div
                            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(estadoActual)}`}
                          >
                            {getEstadoIcon(estadoActual)}
                            <span className="capitalize">{estadoActual}</span>
                          </div>
                        )}

                        {/* Botones de estado */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() =>
                              handleAsistenciaChange(idEstudiante, "presente")
                            }
                            className={`p-2 rounded-md transition-colors ${
                              estadoActual === "presente"
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600"
                            }`}
                            title="Presente"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleAsistenciaChange(idEstudiante, "ausente")
                            }
                            className={`p-2 rounded-md transition-colors ${
                              estadoActual === "ausente"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600"
                            }`}
                            title="Ausente"
                          >
                            <UserX className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleAsistenciaChange(idEstudiante, "tardanza")
                            }
                            className={`p-2 rounded-md transition-colors ${
                              estadoActual === "tardanza"
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600"
                            }`}
                            title="Tardanza"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() =>
                              handleAsistenciaChange(
                                idEstudiante,
                                "justificado",
                              )
                            }
                            className={`p-2 rounded-md transition-colors ${
                              estadoActual === "justificado"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600"
                            }`}
                            title="Justificado"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                          {estadoActual && (
                            <button
                              onClick={() =>
                                handleAsistenciaChange(idEstudiante, "")
                              }
                              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                              title="Limpiar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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

export default Asistencia;
