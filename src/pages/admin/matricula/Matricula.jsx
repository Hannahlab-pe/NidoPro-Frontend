import React, { useState, useEffect } from 'react';
import TablaMatricula from './tablas/TablaMatricula';
import ModalAgregarMatricula from './modales/ModalAgregarMatricula';
import ModalVerMatricula from './modales/ModalVerMatricula';
import ModalEditarMatricula from './modales/ModalEditarMatricula';
import ModalEliminarMatricula from './modales/ModalEliminarMatricula';
import ModalErrorBoundary from '../../../components/common/ModalErrorBoundary';
import PageHeader from '../../../components/common/PageHeader';
import { useMatricula } from '../../../hooks/useMatricula';

const Matricula = () => {
  // Usar hook con TanStack Query
  const { 
    students: matriculas, 
    loading, 
    loadMatriculas 
  } = useMatricula();
  
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handlers para modales
  const handleAdd = () => setShowAddModal(true);
  
  // Debug: Verificar datos de matrículas
  useEffect(() => {

  }, [matriculas, loading]);

  const handleView = (matricula) => {
    console.log('👁️ Intentando ver matrícula:', matricula);
    setSelectedMatricula(matricula);
    setShowViewModal(true);
  };

  const handleEdit = (matricula) => {
    setSelectedMatricula(matricula);
    setShowEditModal(true);
  };

  const handleDelete = (matricula) => {
    setSelectedMatricula(matricula);
    setShowDeleteModal(true);
  };


  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedMatricula(null);
  };

  const handleSaveSuccess = () => {
    handleCloseModals();
    // No necesitamos llamar loadMatriculas() - TanStack Query se encarga automáticamente
  };

  const handleDeleteSuccess = () => {
    handleCloseModals();
    // No necesitamos llamar loadMatriculas() - TanStack Query se encarga automáticamente
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Matrícula" />

      <TablaMatricula
        matriculas={matriculas}
        loading={loading}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modales */}
      <ModalErrorBoundary onClose={handleCloseModals}>
        <ModalAgregarMatricula
          isOpen={showAddModal}
          onClose={handleCloseModals}
          onSave={handleSaveSuccess}
        />
      </ModalErrorBoundary>

      <ModalVerMatricula
        isOpen={showViewModal}
        onClose={handleCloseModals}
        matricula={selectedMatricula}
      />

      <ModalEditarMatricula
        isOpen={showEditModal}
        onClose={handleCloseModals}
        onSave={handleSaveSuccess}
        matricula={selectedMatricula}
      />

      <ModalEliminarMatricula
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        onDelete={handleDeleteSuccess}
        matricula={selectedMatricula}
      />

    </div>
  );
};

export default Matricula;
