import React from 'react';
import { DataTable, evaluacionesColumns, evaluacionesFilters } from '../../../../components/common/DataTable';
import { FileText } from 'lucide-react';

const TablaEvaluaciones = ({
  evaluaciones = [],
  loading = false,
  error = null,
  onNueva,
  onEditar,
  onEliminar
}) => {
  // Si hay error, mostrar mensaje de error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar evaluaciones</h3>
          <p className="text-gray-600">{error.message || 'Ha ocurrido un error al cargar las evaluaciones.'}</p>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      data={evaluaciones}
      columns={evaluacionesColumns}
      loading={loading}
      title="Tabla de Comentarios Docentes"
      icon={FileText}
      searchPlaceholder="Buscar evaluaciones..."
      filters={evaluacionesFilters}
      actions={{
        add: true,
        edit: true,
        delete: true,
        view: false,
        import: false,
        export: false
      }}
      onAdd={onNueva}
      addButtonText="Nueva Evaluación"
      onEdit={onEditar}
      onDelete={(item) => onEliminar(item.idComentario)}
      emptyStateConfig={{
        title: 'No hay evaluaciones registradas',
        description: 'Las evaluaciones docentes aparecerán aquí cuando sean creadas'
      }}
    />
  );
};

export default TablaEvaluaciones;