import React, { useState } from 'react';
import { School, User, Calendar } from 'lucide-react';
import { DataTable } from '../../../../components/common/DataTable';
import ModalAsignarDocente from '../modales/ModalAsignarDocente';

const asignacionesColumns = [
  {
    accessor: 'aula',
    Header: 'Aula',
    sortable: true,
    Cell: ({ row }) => (
      <div className="flex items-center">
        <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <School className="w-5 h-5 text-blue-600" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900">
            Sección {row.idAula?.seccion || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {row.idAula?.cantidadEstudiantes || 0} estudiantes
          </div>
        </div>
      </div>
    )
  },
  {
    accessor: 'idTrabajador.nombre',
    Header: 'Docente Asignado',
    sortable: true,
    Cell: ({ row }) => (
      <div className="flex items-center">
        <div className="shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900">
            {row.idTrabajador?.nombre} {row.idTrabajador?.apellido}
          </div>
          <div className="text-sm text-gray-500">
            {row.idTrabajador?.correo}
          </div>
        </div>
      </div>
    )
  },
  {
    accessor: 'idCurso.nombreCurso',
    Header: 'Curso',
    sortable: true,
    Cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        {row.idCurso?.nombreCurso || row.idCurso?.nombre || 'Sin curso'}
      </div>
    )
  },
  {
    accessor: 'idAula.seccion',
    Header: 'Aula',
    sortable: true,
    Cell: ({ row }) => (
      <div className="text-sm text-gray-900">
        Sección {row.idAula?.seccion || 'N/A'}
      </div>
    )
  },
  {
    accessor: 'fechaAsignacion',
    Header: 'Fecha',
    sortable: true,
    Cell: ({ row }) => (
      <div className="flex items-center">
        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-900">
          {row.fechaAsignacion
            ? new Date(row.fechaAsignacion).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'Sin fecha'}
        </span>
      </div>
    )
  },
  {
    accessor: 'estaActivo',
    Header: 'Estado',
    sortable: true,
    Cell: ({ row }) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          row.estaActivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {row.estaActivo ? 'Activo' : 'Inactivo'}
      </span>
    )
  }
];

const TablaAulas = ({ asignaciones = [], loading = false }) => {
  const [showAsignarModal, setShowAsignarModal] = useState(false);

  const handleAdd = () => {
    setShowAsignarModal(true);
  };

  return (
    <>
      <DataTable
        data={asignaciones}
        columns={asignacionesColumns}
        loading={loading}
        title="Asignación docente Aula"
        searchPlaceholder="Buscar por aula o docente..."
        actions={{
          add: true,
          edit: false,
          delete: false,
          view: false,
          import: false,
          export: false
        }}
        onAdd={handleAdd}
        addButtonText="Asignar Docente"
        loadingMessage="Cargando asignaciones..."
        emptyMessage="No hay asignaciones registradas"
        itemsPerPage={10}
        enablePagination={true}
        enableSearch={true}
        enableSort={true}
      />
      <ModalAsignarDocente
        isOpen={showAsignarModal}
        onClose={() => setShowAsignarModal(false)}
      />
    </>
  );
};

export default TablaAulas;