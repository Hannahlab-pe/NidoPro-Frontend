// src/pages/teacher/notas/components/AnotacionCard.jsx
import React from 'react';
import { 
  Calendar, 
  User, 
  BookOpen, 
  Clock,
  GraduationCap,
  Building2,
  Edit,
  Trash2,
  MessageSquare
} from 'lucide-react';

const AnotacionCard = ({ anotacion, onEdit, onDelete }) => {
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar color de prioridad o tipo
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-5 h-full flex flex-col">
      {/* Header de la card */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-tight mb-2">
            {anotacion.titulo}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-700 flex-wrap">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>
                {anotacion.estudiante?.nombre} {anotacion.estudiante?.apellido}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{anotacion.curso?.nombreCurso || 'Sin curso'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-700 mt-3 flex-wrap">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
              <GraduationCap className="w-4 h-4" />
              <span>{anotacion.grado?.grado || 'Sin grado'}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <Building2 className="w-4 h-4" />
              <span>Sección {anotacion.aula?.seccion || 'Sin sección'}</span>
            </div>
          </div>
        </div>
        
        {/* Acciones */}
        <div className="flex items-center gap-2 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(anotacion)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar anotación"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(anotacion)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar anotación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido de la observación */}
      <div className="mb-4 flex-1 bg-gray-50 rounded-lg border border-gray-100 p-3">
        <div className="flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed wrap-break-word">
            {anotacion.observacion}
          </p>
        </div>
      </div>

      {/* Footer con fechas */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1 min-w-0">
            <Calendar className="w-3 h-3" />
            <span>Observación: {formatDate(anotacion.fechaObservacion)}</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <Clock className="w-3 h-3" />
            <span>Creado: {formatDateTime(anotacion.fechaCreacion)}</span>
          </div>
          {/* Badge de estado o prioridad si existe */}
          {anotacion.prioridad && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border w-fit ${getPriorityColor(anotacion.prioridad)}`}>
              {anotacion.prioridad}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnotacionCard;
