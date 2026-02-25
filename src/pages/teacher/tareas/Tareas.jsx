import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  FileText,
  PaperclipIcon,
  CalendarDays,
  Target,
  GraduationCap,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useTareasTrabajador } from '../../../hooks/useTareasTrabajador';
import CrearTareaModal from './modales/CrearTareaModal';
import EditarTareaModal from './modales/EditarTareaModal';
import DetallesTareaModal from './modales/DetallesTareaModal';
import EliminarTareaModal from './modales/EliminarTareaModal';
import VerEntregasModal from './modales/VerEntregasModal';
import TareaCompletaModal from './modales/TareaCompletaModal';
import PageHeader from '../../../components/common/PageHeader';

const Tareas = () => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [filterMateria, setFilterMateria] = useState('todas');
  const [sortBy, setSortBy] = useState('fecha_vencimiento');
  const [viewMode, setViewMode] = useState('tarjetas'); // 'tarjetas' o 'tabla'
  
  // Estados de modales
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showDetallesModal, setShowDetallesModal] = useState(false);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [showTareaCompletaModal, setShowTareaCompletaModal] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

  // Hook para obtener tareas del trabajador
  const {
    tareas,
    loading,
    error,
    refrescarTareas,
    crearTarea,
    actualizarTarea,
    eliminarTarea
  } = useTareasTrabajador();

  // Manejar la creación exitosa de una tarea
  const handleTareaCreada = async (tareaData) => {
    try {
      console.log('✅ [TAREAS] Iniciando creación de tarea:', tareaData);
      await crearTarea(tareaData);
      setShowCrearModal(false);
    } catch (error) {
      console.error('❌ [TAREAS] Error al crear tarea:', error);
    }
  };

  // Manejar actualización de tarea
  const handleTareaActualizada = async (idTarea, tareaData) => {
    try {
      console.log('✅ [TAREAS] Iniciando actualización de tarea:', idTarea, tareaData);
      await actualizarTarea(idTarea, tareaData);
      setShowEditarModal(false);
      setTareaSeleccionada(null);
    } catch (error) {
      console.error('❌ [TAREAS] Error al actualizar tarea:', error);
    }
  };

  // Manejar eliminación de tarea
  const handleTareaEliminada = async (idTarea) => {
    try {
      console.log('✅ [TAREAS] Iniciando eliminación de tarea:', idTarea);
      await eliminarTarea(idTarea);
      setShowEliminarModal(false);
      setTareaSeleccionada(null);
    } catch (error) {
      console.error('❌ [TAREAS] Error al eliminar tarea:', error);
    }
  };

  // Filtrar y ordenar tareas
  const tareasFiltradas = useMemo(() => {
    let filtered = tareas.filter(tarea => {
      const matchesSearch = tarea.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tarea.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tarea.materia.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'todas' || tarea.estado === filterStatus;
      const matchesMateria = filterMateria === 'todas' || tarea.materia === filterMateria;
      
      return matchesSearch && matchesStatus && matchesMateria;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fecha_vencimiento':
          return new Date(a.fechaVencimiento || a.fechaEntrega) - new Date(b.fechaVencimiento || b.fechaEntrega);
        case 'fecha_creacion':
          return new Date(b.fechaCreacion) - new Date(a.fechaCreacion);
        case 'titulo':
          return a.titulo.localeCompare(b.titulo);
        case 'materia':
          return a.materia.localeCompare(b.materia);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tareas, searchTerm, filterStatus, filterMateria, sortBy]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const total = tareas.length;
    const activas = tareas.filter(t => t.estado === 'activa').length;
    const vencidas = tareas.filter(t => t.estado === 'vencida').length;
    const borradores = tareas.filter(t => t.estado === 'borrador').length;
    const totalEntregadas = tareas.reduce((acc, t) => acc + t.entregadas, 0);
    const totalPendientes = tareas.reduce((acc, t) => acc + t.pendientes, 0);

    return {
      total,
      activas,
      vencidas,
      borradores,
      totalEntregadas,
      totalPendientes,
      porcentajeEntrega: totalEntregadas + totalPendientes > 0 
        ? Math.round((totalEntregadas / (totalEntregadas + totalPendientes)) * 100) 
        : 0
    };
  }, [tareas]);

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'activa':
        return {
          label: 'Activa',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle
        };
      case 'vencida':
        return {
          label: 'Vencida',
          color: 'bg-red-100 text-red-800',
          icon: XCircle
        };
      case 'borrador':
        return {
          label: 'Borrador',
          color: 'bg-gray-100 text-gray-800',
          icon: FileText
        };
      default:
        return {
          label: 'Sin estado',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle
        };
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta':
        return 'text-red-600';
      case 'media':
        return 'text-yellow-600';
      case 'baja':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const materias = [...new Set(tareas.map(t => t.materia).filter(m => m && m.trim()))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Tareas"
        theme="green"
        actions={
          <div className="flex items-center space-x-3">
            <button
              onClick={refrescarTareas}
              disabled={loading}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refrescar</span>
            </button>
            <button
              onClick={() => setShowCrearModal(true)}
              disabled={loading}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Tarea</span>
            </button>
          </div>
        }
      />

      {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-700">{estadisticas.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Activas</p>
                <p className="text-2xl font-bold text-green-700">{estadisticas.activas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-700">{estadisticas.vencidas}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Borradores</p>
                <p className="text-2xl font-bold text-gray-700">{estadisticas.borradores}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Entregadas</p>
                <p className="text-2xl font-bold text-purple-700">{estadisticas.totalEntregadas}</p>
              </div>
              <Upload className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">% Entrega</p>
                <p className="text-2xl font-bold text-yellow-700">{estadisticas.porcentajeEntrega}%</p>
              </div>
              <Target className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option key="todas" value="todas">Todos los estados</option>
              <option key="activa" value="activa">Activas</option>
              <option key="vencida" value="vencida">Vencidas</option>
              <option key="borrador" value="borrador">Borradores</option>
            </select>
          </div>

          {/* Ordenar */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option key="fecha_vencimiento" value="fecha_vencimiento">Por vencimiento</option>
              <option key="fecha_creacion" value="fecha_creacion">Por creación</option>
              <option key="titulo" value="titulo">Por título</option>
            </select>
          </div>
        </div>

        {/* Toggle vista */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Mostrando {tareasFiltradas.length} de {tareas.length} tareas
            </span>
          </div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('tarjetas')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tarjetas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tarjetas
            </button>
            <button
              onClick={() => setViewMode('tabla')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tabla'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tabla
            </button>
          </div>
        </div>
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando tareas...</h3>
            <p className="text-gray-600">Obteniendo las tareas del profesor desde el servidor</p>
          </div>
        </div>
      ) : tareasFiltradas.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {tareas.length === 0 ? 'No tienes tareas creadas' : 'No se encontraron tareas'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {tareas.length === 0 
                ? 'Comienza creando tu primera tarea para asignar a tus estudiantes'
                : 'Intenta ajustar los filtros para encontrar las tareas que buscas'
              }
            </p>
            {tareas.length === 0 && (
              <button
                onClick={() => setShowCrearModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Crear primera tarea</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'tarjetas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tareasFiltradas.map((tarea) => {
            const estadoInfo = getEstadoInfo(tarea.estado);
            const EstadoIcon = estadoInfo.icon;

            return (
              <div key={tarea.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {tarea.titulo}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                          <EstadoIcon className="w-3 h-3 mr-1" />
                          {estadoInfo.label}
                        </span>
                        {tarea.prioridad && (
                          <span className={`text-xs font-medium ${getPrioridadColor(tarea.prioridad)}`}>
                            ● {tarea.prioridad.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative">
    
                    </div>
                  </div>

                  {/* Información de la tarea */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>{tarea.aulaInfo?.grado || 'Sin grado'} - {tarea.aulaInfo?.seccion || 'Sin sección'}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Vence: {formatFecha(tarea.fechaEntrega)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{tarea.entregadas}/{tarea.totalEstudiantes} entregadas</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Asignada: {formatFecha(tarea.fechaAsignacion)}</span>
                    </div>
                  </div>

                 

                  {/* Acciones */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowTareaCompletaModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 transition-colors"
                      title="Ver tarea completa"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowEditarModal(true);
                      }}
                      className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar tarea"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTareaSeleccionada(tarea);
                        setShowEliminarModal(true);
                      }}
                      className="flex items-center justify-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Vista de tabla */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarea
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progreso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tareasFiltradas.map((tarea) => {
                  const estadoInfo = getEstadoInfo(tarea.estado);
                  const EstadoIcon = estadoInfo.icon;
                  const porcentaje = Math.round((tarea.entregadas / tarea.totalEstudiantes) * 100);

                  return (
                    <tr key={tarea.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{tarea.titulo}</div>
                          <div className="text-sm text-gray-500">{tarea.grado}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{tarea.materia}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                          <EstadoIcon className="w-3 h-3 mr-1" />
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFecha(tarea.fechaVencimiento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>{tarea.entregadas}/{tarea.totalEstudiantes}</span>
                              <span>{porcentaje}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setTareaSeleccionada(tarea);
                              setShowTareaCompletaModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Ver tarea completa"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTareaSeleccionada(tarea);
                              setShowEditarModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setTareaSeleccionada(tarea);
                              setShowEliminarModal(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <CrearTareaModal 
        isOpen={showCrearModal} 
        onClose={() => setShowCrearModal(false)} 
        onSave={handleTareaCreada}
      />
      
      <EditarTareaModal
        isOpen={showEditarModal}
        onClose={() => setShowEditarModal(false)}
        tarea={tareaSeleccionada}
        onSave={handleTareaActualizada}
      />

      <EliminarTareaModal
        isOpen={showEliminarModal}
        onClose={() => setShowEliminarModal(false)}
        tarea={tareaSeleccionada}
        onConfirm={handleTareaEliminada}
      />

      {/* Modal unificado para ver toda la información de la tarea */}
      <TareaCompletaModal
        isOpen={showTareaCompletaModal}
        onClose={() => setShowTareaCompletaModal(false)}
        tarea={tareaSeleccionada}
      />
    </div>
  );
};

export default Tareas;
