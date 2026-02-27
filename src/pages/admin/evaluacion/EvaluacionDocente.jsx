import React, { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
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

  return (
    <div className="space-y-6">
      <PageHeader title="Evaluación Docente" />

      {/* Tabla de evaluaciones */}
      <TablaEvaluaciones
        evaluaciones={evaluaciones}
        loading={loading}
        error={errorComentarios}
        onNueva={handleNuevaEvaluacion}
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
