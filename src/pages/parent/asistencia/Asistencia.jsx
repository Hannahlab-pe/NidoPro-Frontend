import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Filter,
  Search,
  Download,
  Loader2
} from 'lucide-react';
import { useHistorialAsistenciasEstudiante } from '../../../hooks/queries/useAsistenciaQueries';
import { formatDatePeru } from '../../../utils/dateUtils';

const Asistencia = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  // Función para decodificar JWT y extraer entidadId
  const getEntidadIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ [COMPONENTE] No hay token en localStorage');
        return null;
      }

      // Decodificar JWT (solo la parte del payload)
      const base64Payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(base64Payload));
      
      console.log('🔓 [COMPONENTE] Token decodificado:', decodedPayload);
      console.log('🆔 [COMPONENTE] entidadId extraído:', decodedPayload.entidadId);
      
      return decodedPayload.entidadId;
    } catch (error) {
      console.error('❌ [COMPONENTE] Error al decodificar token:', error);
      return null;
    }
  };

  // Obtener ID del estudiante desde el token JWT
  const entidadId = getEntidadIdFromToken();
  
  // Debug del localStorage
  console.log('🔍 [COMPONENTE] Debugging localStorage y datos:');
  console.log('📝 [COMPONENTE] entidadId extraído del token:', entidadId);
  console.log('📦 [COMPONENTE] Todo el localStorage:', {
    entidadId: entidadId,
    token: localStorage.getItem('token') ? 'EXISTE' : 'NO EXISTE',
    user: localStorage.getItem('user'),
    allKeys: Object.keys(localStorage)
  });

  // Hook para obtener historial de asistencias
  const {
    data: historialData,
    isLoading,
    error,
    refetch
  } = useHistorialAsistenciasEstudiante(entidadId);

  // Debug de los datos recibidos
  console.log('📊 [COMPONENTE] Estado del hook:');
  console.log('⏳ [COMPONENTE] isLoading:', isLoading);
  console.log('❌ [COMPONENTE] error:', error);
  console.log('💾 [COMPONENTE] historialData completa:', historialData);
  console.log('📋 [COMPONENTE] asistencias procesadas:', historialData?.info?.data);

  const asistencias = historialData?.info?.data || [];
  const totalRegistros = historialData?.info?.totalRegistros || 0;

  console.log('📈 [COMPONENTE] Datos finales:', {
    asistenciasLength: asistencias.length,
    totalRegistros,
    firstItem: asistencias[0] || 'NO HAY DATOS'
  });

  // Procesar datos para estadísticas
  const estadisticas = React.useMemo(() => {
    const total = asistencias.length;
    const presentes = asistencias.filter(a => a.asistio === true && (a.observaciones === 'Presente' || a.observaciones === '')).length;
    const ausentes = asistencias.filter(a => a.asistio === false).length;
    const tardanzas = asistencias.filter(a => a.asistio === true && a.observaciones === 'Tardanza').length;
    const justificados = asistencias.filter(a => a.asistio === true && a.observaciones === 'Justificado').length;
    
    const porcentajeAsistencia = total > 0 ? ((presentes + tardanzas + justificados) / total * 100).toFixed(1) : 0;

    return {
      total,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      porcentajeAsistencia
    };
  }, [asistencias]);

  // Función helper para obtener mes y año en zona horaria de Perú
  const getMesAnioPeru = (fechaString) => {
    const fecha = new Date(fechaString + 'T12:00:00-05:00'); // Forzar zona horaria de Perú
    return {
      mes: fecha.getMonth(),
      anio: fecha.getFullYear()
    };
  };

  // Filtrar asistencias por mes/año y búsqueda
  const asistenciasFiltradas = React.useMemo(() => {
    return asistencias.filter(asistencia => {
      const { mes, anio } = getMesAnioPeru(asistencia.fecha);
      const mesCoincide = selectedMonth === '' ? true : mes === selectedMonth;
      const añoCoincide = anio === selectedYear;
      
      // Filtro por estado
      let estadoCoincide = true;
      if (filterStatus !== 'todos') {
        if (filterStatus === 'presente') {
          estadoCoincide = asistencia.asistio === true && (asistencia.observaciones === 'Presente' || asistencia.observaciones === '');
        } else if (filterStatus === 'ausente') {
          estadoCoincide = asistencia.asistio === false;
        } else if (filterStatus === 'tardanza') {
          estadoCoincide = asistencia.asistio === true && asistencia.observaciones === 'Tardanza';
        } else if (filterStatus === 'justificado') {
          estadoCoincide = asistencia.asistio === true && asistencia.observaciones === 'Justificado';
        }
      }

      // Filtro por búsqueda (fecha u observaciones)
      const observacionTexto = (asistencia.observaciones || '').toString();
      const busquedaCoincide = searchTerm === '' || 
        asistencia.fecha.includes(searchTerm) ||
        observacionTexto.toLowerCase().includes(searchTerm.toLowerCase());

      return mesCoincide && añoCoincide && estadoCoincide && busquedaCoincide;
    }).sort((a, b) => {
      // Convertir fechas a zona horaria de Perú para ordenamiento correcto
      const fechaA = new Date(a.fecha + 'T12:00:00-05:00');
      const fechaB = new Date(b.fecha + 'T12:00:00-05:00');
      return fechaB - fechaA; // Más recientes primero
    });
  }, [asistencias, selectedMonth, selectedYear, filterStatus, searchTerm]);

  const getEstadoInfo = (asistencia) => {
    if (asistencia.asistio === false) {
      return {
        status: 'ausente',
        icon: <XCircle className="w-5 h-5" />,
        color: 'text-red-600 bg-red-100',
        label: 'Ausente'
      };
    }
    
    if (asistencia.observaciones === 'Tardanza') {
      return {
        status: 'tardanza',
        icon: <Clock className="w-5 h-5" />,
        color: 'text-yellow-600 bg-yellow-100',
        label: 'Tardanza'
      };
    }
    
    if (asistencia.observaciones === 'Justificado') {
      return {
        status: 'justificado',
        icon: <AlertTriangle className="w-5 h-5" />,
        color: 'text-blue-600 bg-blue-100',
        label: 'Justificado'
      };
    }
    
    return {
      status: 'presente',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-green-600 bg-green-100',
      label: 'Presente'
    };
  };

  const formatFecha = (fecha) => {
    return formatDatePeru(fecha, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando historial de asistencias...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Error al cargar el historial de asistencias</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Historial de Asistencias</h1>
        <p className="text-gray-600">Consulta el registro de asistencias de tu hijo/a</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Presentes</p>
              <p className="text-2xl font-bold text-green-700">{estadisticas.presentes}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Ausentes</p>
              <p className="text-2xl font-bold text-red-700">{estadisticas.ausentes}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
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
              <p className="text-sm font-medium text-purple-600">% Asistencia</p>
              <p className="text-2xl font-bold text-purple-700">{estadisticas.porcentajeAsistencia}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selector de Mes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes
            </label>
            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value === '' ? '' : parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {meses.map((mes, index) => (
                <option key={index} value={index}>
                  {mes}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Año */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
              <option value="tardanza">Tardanza</option>
              <option value="justificado">Justificado</option>
            </select>
          </div>

          {/* Búsqueda */}
          
        </div>
      </div>

      {/* Lista de Asistencias */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Registro de Asistencias - {selectedMonth === '' ? 'Todos los meses' : meses[selectedMonth]} {selectedYear}
            </h3>
            <span className="text-sm text-gray-600">
              {asistenciasFiltradas.length} registro(s)
            </span>
          </div>
        </div>

        <div className="p-6">
          {asistenciasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No hay registros de asistencia</p>
              <p className="text-sm text-gray-500">
                {filterStatus !== 'todos' || searchTerm !== '' 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : `No hay asistencias registradas para ${selectedMonth === '' ? 'todo el año' : meses[selectedMonth]} ${selectedYear}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {asistenciasFiltradas.map((asistencia) => {
                const estadoInfo = getEstadoInfo(asistencia);
                
                return (
                  <div
                    key={asistencia.idAsistencia}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${estadoInfo.color}`}>
                        {estadoInfo.icon}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {formatFecha(asistencia.fecha)}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>Hora: {asistencia.hora}</span>
                          </span>
                          {asistencia.observaciones && asistencia.observaciones !== '' && (
                            <span className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>Obs: {asistencia.observaciones}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${estadoInfo.color}`}>
                      {estadoInfo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Asistencia;


