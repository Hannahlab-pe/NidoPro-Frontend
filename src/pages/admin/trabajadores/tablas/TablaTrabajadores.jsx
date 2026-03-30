import React from 'react';
import { DataTable, trabajadoresColumns } from '../../../../components/common/DataTable';

const TablaTrabajadores = ({
  trabajadores = [],
  loading = false,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onRowClick
}) => {
  return (
    <DataTable
      data={trabajadores}
      columns={trabajadoresColumns}
      loading={loading}
      title="Tabla de Trabajadores"
      searchPlaceholder="Buscar trabajadores..."
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
      onView={onView}
      onRowClick={onRowClick}
      emptyStateConfig={{
        title: 'No hay trabajadores registrados',
        description: 'Comienza agregando tu primer trabajador'
      }}
      addButtonText="Crear Trabajador"
    />
  );
};

export default TablaTrabajadores;
