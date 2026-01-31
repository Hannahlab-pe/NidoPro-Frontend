import React from 'react';
import { UserCheck } from 'lucide-react';
import { DataTable } from '../../../../components/common/DataTable';

/**
 * Tabla de padres refactorizada usando el componente DataTable unificado
 */
const TablaPadres = ({ 
  padres = [], 
  loading = false,
  onAdd, 
  onEdit, 
  onDelete, 
  onView
}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: 'Apoderado',
        accessor: 'nombre',
        sortable: true,
        Cell: ({ value, row }) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{`${value || ''} ${row.apellido || ''}`.trim()}</div>
            <div className="text-sm text-gray-500 truncate">
              {row.correo || 'Sin correo'}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {row.numero || 'Sin teléfono'}
            </div>
          </div>
        )
      },
      {
        Header: 'Documento',
        accessor: 'documentoIdentidad',
        sortable: true,
        Cell: ({ value, row }) => (
          <div>
            <div className="font-mono text-sm text-gray-900">{value || 'Sin documento'}</div>
            <div className="text-xs text-gray-500">{row.tipoDocumentoIdentidad || 'DNI'}</div>
          </div>
        )
      },
      {
        Header: 'Total Hijos',
        accessor: 'matriculas',
        sortable: true,
        Cell: ({ value }) => (
          <div className="text-center">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                (value?.length || 0) > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {value?.length || 0}
            </span>
          </div>
        )
      }
    ],
    []
  );

  return (
    <div>
      <DataTable
        data={padres}
        columns={columns}
        loading={loading}
        title="Gestión de Apoderados y Estudiantes"
        searchPlaceholder="Buscar padres..."
        icon={UserCheck}
        onAdd={onAdd}
        onEdit={onEdit}
        onDelete={onDelete}
        onView={onView}
        actions={{
          add: false, // Los padres se agregan solo a través de matrícula
          edit: true, // Habilitado para edición
          delete: false,
          view: true,
          import: false, // Import manejado por matrícula
        }}
        loadingMessage="Cargando padres..."
        emptyMessage="No hay padres registrados"
        itemsPerPage={10}
        enablePagination={true}
        enableSearch={true}
        enableSort={true}
      />
    </div>
  );
};

export default TablaPadres;
