import React from "react";
import {
  DataTable,
  matriculaColumns,
} from "../../../../components/common/DataTable";

/**
 * Tabla de matrícula usando el componente DataTable unificado
 */
const TablaMatricula = ({
  matriculas = [],
  loading = false,
  onAdd,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <DataTable
      data={matriculas}
      columns={matriculaColumns}
      loading={loading}
      title="Tabla de Matrícula"
      searchPlaceholder="Buscar por nombre de estudiante..."
      actions={{
        add: true,
        edit: true,
        delete: false,
        view: true,
        import: false,
        export: false,
      }}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onView={onView}
      addButtonText="Nueva Matrícula"
      loadingMessage="Cargando matrículas..."
      emptyMessage="No hay matrículas registradas"
      itemsPerPage={10}
      enablePagination={true}
      enableSearch={true}
      enableSort={true}
    />
  );
};

export default TablaMatricula;
