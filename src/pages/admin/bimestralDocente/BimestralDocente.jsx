import React, { useState, useEffect } from "react";
import { UserCheck, RefreshCw, FileText, Users, Calendar } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";
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

  const handleRefresh = () => {
    fetchEvaluaciones();
  };

  // Estadísticas
  const stats = [
    {
      icon: FileText,
      label: "Total Evaluaciones",
      value: evaluaciones.length,
      color: "#3B82F6",
    },
    {
      icon: Users,
      label: "Docentes Evaluados",
      value: new Set(
        evaluaciones.map((e) => e.idTrabajador?.idTrabajador || e.idTrabajador),
      ).size,
      color: "#10B981",
    },
    {
      icon: Calendar,
      label: "Este Mes",
      value: evaluaciones.filter((e) => {
        const fecha = new Date(e.fechaCreacion || e.createdAt);
        const ahora = new Date();
        return (
          fecha.getMonth() === ahora.getMonth() &&
          fecha.getFullYear() === ahora.getFullYear()
        );
      }).length,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluación Bimestral Docente"
        actions={
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
              disabled={loading}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>
            <button
              onClick={handleOpenModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg cursor-pointer flex items-center gap-2 transition-colors"
            >
              <UserCheck size={20} />
              Evaluar Docente
            </button>
          </div>
        }
      />

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      <TablaEvaluacionesDocente
        evaluaciones={evaluaciones}
        loading={loading}
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
