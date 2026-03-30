import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import TableLoading from '../TableLoading';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  title = "Tabla de Datos",
  icon: Icon = null,
  onAdd,
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport,
  actions = {
    add: true,
    edit: true,
    delete: true,
    view: true,
    import: false,
    export: false
  },
  filters = {},
  customFiltersElement = null,
  itemsPerPage = 10,
  enablePagination = true,
  enableSearch = true,
  enableSort = true,
  searchPlaceholder,
  addButtonText = "Agregar",
  loadingMessage = "Cargando datos...",
  emptyMessage = "No hay datos disponibles",
  className = "",
  onRowClick = null
}) => {
  // Estados internos
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [customFilters, setCustomFilters] = useState({});

  // Función para obtener valores anidados
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Datos filtrados y ordenados
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    let filtered = [...data];

    // Filtro global de búsqueda
    if (enableSearch && globalFilter) {
      filtered = filtered.filter(item => {
        return columns.some(column => {
          const value = getNestedValue(item, column.accessor);
          
          // Si es un objeto (como idEstudiante), buscar en sus propiedades
          if (value && typeof value === 'object') {
            const searchableText = Object.values(value)
              .filter(v => v && typeof v === 'string')
              .join(' ')
              .toLowerCase();
            return searchableText.includes(globalFilter.toLowerCase());
          }
          
          // Búsqueda normal para strings y otros tipos
          return value?.toString().toLowerCase().includes(globalFilter.toLowerCase());
        });
      });
    }

    // Filtros personalizados
    Object.entries(customFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          // Filtro especial para aula
          if (key === 'aula') {
            if (!value || value === '') return true; // Si no hay filtro seleccionado, mostrar todos
            
            // Buscar la matrícula activa más reciente
            const matriculaActiva = item.matriculas?.find(m => m.matriculaAula?.estado === 'activo') || item.matriculas?.[0];
            const aula = matriculaActiva?.matriculaAula?.aula;
            
            if (!aula) return false;
            
            // Comparar por nombre del aula (grado + sección)
            const aulaNombre = `${aula.idGrado?.grado || ''} ${aula.seccion || ''}`.trim();
            return aulaNombre === value;
          }

          // Filtro especial para mes
          if (key === 'mes') {
            return getNestedValue(item, 'mes') === parseInt(value);
          }

          // Filtro especial para monto de pensión
          if (key === 'montoPension') {
            const monto = parseFloat(getNestedValue(item, 'montoPension')) || 0;
            switch (value) {
              case '300-349':
                return monto >= 300 && monto <= 349;
              case '350-399':
                return monto >= 350 && monto <= 399;
              case '400-449':
                return monto >= 400 && monto <= 449;
              case '450-499':
                return monto >= 450 && monto <= 499;
              case '500+':
                return monto >= 500;
              default:
                return true;
            }
          }

          // Filtro especial para estado de pensión
          if (key === 'estadoPension') {
            return getNestedValue(item, 'estadoPension') === value;
          }

          // Filtro especial para año
          if (key === 'anio') {
            return getNestedValue(item, 'anio') === parseInt(value);
          }

          // Filtros estándar para otros campos
          const itemValue = getNestedValue(item, key);

          // Manejar valores booleanos
          if (value === 'true' || value === 'false') {
            return itemValue === (value === 'true');
          }
          
          // Manejar otros tipos de valores
          return itemValue === value;
        });
      }
    });

    // Ordenamiento
    if (enableSort && sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = getNestedValue(a, sortConfig.key);
        let bValue = getNestedValue(b, sortConfig.key);

        // Manejar números
        const columnConfig = columns.find(col => col.accessor === sortConfig.key);
        if (columnConfig?.type === 'number') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        // Manejar fechas
        if (columnConfig?.type === 'date') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Manejar valores nulos
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, globalFilter, customFilters, sortConfig, columns, enableSearch, enableSort]);

  // Paginación
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = enablePagination ? processedData.slice(startIndex, endIndex) : processedData;

  // Función de ordenamiento
  const handleSort = (key) => {
    if (!enableSort) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Obtener icono de ordenamiento
  const getSortIcon = (key) => {
    if (!enableSort) return null;
    
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  // Renderizar celda
  const renderCell = (item, column) => {
    const value = getNestedValue(item, column.accessor);
    
    if (column.Cell) {
      return column.Cell({ value, row: item });
    }

    if (column.type === 'currency') {
      return `$${Number(value || 0).toLocaleString()}`;
    }

    if (column.type === 'percentage') {
      return `${value}%`;
    }

    if (column.type === 'date') {
      return new Date(value).toLocaleDateString('es-ES');
    }

    if (column.type === 'status') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${column.statusColors?.[value] || 'bg-gray-100 text-gray-800'}`}>
          {column.statusLabels?.[value] || value}
        </span>
      );
    }

    return value || '-';
  };

  // Renderizar acciones
  const renderActions = (item) => {
    if (!actions || (!actions.add && !actions.edit && !actions.delete && !actions.view)) return null;

    return (
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {actions.view && onView && (
            <button
              onClick={() => onView(item)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          {actions.edit && onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {actions.delete && onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    );
  };

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [globalFilter, customFilters]);

  // Mostrar loading
  if (loading) {
    return (
      <TableLoading
        icon={Icon}
        title={title}
        loadingMessage={loadingMessage}
        addButtonText={addButtonText}
        filterCount={Object.keys(filters).length}
      />
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-6 h-6 text-blue-600" />}
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
              {title}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {actions.import && onImport && (
              <button
                onClick={onImport}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Importar
              </button>
            )}
            {actions.export && onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 text-sm border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            )}
            {actions.add && onAdd && (
              <button
                onClick={onAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {addButtonText}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {(enableSearch || Object.keys(filters).length > 0 || customFiltersElement) && (
        <div className="p-4 lg:p-6 bg-gray-50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda global */}
            {enableSearch && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                />
              </div>
            )}

            {/* Elemento de filtros personalizado */}
            {customFiltersElement && (
              <div className="relative min-w-[150px]">
                {customFiltersElement}
              </div>
            )}

            {/* Filtros personalizados */}
            {Object.entries(filters).map(([key, filterConfig]) => (
              <div key={key} className="relative min-w-[150px]">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={customFilters[key] || 'all'}
                  onChange={(e) => setCustomFilters(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 appearance-none bg-white"
                >
                  <option value="all">{filterConfig.placeholder || `Todos ${filterConfig.label || key}`}</option>
                  {filterConfig.options?.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessor}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      enableSort && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    style={column.width ? { minWidth: `${column.width}px` } : {}}
                    onClick={() => column.sortable !== false && handleSort(column.accessor)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.Header}</span>
                      {enableSort && column.sortable !== false && getSortIcon(column.accessor)}
                    </div>
                  </th>
                ))}
                {(actions && (actions.add || actions.edit || actions.delete || actions.view)) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + ((actions && (actions.add || actions.edit || actions.delete || actions.view)) ? 1 : 0)} 
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`hover:bg-gray-50${onRowClick ? ' cursor-pointer' : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {columns.map((column) => (
                      <td 
                        key={column.accessor} 
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        style={column.width ? { width: `${column.width}px`, minWidth: `${column.width}px` } : {}}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                    {renderActions(item)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {enablePagination && totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} - {Math.min(endIndex, processedData.length)} de {processedData.length} resultados
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {/* Números de página */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm border rounded-md ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
