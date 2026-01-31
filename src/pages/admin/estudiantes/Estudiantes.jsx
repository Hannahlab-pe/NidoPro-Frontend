import React, { useState } from 'react';
import { useStudents } from '../../../hooks/useStudents';
import TablaEstudiantes from './tablas/TablaEstudiantes';
import ModalAgregarEstudiante from './modales/ModalAgregarEstudiante';
import ModalVerEstudiante from './modales/ModalVerEstudiante';
import ModalEditarEstudiante from './modales/ModalEditarEstudiante';
import ModalEliminarEstudiante from './modales/ModalEliminarEstudiante';
import PageHeader from '../../../components/common/PageHeader';

const Estudiantes = () => {
  // Hook personalizado para gestión de estudiantes
  const { 
    students, 
    loading
  } = useStudents();

  // Estados locales solo para UI
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Funciones para manejar las acciones de la tabla
  const handleAdd = () => {
    setShowModal(true);
  };

  const handleEdit = (estudiante) => {
    setSelectedStudent(estudiante);
    setShowEditModal(true);
  };

  const handleDelete = (estudiante) => {
    setSelectedStudent(estudiante);
    setShowDeleteModal(true);
  };

  const handleView = (estudiante) => {
    setSelectedStudent(estudiante);
    setShowViewModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Estudiantes" />

      {/* Componente de Tabla de Estudiantes */}
      <TablaEstudiantes
        estudiantes={students}
        loading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Modal para agregar estudiante */}
      <ModalAgregarEstudiante
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Modal para ver estudiante */}
      <ModalVerEstudiante
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStudent(null);
        }}
        estudiante={selectedStudent}
      />

      {/* Modal para editar estudiante */}
      <ModalEditarEstudiante
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudent(null);
        }}
        estudiante={selectedStudent}
        // ✅ REMOVIDO: onSave prop - El hook maneja todo automáticamente
      />

      {/* Modal para eliminar estudiante */}
      <ModalEliminarEstudiante
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStudent(null);
        }}
        estudiante={selectedStudent}
        // ✅ REMOVIDO: onConfirm - El hook maneja todo automáticamente
      />
    </div>
  );
};

export default Estudiantes;