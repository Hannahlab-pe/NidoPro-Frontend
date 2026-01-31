import React, { useState } from 'react';
import { useAsignacionesDocenteCursoAula } from '../../../hooks/queries/useAsignacionDocenteCursoAulaQueries';
import { useAulas } from '../../../hooks/useAulas';
import PageHeader from '../../../components/common/PageHeader';
import TablaAsignacionDocenteCursoAula from './tablas/TablaAsignacionDocenteCursoAula';
import ModalAgregarAsignacion from './modales/ModalAgregarAsignacion';
import ModalEditarAsignacion from './modales/ModalEditarAsignacion';
import ModalEliminarAsignacion from './modales/ModalEliminarAsignacion';

const AsignacionDocenteCursoAula = () => {
  // Hook para obtener las asignaciones
  const {
    data: asignacionesData,
    isLoading: loading,
    refetch: refreshAsignaciones
  } = useAsignacionesDocenteCursoAula();

  // Hook para obtener aulas con sus grados
  const { aulas = [] } = useAulas();

  // Extraer el array de asignaciones
  const asignaciones = Array.isArray(asignacionesData) ? asignacionesData :
                       asignacionesData?.asignaciones ? asignacionesData.asignaciones :
                       asignacionesData?.data ? asignacionesData.data : [];

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsignacion, setSelectedAsignacion] = useState(null);

  // Handlers
  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEdit = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setShowEditModal(true);
  };

  const handleDelete = (asignacion) => {
    setSelectedAsignacion(asignacion);
    setShowDeleteModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Asignación docente Aula" />

      {/* Tabla */}
      <TablaAsignacionDocenteCursoAula
        asignaciones={asignaciones}
        aulas={aulas}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modales */}
      <ModalAgregarAsignacion
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refreshAsignaciones();
        }}
      />

      <ModalEditarAsignacion
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAsignacion(null);
        }}
        asignacion={selectedAsignacion}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedAsignacion(null);
          refreshAsignaciones();
        }}
      />

      <ModalEliminarAsignacion
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAsignacion(null);
        }}
        onSuccess={() => {
          setShowDeleteModal(false);
          setSelectedAsignacion(null);
          refreshAsignaciones();
        }}
        asignacion={selectedAsignacion}
      />
    </div>
  );
};

export default AsignacionDocenteCursoAula;
