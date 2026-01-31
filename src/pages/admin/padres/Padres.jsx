import React, { useState } from 'react';
import { usePadres } from '../../../hooks/usePadres';
import TablaPadres from './tablas/TablaPadres';
import ModalAgregarPadre from './modales/ModalAgregarPadre';
import ModalVerPadre from './modales/ModalVerPadre';
import ModalEditarPadre from './modales/ModalEditarPadre'; // Habilitado para edición
import ModalEliminarPadre from './modales/ModalEliminarPadre';
import PageHeader from '../../../components/common/PageHeader';

const Padres = () => {
  // Hook personalizado para gestión de padres
  const { 
    parents, 
    loading,
    refreshParents
  } = usePadres();

  // Estados locales solo para UI
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // Habilitado para edición
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  // Funciones para manejar las acciones de la tabla
  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEdit = (padre) => {
    setSelectedParent(padre);
    setShowEditModal(true);
  };

  const handleDelete = (padre) => {
    setSelectedParent(padre);
    setShowDeleteModal(true);
  };

  const handleView = (padre) => {
    setSelectedParent(padre);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Apoderados" />


      {/* Componente de Tabla de Padres */}
      <TablaPadres
        padres={parents}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Modal para agregar padre */}
      <ModalAgregarPadre
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refreshParents();
        }}
      />

      {/* Modal para ver padre */}
      <ModalVerPadre
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedParent(null);
        }}
        padre={selectedParent}
      />

      {/* Modal para editar padre */}
      <ModalEditarPadre
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedParent(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedParent(null);
          refreshParents();
        }}
        padre={selectedParent}
      />

      {/* Modal para eliminar padre */}
      <ModalEliminarPadre
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedParent(null);
        }}
        onSuccess={() => {
          setShowDeleteModal(false);
          setSelectedParent(null);
          refreshParents();
        }}
        padre={selectedParent}
      />
    </div>
  );
};

export default Padres;