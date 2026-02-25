import React, { useState } from "react";
import { FileText, Plus, User, Calendar, Search, Filter } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
import ModalEvaluacionDocente from "./modales/ModalEvaluacionDocente";
import TablaEvaluaciones from "./tablas/TablaEvaluaciones";
import { useDocentes } from "../../../hooks/queries/useTrabajadoresQueries";
import {
  useComentariosDocentes,
  useCreateComentarioDocente,
  useUpdateComentarioDocente,
  useDeleteComentarioDocente,
} from "../../../hooks/queries/useTrabajadoresQueries";
import { useAuthStore } from "../../../store";
import { toast } from "sonner";

const EvaluacionDocente = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Obtener datos del usuario autenticado
  const { user } = useAuthStore();

  // Obtener lista de trabajadores docentes
  const {
    data: trabajadoresData = [],
    isLoading: loadingTrabajadores,
    error: errorTrabajadores,
  } = useDocentes();

  // Obtener comentarios docentes
  const {
    data: evaluaciones = [],
    isLoading: loadingComentarios,
    error: errorComentarios,
  } = useComentariosDocentes();

  // Mostrar error si ocurre
  React.useEffect(() => {
    if (errorComentarios) {
      console.error("Error al cargar evaluaciones:", errorComentarios);
      toast.error(
        "Error al cargar las evaluaciones: " + errorComentarios.message,
      );
    }
  }, [errorComentarios]);

  // Hooks para mutaciones
  const createComentarioMutation = useCreateComentarioDocente();
  const updateComentarioMutation = useUpdateComentarioDocente();
  const deleteComentarioMutation = useDeleteComentarioDocente();

  // Extraer el array de trabajadores
  const trabajadores = Array.isArray(trabajadoresData)
    ? trabajadoresData
    : trabajadoresData?.trabajadores
      ? trabajadoresData.trabajadores
      : trabajadoresData?.data
        ? trabajadoresData.data
        : [];

  // Combinar loading states
  const loading = loadingTrabajadores || loadingComentarios;

  // Filtrar evaluaciones
  const filteredEvaluaciones = evaluaciones.filter((evaluacion) => {
    const matchesSearch =
      evaluacion.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluacion.descripcion
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      evaluacion.idTrabajador?.nombre
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      evaluacion.idTrabajador?.apellido
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Handlers
  const handleNuevaEvaluacion = () => {
    setSelectedEvaluacion(null);
    setIsModalOpen(true);
  };

  const handleEditarEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsModalOpen(true);
  };

  const handleEliminarEvaluacion = async (idEvaluacion) => {
    if (!confirm("¿Está seguro de que desea eliminar esta evaluación?")) {
      return;
    }

    try {
      await deleteComentarioMutation.mutateAsync(idEvaluacion);
      toast.success("Evaluación eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar evaluación:", error);
      toast.error("Error al eliminar la evaluación");
    }
  };

  const handleGuardarEvaluacion = async (evaluacionData) => {
    try {
      // Preparar datos para el backend - si no hay archivoUrl, mandar null
      const payload = {
        motivo: evaluacionData.motivo,
        descripcion: evaluacionData.descripcion,
        archivoUrl: evaluacionData.archivoUrl || null, // Si no hay URL, mandar null
        idTrabajador: evaluacionData.idTrabajador,
        idCoordinador: user?.entidadId || evaluacionData.idCoordinador,
      };

      if (selectedEvaluacion) {
        // Actualizar evaluación existente
        await updateComentarioMutation.mutateAsync({
          id: selectedEvaluacion.idComentario,
          data: payload,
        });
        toast.success("Evaluación actualizada exitosamente");
      } else {
        // Crear nueva evaluación
        await createComentarioMutation.mutateAsync(payload);
        toast.success("Evaluación creada exitosamente");
      }

      setIsModalOpen(false);
      setSelectedEvaluacion(null);
    } catch (error) {
      console.error("Error al guardar evaluación:", error);
      toast.error("Error al guardar la evaluación");
    }
  };

  // Estadísticas
  const stats = [
    {
      title: "Total Evaluaciones",
      value: evaluaciones.length,
      icon: FileText,
      color: "#3B82F6",
    },
    {
      title: "Trabajadores Evaluados",
      value: new Set(evaluaciones.map((e) => e.idTrabajador?.idTrabajador))
        .size,
      icon: User,
      color: "#10B981",
    },
    {
      title: "Evaluaciones Este Mes",
      value: evaluaciones.filter((e) => {
        const fecha = new Date(e.fechaCreacion);
        const ahora = new Date();
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }).length,
      icon: Calendar,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluación Docente"
        actions={
          <button
            onClick={handleNuevaEvaluacion}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Evaluación</span>
          </button>
        }
      />

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar evaluaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de evaluaciones */}
      <TablaEvaluaciones
        evaluaciones={filteredEvaluaciones}
        loading={loadingComentarios}
        error={errorComentarios}
        onEditar={handleEditarEvaluacion}
        onEliminar={handleEliminarEvaluacion}
      />

      {/* Modal */}
      <ModalEvaluacionDocente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evaluacion={selectedEvaluacion}
        trabajadores={trabajadores}
        onGuardar={handleGuardarEvaluacion}
        coordinadorId={user?.entidadId}
      />
    </div>
  );
};

export default EvaluacionDocente;
