import React from 'react';
import { Users } from 'lucide-react';
import { DataTable } from '../../../../components/common/DataTable';

/**
 * Tabla de estudiantes refactorizada usando el componente DataTable unificado
 */
const TablaEstudiantes = ({
  estudiantes = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView
}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Estudiante',
        accessor: 'nombre',
        sortable: true,
        Cell: ({ value, row }) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{`${value || ''} ${row.apellido || ''}`.trim()}</div>
            <div className="text-sm text-gray-500 truncate">
              {row.nroDocumento
                ? `${row.tipoDocumento || 'DNI'}: ${row.nroDocumento}`
                : 'Sin documento'}
            </div>
          </div>
        )
      },
      {
        Header: 'Aula',
        accessor: 'matriculas',
        sortable: true,
        Cell: ({ value }) => {
          const matriculaActiva =
            value?.find((m) => m.matriculaAula?.estado === 'activo') || value?.[0];
          const aula = matriculaActiva?.matriculaAula?.aula;

          if (!aula) {
            return <div className="text-sm text-gray-400 italic">Sin aula</div>;
          }

          return (
            <div className="text-sm">
              <div className="font-medium text-gray-900">{aula.seccion || 'N/A'}</div>
              <div className="text-xs text-gray-500">{aula.idGrado?.grado || ''}</div>
            </div>
          );
        }
      },
      {
        Header: 'Estado',
        accessor: 'idUsuario.estaActivo',
        sortable: true,
        Cell: ({ value, row }) => {
          const isActive = value !== undefined ? value : row.idUsuario?.estaActivo;
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </span>
          );
        }
      }
    ],
    []
  );

  return (
    <DataTable
      data={estudiantes}
      columns={columns}
      loading={loading}
      title="Tabla de Estudiantes"
      icon={Users}
      searchPlaceholder="Buscar estudiantes..."
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      actions={{
        add: false, // Los estudiantes se agregan solo a través de matrícula
        edit: true,
        delete: false,
        view: true,
        import: false, // Import manejado por matrícula
      }}
      addButtonText="Agregar Estudiante"
      loadingMessage="Cargando estudiantes..."
      emptyMessage="No hay estudiantes registrados"
      itemsPerPage={10}
      enablePagination={true}
      enableSearch={true}
      enableSort={true}
    />
  );
};

export default TablaEstudiantes;
