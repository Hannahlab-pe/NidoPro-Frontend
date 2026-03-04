import React, { useState } from "react";
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  FileText,
  User,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Eye,
  BookOpenCheck
} from "lucide-react";
import { useTareasEstudianteQuery } from "../../../hooks/useTareasEstudianteQuery";
import { SubirTareaModal, VerTareaModal } from "../../../components/tareas";
import PageHeader from "../../../components/common/PageHeader";

const Tareas = () => {
  const [selectedFilter, setSelectedFilter] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [verTareaModalOpen, setVerTareaModalOpen] = useState(false);
  const [selectedTarea, setSelectedTarea] = useState(null);
  const { tareas, loading, error, refrescarTareas, isRefetching } = useTareasEstudianteQuery();

  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completada',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          emoji: '✅'
        };
      case 'in_progress':
        return {
          label: 'En Progreso',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
          emoji: '⏳'
        };
      case 'overdue':
        return {
          label: 'Atrasada',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
          emoji: '⚠️'
        };
      case 'pending':
      default:
        return {
          label: 'Pendiente',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          emoji: '⏰'
        };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-400';
      case 'medium':
        return 'border-l-yellow-400';
      case 'low':
        return 'border-l-green-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Venció hace ${Math.abs(diffDays)} día(s)`;
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays === 1) return 'Vence mañana';
    return `${diffDays} días restantes`;
  };

  const handleVerTarea = (tarea) => {
    setSelectedTarea(tarea);
    setVerTareaModalOpen(true);
  };

  const handleVerTareaModalClose = () => {
    setVerTareaModalOpen(false);
    setSelectedTarea(null);
  };

  const handleSubirTarea = (tarea) => {
    setSelectedTarea(tarea);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedTarea(null);
  };

  const handleTareaSuccess = () => {
    refrescarTareas();
  };

  const filteredTareas = tareas.filter(tarea => {
    if (selectedFilter === "todas") return true;
    if (selectedFilter === "overdue") return tarea.isOverdue;
    return tarea.status === selectedFilter;
  });

  const getStatsCard = () => {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.status === 'completed').length;
    const pendientes = tareas.filter(t => t.status === 'pending').length;
    const atrasadas = tareas.filter(t => t.isOverdue || t.status === 'overdue').length;

    return { total, completadas, pendientes, atrasadas };
  };

  const stats = getStatsCard();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Cargando tareas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-red-800 font-semibold">Error al cargar las tareas</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={refrescarTareas}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <PageHeader
          title="Tareas Asignadas"
          theme="yellow"
          actions={(
            <button
              onClick={refrescarTareas}
              disabled={isRefetching}
              className={`flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors ${
                isRefetching
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="text-sm sm:text-base">{isRefetching ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          )}
        />
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Revisa y completa las tareas asignadas por tus profesores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.completadas}</p>
            </div>
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Atrasadas</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.atrasadas}</p>
            </div>
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="todas">Todas las tareas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="overdue">Atrasadas</option>
          </select>
          
          <span className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Mostrando {filteredTareas.length} de {tareas.length} tareas
          </span>
        </div>
      </div>

      {/* Lista de Tareas */}
      {filteredTareas.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedFilter === "todas" 
              ? "No tienes tareas asignadas" 
              : `No hay tareas ${selectedFilter === "pending" ? "pendientes" : selectedFilter === "completed" ? "completadas" : "atrasadas"}`
            }
          </h3>
          <p className="text-gray-600">
            {selectedFilter === "todas" 
              ? "Cuando tus profesores asignen tareas, aparecerán aquí." 
              : "Prueba cambiando el filtro para ver otras tareas."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTareas.map((tarea) => {
            const statusInfo = getStatusInfo(tarea.status);
            const StatusIcon = statusInfo.icon;
            const daysLeft = getDaysLeft(tarea.dueDate);
            
            return (
              <div
                key={tarea.id}
                className={`bg-white border-l-4 ${getPriorityColor(tarea.priority)} rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}
              >
                <div className="p-4 sm:p-6">
                  {/* Header de la tarea */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-xl sm:text-2xl shrink-0">{tarea.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                            {tarea.title}
                          </h3>
                          <button
                            onClick={() => handleVerTarea(tarea)}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm hover:bg-blue-200 transition-colors ml-2"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Ver Detalles</span>
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{tarea.subject}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">Prof. {tarea.profesor}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">{tarea.aula}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end sm:justify-start">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{statusInfo.label}</span>
                        <span className="sm:hidden">{statusInfo.emoji}</span>
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">{tarea.description}</p>

                  {/* Fechas e información adicional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span>Asignada: {formatDate(tarea.fechaAsignacion)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                      <span>Vence: {formatDate(tarea.dueDate)}</span>
                    </div>
                    <div className="text-xs sm:text-sm col-span-1 sm:col-span-2 lg:col-span-1">
                      {daysLeft && (
                        <span className={`font-medium ${
                          tarea.isOverdue ? 'text-red-600' : 
                          tarea.daysLeft <= 1 ? 'text-orange-600' : 
                          'text-green-600'
                        }`}>
                          {daysLeft}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado de entrega */}
                  {tarea.realizoTarea ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0" />
                        <span className="text-green-800 font-medium text-sm sm:text-base">¡Tarea completada!</span>
                      </div>
                      {tarea.completedAt && (
                        <p className="text-green-700 text-xs sm:text-sm mt-1">
                          Entregada el {formatDate(tarea.completedAt)}
                        </p>
                      )}
                      {tarea.entrega?.observaciones && (
                        <div className="mt-3">
                          <p className="text-green-700 text-xs sm:text-sm font-medium">Observaciones:</p>
                          <p className="text-green-700 text-xs sm:text-sm">{tarea.entrega.observaciones}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 shrink-0" />
                          <span className="text-yellow-800 font-medium text-sm sm:text-base">Pendiente de entrega</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {tarea.entrega?.archivoUrl && (
                            <button className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs sm:text-sm hover:bg-blue-200 transition-colors">
                              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Ver archivo</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handleSubirTarea(tarea)}
                            className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs sm:text-sm hover:bg-green-200 transition-colors"
                          >
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Subir entrega</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para subir tarea */}
      <SubirTareaModal 
        isOpen={modalOpen}
        onClose={handleModalClose}
        tarea={selectedTarea}
        onSuccess={handleTareaSuccess}
      />

      {/* Modal para ver detalles de tarea */}
      <VerTareaModal
        isOpen={verTareaModalOpen}
        onClose={handleVerTareaModalClose}
        tarea={selectedTarea}
      />
    </div>
  );
};

export default Tareas;