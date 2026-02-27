import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import EvaluacionDocenteModal from "./modales/EvaluacionDocenteModal";
import ModalVerEvaluacion from "./modales/ModalVerEvaluacion";
import TablaEvaluacionesDocente from "./tablas/TablaEvaluacionesDocente";
import { evaluacionService } from "../../../services/evaluacionService";
import { toast } from "sonner";

const BimestralDocente = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);

  const fetchEvaluaciones = async () => {
    try {
      setLoading(true);
      const data = await evaluacionService.getEvaluacionesDocente();
      console.log("Evaluaciones data:", data);
      console.log("Is array:", Array.isArray(data));
      setEvaluaciones(data);
    } catch (error) {
      console.error("Error fetching evaluaciones:", error);
      toast.error("Error al cargar las evaluaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleViewEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedEvaluacion(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Evaluación Bimestral Docente" />

      <TablaEvaluacionesDocente
        evaluaciones={evaluaciones}
        loading={loading}
        onNuevaEvaluacion={handleOpenModal}
        onViewEvaluacion={handleViewEvaluacion}
      />

      <EvaluacionDocenteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={fetchEvaluaciones}
      />

      <ModalVerEvaluacion
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        evaluacion={selectedEvaluacion}
      />
    </div>
  );
};

export default BimestralDocente;
