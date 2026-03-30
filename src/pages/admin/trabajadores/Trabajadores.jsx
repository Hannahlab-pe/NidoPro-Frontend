import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTrabajadores } from "src/hooks/queries/useTrabajadoresQueries";
import TablaTrabajadores from "./tablas/TablaTrabajadores";
import ModalAgregarTrabajador from "./modales/ModalAgregarTrabajador";
import ModalVerTrabajador from "./modales/ModalVerTrabajador";
import ModalEditarTrabajador from "./modales/ModalEditarTrabajador";
import ModalEliminarTrabajador from "./modales/ModalEliminarTrabajador";
import PageHeader from "../../../components/common/PageHeader";

const Trabajadores = () => {
  // Hook personalizado para gestión de trabajadores
  const {
    data: trabajadoresData,
    isLoading: loading,
    error,
    refetch: refreshTrabajadores,
  } = useTrabajadores();

  const navigate = useNavigate();

  // Extraer el array de trabajadores
  const trabajadores = Array.isArray(trabajadoresData)
    ? trabajadoresData
    : trabajadoresData?.trabajadores
    ? trabajadoresData.trabajadores
    : trabajadoresData?.data
    ? trabajadoresData.data
    : [];

  // Estados locales solo para UI
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrabajador, setSelectedTrabajador] = useState(null);

  // Funciones para manejar las acciones de la tabla
  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEdit = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setShowEditModal(true);
  };

  const handleToggleStatus = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setShowDeleteModal(true);
  };

  const handleView = (trabajador) => {
    setSelectedTrabajador(trabajador);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Trabajadores" />

      {/* Componente de Tabla de Trabajadores */}
      <TablaTrabajadores
        trabajadores={trabajadores}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleToggleStatus}
        onView={handleView}
        onRowClick={(trabajador) => navigate(`/admin/trabajadores/${trabajador.idTrabajador}`)}
      />

      {/* Modales */}
      <ModalAgregarTrabajador
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refreshTrabajadores();
        }}
      />
      <ModalVerTrabajador
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTrabajador(null);
        }}
        trabajador={selectedTrabajador}
      />
      <ModalEditarTrabajador
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTrabajador(null);
        }}
        trabajador={selectedTrabajador}
      />
      <ModalEliminarTrabajador
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTrabajador(null);
        }}
        onSuccess={() => {
          setShowDeleteModal(false);
          setSelectedTrabajador(null);
          refreshTrabajadores();
        }}
        trabajador={selectedTrabajador}
      />
    </div>
  );
};

export default Trabajadores;
