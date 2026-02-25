import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  Download,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Edit,
  Save,
  X,
  School,
  Loader2,
  BookOpen,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useAsistenciaProfesor, useEstudiantesAula, useAsistenciasPorAulaYFecha } from '../../../hooks/queries/useAsistenciaQueries';
import { getCurrentDatePeru, formatDatePeru } from '../../../utils/dateUtils';
import { toast } from 'sonner';
import PageHeader from '../../../components/common/PageHeader';

const Asistencia = () => {
  // Inicializar fecha una sola vez al montar el componente usando zona horaria de Perú
  const [selectedDate, setSelectedDate] = useState(() => getCurrentDatePeru());
  const [selectedAula, setSelectedAula] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [asistencias, setAsistencias] = useState({});

  // Hook principal para gestión de asistencia
  const { 
    aulas, 
    loadingAulas, 
    errorAulas,
    registrarAsistencia,
    loadingRegistro,
    tieneAulas
  } = useAsistenciaProfesor();

  // Función auxiliar para obtener el ID del aula de manera segura
  const getAulaId = (aula) => {
    if (!aula) return null;
    return aula.id_aula || aula.idAula || aula.id || aula.idAula;
  };

  // Hook para obtener estudiantes del aula seleccionada
  const { 
    data: estudiantesData, 
    isLoading: loadingEstudiantes, 
    error: errorEstudiantes,
    refetch: refetchEstudiantes
  } = useEstudiantesAula(getAulaId(selectedAula));

  // Hook para obtener asistencias existentes por aula y fecha
  const {
    data: asistenciasExistentes,
    isLoading: loadingAsistenciasExistentes,
    error: errorAsistenciasExistentes,
    refetch: refetchAsistenciasExistentes
  } = useAsistenciasPorAulaYFecha(
    getAulaId(selectedAula), 
    selectedDate
  );

  // Debug: Mostrar errores si existen
  useEffect(() => {
    if (errorEstudiantes) {
      console.error('❌ Error en estudiantes:', errorEstudiantes);
    }
    if (errorAsistenciasExistentes) {
      console.error('❌ Error en asistencias:', errorAsistenciasExistentes);
    }
  }, [errorEstudiantes, errorAsistenciasExistentes]);  // Seleccionar la primera aula disponible por defecto INMEDIATAMENTE
  useEffect(() => {
    if (aulas.length > 0 && !selectedAula) {
      const primeraAula = aulas[0];
      console.log('🏫 Primera aula disponible:', primeraAula);
      console.log('🔑 Propiedades del aula:', Object.keys(primeraAula));
      console.log('📋 Estructura completa del aula:', primeraAula);
      setSelectedAula(primeraAula);

      // FORZAR CARGA INICIAL INMEDIATA con la primera aula
      console.log('🚀 Cargando datos iniciales para:', primeraAula.nombre, 'Fecha:', selectedDate);
    }
  }, [aulas]);

  // Refrescar datos cuando cambie aula o fecha manualmente
  useEffect(() => {
    if (selectedAula && selectedDate) {
      console.log('🔄 Refrescando datos para:', selectedAula.nombre, 'Fecha:', selectedDate);
      refetchEstudiantes();
      refetchAsistenciasExistentes();
    }
  }, [getAulaId(selectedAula), selectedDate]);

  // Procesar datos de estudiantes y asistencias
  const estudiantes = estudiantesData?.estudiantes || estudiantesData?.data || [];
  const asistenciasRegistradas = asistenciasExistentes?.info?.data || asistenciasExistentes?.asistencias || asistenciasExistentes?.data || [];
  const tieneAsistenciasRegistradas = asistenciasRegistradas.length > 0;

  // DEBUG: Ver estructura de estudiantes
  useEffect(() => {
    if (estudiantes.length > 0) {
      console.log('🔍 DEBUG - Estructura de estudiantes:', estudiantes[0]);
      console.log('🔍 DEBUG - Todos los estudiantes:', estudiantes);
    }
  }, [estudiantes.length]);

  // DEBUG: Ver asistencias existentes
  useEffect(() => {
    if (asistenciasRegistradas.length > 0) {
      console.log('🔍 DEBUG - Asistencias existentes:', asistenciasRegistradas);
      console.log('🔍 DEBUG - Estructura de primera asistencia:', asistenciasRegistradas[0]);
    }
  }, [asistenciasRegistradas.length]);

  // Inicializar asistencias cuando se cargan estudiantes o asistencias existentes
  useEffect(() => {
    // Solo ejecutar si tenemos estudiantes Y (tenemos asistencias registradas O acabamos de cambiar de fecha/aula)
    if (estudiantes.length > 0 && (asistenciasRegistradas.length > 0 || !tieneAsistenciasRegistradas)) {
      console.log('🔄 Inicializando asistencias para', estudiantes.length, 'estudiantes');
      console.log('📊 Asistencias registradas disponibles:', asistenciasRegistradas.length);
      
      const asistenciasIniciales = {};
      
      estudiantes.forEach(estudiante => {
        const idEstudiante = estudiante.id_estudiante || estudiante.idEstudiante;
        console.log('👤 Procesando estudiante:', estudiante.nombres, 'ID:', idEstudiante);
        
        // Buscar si ya tiene asistencia registrada para esta fecha
        const asistenciaExistente = asistenciasRegistradas.find(
          asist => {
            const asistId = asist.idEstudiante || asist.id_estudiante || asist.idEstudiante;
            const match = asistId === idEstudiante;
            if (match) {
              console.log('🔍 Coincidencia encontrada:', { asistId, idEstudiante, asistencia: asist });
            }
            return match;
          }
        );
        
        if (asistenciaExistente) {
          console.log('✅ Asistencia encontrada para estudiante', idEstudiante, ':', asistenciaExistente);
          // Convertir el formato del backend al formato local
          if (asistenciaExistente.asistio === true || asistenciaExistente.asistio === 'true') {
            // Si asistió, verificar las observaciones para determinar el estado exacto
            if (asistenciaExistente.observaciones === 'Presente') {
              asistenciasIniciales[idEstudiante] = 'presente';
            } else if (asistenciaExistente.observaciones === 'Tardanza') {
              asistenciasIniciales[idEstudiante] = 'tardanza';
            } else if (asistenciaExistente.observaciones === 'Justificado') {
              asistenciasIniciales[idEstudiante] = 'justificado';
            } else {
              asistenciasIniciales[idEstudiante] = 'presente'; // Default para asistio=true
            }
          } else if (asistenciaExistente.asistio === false || asistenciaExistente.asistio === 'false') {
            asistenciasIniciales[idEstudiante] = 'ausente';
          } else {
            // Si no hay valor claro, dejar vacío
            asistenciasIniciales[idEstudiante] = '';
          }
        } else {
          console.log('❌ No se encontró asistencia para estudiante', idEstudiante);
          asistenciasIniciales[idEstudiante] = '';
        }
      });
      
      console.log('📋 Asistencias iniciales finales:', asistenciasIniciales);
      setAsistencias(asistenciasIniciales);
    }
  }, [estudiantes.length, getAulaId(selectedAula), selectedDate, asistenciasRegistradas]); // Incluir asistenciasRegistradas como dependencia

  // Refrescar asistencias cuando cambie la fecha o el aula (SIN refetchAsistenciasExistentes en dependencias)
  useEffect(() => {
    if (selectedAula && selectedDate) {
      console.log('🔄 Refrescando asistencias para nueva fecha/aula:', selectedDate, getAulaId(selectedAula));
      refetchAsistenciasExistentes();
    }
  }, [getAulaId(selectedAula), selectedDate]); // Solo ID del aula y fecha

  // Efecto adicional para procesar asistencias cuando se cargan por primera vez
  useEffect(() => {
    if (asistenciasRegistradas.length > 0 && estudiantes.length > 0) {
      console.log('🎯 Asistencias existentes detectadas, procesando...');
      // Forzar re-ejecución del useEffect principal
      const asistenciasIniciales = {};
      
      estudiantes.forEach(estudiante => {
        const idEstudiante = estudiante.id_estudiante || estudiante.idEstudiante;
        
        const asistenciaExistente = asistenciasRegistradas.find(
          asist => {
            const asistId = asist.idEstudiante || asist.id_estudiante || asist.idEstudiante;
            return asistId === idEstudiante;
          }
        );
        
        if (asistenciaExistente) {
          console.log('✅ Procesando asistencia existente:', asistenciaExistente);
          if (asistenciaExistente.asistio === true || asistenciaExistente.asistio === 'true') {
            if (asistenciaExistente.observaciones === 'Presente') {
              asistenciasIniciales[idEstudiante] = { estado: 'presente', observaciones: 'Presente' };
            } else if (asistenciaExistente.observaciones === 'Tardanza') {
              asistenciasIniciales[idEstudiante] = { estado: 'tardanza', observaciones: 'Tardanza' };
            } else if (asistenciaExistente.observaciones === 'Justificado') {
              asistenciasIniciales[idEstudiante] = { estado: 'justificado', observaciones: 'Justificado' };
            } else {
              asistenciasIniciales[idEstudiante] = { estado: 'presente', observaciones: asistenciaExistente.observaciones || 'Presente' };
            }
          } else if (asistenciaExistente.asistio === false || asistenciaExistente.asistio === 'false') {
            asistenciasIniciales[idEstudiante] = { estado: 'ausente', observaciones: asistenciaExistente.observaciones || 'Ausente' };
          } else {
            asistenciasIniciales[idEstudiante] = { estado: '', observaciones: '' };
          }
        } else {
          asistenciasIniciales[idEstudiante] = { estado: '', observaciones: '' };
        }
      });
      
      console.log('📋 Aplicando asistencias desde efecto secundario:', asistenciasIniciales);
      setAsistencias(asistenciasIniciales);
    }
  }, [asistenciasRegistradas.length, estudiantes.length]); // Solo cuando cambian las cantidades

  const handleAsistenciaChange = (estudianteId, estado, observaciones = null) => {
    setAsistencias(prev => ({
      ...prev,
      [estudianteId]: {
        estado: estado,
        observaciones: observaciones !== null ? observaciones : (prev[estudianteId]?.observaciones || '')
      }
    }));
  };

  const handleGuardarAsistencias = async () => {
    if (!selectedAula) {
      toast.error('Selecciona un aula primero');
      return;
    }

    // Obtener la hora actual en formato HH:MM:SS
    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0]; // Formato "HH:MM:SS"

    // Preparar datos para el registro masivo - HORA VA EN EL NIVEL SUPERIOR
    const asistenciasData = {
      fecha: selectedDate,
      hora: hora, // ← HORA VA AQUÍ, NO EN CADA ASISTENCIA
      idAula: selectedAula.id_aula || selectedAula.idAula,
      asistencias: Object.entries(asistencias)
        .filter(([_, asistenciaData]) => asistenciaData.estado !== '') // Solo enviar asistencias que tienen estado
        .map(([estudianteId, asistenciaData]) => {
          // Convertir el estado local al formato del backend
          let asistio = true;
          let observaciones = asistenciaData.observaciones || 'Presente';
          
          switch (asistenciaData.estado) {
            case 'presente':
              asistio = true;
              if (!asistenciaData.observaciones) observaciones = 'Presente';
              break;
            case 'ausente':
              asistio = false;
              if (!asistenciaData.observaciones) observaciones = 'Ausente';
              break;
            case 'tardanza':
              asistio = true;
              if (!asistenciaData.observaciones) observaciones = 'Tardanza';
              break;
            case 'justificado':
              asistio = true;
              if (!asistenciaData.observaciones) observaciones = 'Justificado';
              break;
          }
          
          return {
            idEstudiante: estudianteId,
            asistio: asistio,
            observaciones: observaciones
            // ← SIN CAMPO HORA AQUÍ
          };
        })
    };

    if (asistenciasData.asistencias.length === 0) {
      toast.error('No hay asistencias para registrar');
      return;
    }

    try {
      await registrarAsistencia(asistenciasData);
      toast.success(`Asistencias guardadas correctamente para ${asistenciasData.asistencias.length} estudiantes`);
      
      // Refrescar datos después del registro
      await refetchAsistenciasExistentes();
    } catch (error) {
      toast.error('Error al guardar las asistencias');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'presente':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ausente':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'tardanza':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'justificado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'presente':
        return <UserCheck className="w-4 h-4" />;
      case 'ausente':
        return <UserX className="w-4 h-4" />;
      case 'tardanza':
        return <Clock className="w-4 h-4" />;
      case 'justificado':
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Filtrar estudiantes por término de búsqueda
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    const nombreCompleto = `${estudiante.nombres || estudiante.nombre || ''} ${estudiante.apellido_paterno || estudiante.apellidoPaterno || ''} ${estudiante.apellido_materno || estudiante.apellidoMaterno || ''}`;
    return nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Estadísticas
  const estadisticas = {
    total: estudiantesFiltrados.length,
    presentes: Object.values(asistencias).filter(estado => estado === 'presente').length,
    ausentes: Object.values(asistencias).filter(estado => estado === 'ausente').length,
    tardanzas: Object.values(asistencias).filter(estado => estado === 'tardanza').length,
    justificados: Object.values(asistencias).filter(estado => estado === 'justificado').length,
    pendientes: Object.values(asistencias).filter(estado => estado === '').length
  };

  const porcentajeAsistencia = estadisticas.total > 0 
    ? ((estadisticas.presentes + estadisticas.tardanzas) / estadisticas.total * 100).toFixed(1)
    : 0;

  if (loadingAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando aulas...</span>
        </div>
      </div>
    );
  }

  if (errorAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error al cargar las aulas</p>
          <p className="text-sm text-red-600">
            {errorAulas?.message || errorAulas?.toString() || 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  if (!tieneAulas) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No tienes aulas asignadas</p>
          <p className="text-sm text-gray-500">Contacta al administrador para asignar aulas</p>
        </div>
      </div>
    );
  }

  if (errorEstudiantes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error al cargar los estudiantes</p>
          <p className="text-sm text-red-600">
            {errorEstudiantes?.message || errorEstudiantes?.toString() || 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  if (errorAsistenciasExistentes) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error al cargar las asistencias existentes</p>
          <p className="text-sm text-red-600">
            {errorAsistenciasExistentes?.message || errorAsistenciasExistentes?.toString() || 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  if (!selectedAula) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <School className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Selecciona un aula para continuar</p>
          <p className="text-sm text-gray-500">Elige un aula del selector arriba</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Registro de Asistencia" theme="green" />

      {/* Controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Aula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aula
            </label>
            <select
              value={selectedAula?.id_aula || selectedAula?.idAula || ''}
              onChange={(e) => {
                const aula = aulas.find(a => (a.id_aula || a.idAula) === e.target.value);
                setSelectedAula(aula);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar aula</option>
              {aulas.map((aula) => (
                <option key={aula.id_aula || aula.idAula} value={aula.id_aula || aula.idAula}>
                  {aula.nombre} - {aula.grado}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar estudiante
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nombre del estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            onClick={() => {
              if (selectedAula) {
                refetchEstudiantes();
                refetchAsistenciasExistentes();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleGuardarAsistencias}
            disabled={loadingRegistro || !selectedAula || estudiantesFiltrados.length === 0}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRegistro ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Asistencias</span>
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {selectedAula && estudiantesFiltrados.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Presentes</p>
                <p className="text-2xl font-bold text-green-700">{estadisticas.presentes}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Ausentes</p>
                <p className="text-2xl font-bold text-red-700">{estadisticas.ausentes}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Tardanzas</p>
                <p className="text-2xl font-bold text-yellow-700">{estadisticas.tardanzas}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Justificados</p>
                <p className="text-2xl font-bold text-blue-700">{estadisticas.justificados}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">% Asistencia</p>
                <p className="text-2xl font-bold text-purple-700">{porcentajeAsistencia}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Lista de estudiantes */}
      {selectedAula && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estudiantes - {selectedAula.nombre}
                </h3>
                <p className="text-sm text-gray-600">
                  Fecha: {formatDatePeru(selectedDate, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {tieneAsistenciasRegistradas && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <UserCheck className="w-4 h-4" />
                  <span>Asistencias ya registradas</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loadingEstudiantes || loadingAsistenciasExistentes ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-gray-600">Cargando estudiantes...</span>
                </div>
              </div>
            ) : errorEstudiantes ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-600">Error al cargar estudiantes</p>
                <p className="text-sm text-red-600">{errorEstudiantes}</p>
              </div>
            ) : estudiantesFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {searchTerm ? 'No se encontraron estudiantes' : 'No hay estudiantes en esta aula'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {estudiantesFiltrados.map((estudiante, index) => {
                  const idEstudiante = estudiante.id_estudiante || estudiante.idEstudiante;
                  const asistenciaActual = asistencias[idEstudiante] || { estado: '', observaciones: '' };
                  
                  return (
                    <div
                      key={idEstudiante}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {estudiante.nombres || estudiante.nombre || 'Sin nombre'} {estudiante.apellido}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Campo de observaciones */}
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium text-gray-700">Observaciones:</label>
                          <input
                            type="text"
                            placeholder="Opcional..."
                            value={asistenciaActual.observaciones}
                            onChange={(e) => handleAsistenciaChange(idEstudiante, asistenciaActual.estado, e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-40"
                          />
                        </div>

                        {/* Estado actual */}
                        {asistenciaActual.estado && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(asistenciaActual.estado)}`}>
                            {getEstadoIcon(asistenciaActual.estado)}
                            <span className="capitalize">{asistenciaActual.estado}</span>
                          </div>
                        )}

                        {/* Botones de estado */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleAsistenciaChange(idEstudiante, 'presente', asistenciaActual.observaciones)}
                            className={`p-2 rounded-md transition-colors ${
                              asistenciaActual.estado === 'presente'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600'
                            }`}
                            title="Presente"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAsistenciaChange(idEstudiante, 'ausente', asistenciaActual.observaciones)}
                            className={`p-2 rounded-md transition-colors ${
                              asistenciaActual.estado === 'ausente'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600'
                            }`}
                            title="Ausente"
                          >
                            <UserX className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAsistenciaChange(idEstudiante, 'tardanza', asistenciaActual.observaciones)}
                            className={`p-2 rounded-md transition-colors ${
                              asistenciaActual.estado === 'tardanza'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-100 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600'
                            }`}
                            title="Tardanza"
                          >
                            <Clock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleAsistenciaChange(idEstudiante, 'justificado', asistenciaActual.observaciones)}
                            className={`p-2 rounded-md transition-colors ${
                              asistenciaActual.estado === 'justificado'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
                            }`}
                            title="Justificado"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                          {asistenciaActual.estado && (
                            <button
                              onClick={() => handleAsistenciaChange(idEstudiante, '', '')}
                              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600"
                              title="Limpiar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Asistencia;
