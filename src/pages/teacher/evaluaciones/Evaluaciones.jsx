import React from 'react';
import { useEvaluacionesProfesor } from '../../../hooks/useEvaluacionesProfesor';
import { FileText, ExternalLink, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatFechaEvaluacion } from '../../../utils/dateUtils';
import PageHeader from '../../../components/common/PageHeader';

const EvaluacionCard = ({ evaluacion }) => {
  const handleOpenArchivo = (archivoUrl) => {
    if (!archivoUrl) {
      toast.error('No hay archivo adjunto para abrir');
      return;
    }

    try {
      // Abrir el archivo en una nueva pestaña/ventana
      window.open(archivoUrl, '_blank', 'noopener,noreferrer');
      toast.success('Archivo abierto en nueva pestaña');
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      toast.error('Error al abrir el archivo: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return formatFechaEvaluacion(dateString);
  };

  return (
    <div className="w-full mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {evaluacion.motivo || 'Evaluación'}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(evaluacion.fechaCreacion)}
          </span>
        </div>

        {evaluacion.coordinador && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <User className="w-4 h-4 mr-2" />
            <span>
              Evaluado por: {evaluacion.coordinador.nombre || 'Coordinador'}
              {evaluacion.coordinador.apellido && ` ${evaluacion.coordinador.apellido}`}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {evaluacion.descripcion && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Descripción:</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {evaluacion.descripcion}
              </p>
            </div>
          )}

          {evaluacion.archivoUrl && evaluacion.archivoUrl.trim() !== '' && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm text-gray-700">Archivo adjunto disponible</span>
              </div>
              <button
                onClick={() => handleOpenArchivo(evaluacion.archivoUrl)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </button>
            </div>
          )}

          {(!evaluacion.archivoUrl || evaluacion.archivoUrl.trim() === '') && (
            <div className="text-sm text-gray-500 italic">
              No hay archivo adjunto en esta evaluación
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Evaluaciones = () => {
  const { data: evaluaciones, isLoading, error, isError } = useEvaluacionesProfesor();

  console.log('Estado del hook:', { evaluaciones, isLoading, error, isError });

  // Debug de fechas
  if (evaluaciones && evaluaciones.length > 0) {
    console.log('Primera evaluación - fechaCreacion:', evaluaciones[0].fechaCreacion);
    console.log('Fecha formateada:', formatFechaEvaluacion(evaluaciones[0].fechaCreacion));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">Error al cargar evaluaciones</h3>
          <p className="text-sm">{error?.message || 'Ocurrió un error inesperado'}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!evaluaciones || evaluaciones.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No tienes evaluaciones recibidas</h3>
          <p className="text-gray-500">Aún no tienes evaluaciones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Evaluaciones" theme="green" />

      <div className="space-y-4">
        {evaluaciones.map((evaluacion) => (
          <EvaluacionCard
            key={evaluacion.idEvaluacionDocente || evaluacion.idComentario || evaluacion.id}
            evaluacion={evaluacion}
          />
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Total de evaluaciones: {evaluaciones.length}
      </div>
    </div>
  );
};

export default Evaluaciones;