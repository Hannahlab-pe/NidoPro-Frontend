import React from 'react';
import { DataTable } from '../../../../components/common/DataTable';

const TablaAsignacionDocenteCursoAula = ({
  asignaciones = [],
  aulas = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete
}) => {
  const getAulaCompleta = (idAula) =>
    aulas.find((a) => (a.idAula || a.id) === idAula) || null;

  const columns = [
    {
      accessor: 'idTrabajador.nombre',
      Header: 'Docente',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {row.idTrabajador?.nombre || ''} {row.idTrabajador?.apellido || ''}
          </div>
          <div className="text-xs text-gray-500">
            {row.idTrabajador?.idRol?.nombre || 'Sin rol'}
          </div>
        </div>
      )
    },
    {
      accessor: 'idCurso.nombreCurso',
      Header: 'Curso',
      sortable: true,
      Cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {row.idCurso?.nombreCurso || 'Sin curso'}
          </div>
          <div className="text-xs text-gray-500">
            {row.idCurso?.descripcion || ''}
          </div>
        </div>
      )
    },
    {
      accessor: 'idAula.seccion',
      Header: 'Aula',
      sortable: true,
      Cell: ({ row }) => {
        const aulaCompleta = getAulaCompleta(row.idAula?.idAula);
        const grado = aulaCompleta?.idGrado?.grado || 'Sin grado';
        const seccion = row.idAula?.seccion || 'N/A';

        return (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {`${grado} - Sección ${seccion}`}
            </div>
            <div className="text-xs text-gray-500">
              {row.idAula?.cantidadEstudiantes || 0} estudiantes
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <DataTable
      data={asignaciones}
      columns={columns}
      loading={loading}
      title="Asignación docente Aula"
      searchPlaceholder="Buscar por docente, curso o aula..."
      actions={{
        add: true,
        edit: true,
        delete: true,
        view: false,
        import: false,
        export: false
      }}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      addButtonText="Nueva Asignación"
      loadingMessage="Cargando asignaciones..."
      emptyMessage="No hay asignaciones registradas"
      itemsPerPage={10}
      enablePagination={true}
      enableSearch={true}
      enableSort={true}
    />
  );
};

export default TablaAsignacionDocenteCursoAula;
