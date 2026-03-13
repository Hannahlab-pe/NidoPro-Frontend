import React, { useState } from 'react';
import { DataTable, gradosColumns } from '../../../../components/common/DataTable';
import ModalAgregarGrado from '../modales/ModalAgregarGrado';
import ModalEditarGrado from '../modales/ModalEditarGrado';
import ModalEliminarGrado from '../modales/ModalEliminarGrado';

const TablaGrados = ({
  grados = [],
  loading = false,
}) => {
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [gradoSeleccionado, setGradoSeleccionado] = useState(null);

  const handleEdit = (grado) => {
    setGradoSeleccionado(grado);
    setShowModalEditar(true);
  };

  const handleDelete = (grado) => {
    setGradoSeleccionado(grado);
    setShowModalEliminar(true);
  };

  return (
    <>
      <DataTable
        data={grados}
        columns={gradosColumns}
        loading={loading}
        title="Tabla de Grados"
        actions={{
          add: true,
          edit: true,
          delete: true,
          view: false,
          import: false,
          export: false,
        }}
        onAdd={() => setShowModalCrear(true)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Agregar Grado"
        loadingMessage="Cargando grados..."
        emptyMessage="No hay grados registrados"
        itemsPerPage={10}
        enablePagination={true}
        enableSearch={true}
        enableSort={true}
      />

      <ModalAgregarGrado
        isOpen={showModalCrear}
        onClose={() => setShowModalCrear(false)}
      />

      <ModalEditarGrado
        isOpen={showModalEditar}
        onClose={() => {
          setShowModalEditar(false);
          setGradoSeleccionado(null);
        }}
        grado={gradoSeleccionado}
      />

      <ModalEliminarGrado
        isOpen={showModalEliminar}
        onClose={() => {
          setShowModalEliminar(false);
          setGradoSeleccionado(null);
        }}
        grado={gradoSeleccionado}
      />
    </>
  );
};

export default TablaGrados;
