import React, { useState, useMemo } from 'react';
import { FileText, Filter } from 'lucide-react';
import { DataTable } from '../../../../components/common/DataTable';

const TablaEvaluacionesDocente = ({ evaluaciones, loading, onNuevaEvaluacion, onViewEvaluacion }) => {
  const [selectedDocente, setSelectedDocente] = useState('');

  // Get unique docentes for filter
  const docentesOptions = useMemo(() => {
    if (!Array.isArray(evaluaciones)) return [];
    const unique = [...new Set(evaluaciones.map(ev => ev.idTrabajador2?.idTrabajador))];
    return unique.map(id => {
      const docente = evaluaciones.find(ev => ev.idTrabajador2?.idTrabajador === id)?.idTrabajador2;
      return docente ? { id: docente.idTrabajador, nombre: `${docente.nombre} ${docente.apellido}` } : null;
    }).filter(Boolean);
  }, [evaluaciones]);

  // Filter evaluations
  const filteredEvaluaciones = useMemo(() => {
    if (!Array.isArray(evaluaciones)) return [];
    return evaluaciones.filter(ev => {
      const matchesDocente = !selectedDocente || ev.idTrabajador2?.idTrabajador === selectedDocente;

      return matchesDocente;
    });
  }, [evaluaciones, selectedDocente]);

  const columns = useMemo(
    () => [
      {
        accessor: 'idTrabajador2.nombre',
        Header: 'Docente',
        sortable: true,
        Cell: ({ row }) => (
          <div className="text-sm">
            <div className="font-medium text-gray-900">
              {row.idTrabajador2?.nombre} {row.idTrabajador2?.apellido}
            </div>
            <div className="text-xs text-gray-500">{row.idTrabajador2?.correo || 'Sin correo'}</div>
          </div>
        )
      },
      {
        accessor: 'idBimestre2.nombreBimestre',
        Header: 'Bimestre',
        sortable: true,
        Cell: ({ row }) => (
          <div className="text-sm">
            <div className="text-gray-900">{row.idBimestre2?.nombreBimestre}</div>
            <div className="text-xs text-gray-500">Bimestre {row.idBimestre2?.numeroBimestre}</div>
          </div>
        )
      },
      {
        accessor: 'puntajeTotal',
        Header: 'Puntaje',
        sortable: true,
        Cell: ({ row }) => (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            row.calificacionFinal === 'A' ? 'bg-green-100 text-green-800' :
            row.calificacionFinal === 'B' ? 'bg-blue-100 text-blue-800' :
            row.calificacionFinal === 'C' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {row.calificacionFinal} ({row.puntajeTotal})
          </span>
        )
      },
      {
        accessor: 'fechaEvaluacion',
        Header: 'Fecha',
        sortable: true,
        Cell: ({ value }) => (
          <div className="text-sm text-gray-900">
            {value ? new Date(value).toLocaleDateString('es-ES') : 'Sin fecha'}
          </div>
        )
      },
      {
        accessor: 'idCoordinador.nombre',
        Header: 'Coordinador',
        sortable: true,
        Cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.idCoordinador?.nombre} {row.idCoordinador?.apellido}
          </div>
        )
      }
    ],
    []
  );

  const docenteFilter = (
    <div className="relative">
      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <select
        value={selectedDocente}
        onChange={(e) => setSelectedDocente(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none bg-white"
      >
        <option value="">Todos los docentes</option>
        {docentesOptions.map((docente) => (
          <option key={docente.id} value={docente.id}>
            {docente.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <DataTable
      data={filteredEvaluaciones}
      columns={columns}
      loading={loading}
      title="Tabla de Evaluaciones Bimestrales"
      icon={FileText}
      searchPlaceholder="Buscar por docente, bimestre o coordinador..."
      customFiltersElement={docenteFilter}
      actions={{
        add: true,
        edit: false,
        delete: false,
        view: true,
        import: false,
        export: false
      }}
      onAdd={onNuevaEvaluacion}
      addButtonText="Evaluar Docente"
      onView={onViewEvaluacion}
      loadingMessage="Cargando evaluaciones bimestrales..."
      emptyMessage="No se encontraron evaluaciones"
      itemsPerPage={10}
      enablePagination={true}
      enableSearch={true}
      enableSort={true}
    />
  );
};

export default TablaEvaluacionesDocente;