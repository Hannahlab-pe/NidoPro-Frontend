import React, { useState, useEffect } from 'react';
import { Plus, Calendar, BookOpen, FileText, UserCheck, Edit } from 'lucide-react';
import { toast } from 'sonner';
import CrearEvaluacionModal from './modales/CrearEvaluacionModal';
import EvaluarEstudianteModal from './modales/EvaluarEstudianteModal';
import PageHeader from '../../../components/common/PageHeader';

const EvaluacionesEstudiantes = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEvaluarModalOpen, setIsEvaluarModalOpen] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);

  // Obtener evaluaciones del profesor
  const fetchEvaluaciones = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')).state?.token
        : null;

      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/evaluacion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener evaluaciones');
      }

      const data = await response.json();

      if (data.success) {
        setEvaluaciones(data.info.data || []);
      } else {
        toast.error(data.message || 'Error al obtener evaluaciones');
      }
    } catch (error) {
      console.error('Error fetching evaluaciones:', error);
      toast.error('Error al cargar evaluaciones');
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener cursos disponibles
  const fetchCursos = async () => {
    try {
      const token = localStorage.getItem('auth-storage')
        ? JSON.parse(localStorage.getItem('auth-storage')).state?.token
        : null;

      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/curso`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener cursos');
      }

      const data = await response.json();

      if (data.success) {
        setCursos(data.info.data || []);
      } else {
        toast.error(data.message || 'Error al obtener cursos');
      }
    } catch (error) {
      console.error('Error fetching cursos:', error);
      toast.error('Error al cargar cursos');
    }
  };

  useEffect(() => {
    fetchEvaluaciones();
    fetchCursos();
  }, []);

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para manejar la creación de nueva evaluación
  const handleCrearEvaluacion = () => {
    setSelectedEvaluacion(null);
    setIsModalOpen(true);
  };

  // Función para manejar el cierre del modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvaluacion(null);
  };

  // Función para manejar la evaluación de estudiantes
  const handleEvaluarEstudiante = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsEvaluarModalOpen(true);
  };

  // Función para manejar la edición de evaluación
  const handleEditarEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setIsModalOpen(true);
  };

  // Función para manejar el cierre del modal de evaluación
  const handleCloseEvaluarModal = () => {
    setIsEvaluarModalOpen(false);
    setSelectedEvaluacion(null);
  };

  // Función para manejar el éxito de creación/edición
  const handleEvaluacionSuccess = () => {
    fetchEvaluaciones(); // Recargar la lista de evaluaciones
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64 px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 text-sm sm:text-base mt-2">Cargando evaluaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluaciones de Estudiantes"
        theme="green"
        actions={
          <button
            onClick={handleCrearEvaluacion}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </button>
        }
      />

      {/* Tabla de evaluaciones */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900 mb-4">
            Evaluaciones Creadas
          </h3>

          {evaluaciones.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No hay evaluaciones
              </h3>
              <p className="text-gray-500 mb-4 text-sm sm:text-base">
                Aún no has creado ninguna evaluación para tus estudiantes.
              </p>
              <button
                onClick={handleCrearEvaluacion}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Evaluación
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluaciones.map((evaluacion) => (
                    <tr key={evaluacion.idEvaluacion} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-xs sm:text-sm">{formatDate(evaluacion.fecha)}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          <span className="text-xs sm:text-sm">{evaluacion.descripcion}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {evaluacion.tipoEvaluacion || 'EXAMEN'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => handleEditarEvaluacion(evaluacion)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Editar</span>
                            <span className="sm:hidden">Edit</span>
                          </button>
                          <button
                            onClick={() => handleEvaluarEstudiante(evaluacion)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-2 sm:px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Calificar</span>
                            <span className="sm:hidden">Evaluar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para crear/editar evaluación */}
      <CrearEvaluacionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleEvaluacionSuccess}
        evaluacion={selectedEvaluacion}
        cursos={cursos}
      />

      {/* Modal para evaluar estudiante */}
      <EvaluarEstudianteModal
        isOpen={isEvaluarModalOpen}
        onClose={handleCloseEvaluarModal}
        evaluacion={selectedEvaluacion}
      />

      {/* Estadísticas */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Evaluaciones</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{evaluaciones.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Cursos Disponibles</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{cursos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Evaluaciones este mes</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                {evaluaciones.filter(e => {
                  const fecha = new Date(e.fecha);
                  const ahora = new Date();
                  return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluacionesEstudiantes;