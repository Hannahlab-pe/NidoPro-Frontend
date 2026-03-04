import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin,
  Users,
  BookOpen,
  Eye,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  User
} from 'lucide-react';
import CalendarioHorarios from '../../teacher/horarios/components/CalendarioHorarios';
import { useAuthStore } from '../../../store/useAuthStore';
import { useEstudianteConCronograma } from '../../../hooks/queries/useEstudianteQueries';
import PageHeader from '../../../components/common/PageHeader';

const Cronograma = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month'); // month por defecto en desktop
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Hooks para datos
  const { user } = useAuthStore();
  const estudianteId = user?.entidadId || localStorage.getItem('entidadId');
  
  // Debug del estudianteId
  console.log('👤 Datos de usuario parent completos:', {
    user,
    estudianteId,
    entidadIdFromUser: user?.entidadId,
    entidadIdFromStorage: localStorage.getItem('entidadId'),
    rol: user?.rol
  });
  
  // Obtener datos del estudiante y su cronograma
  const { 
    estudiante,
    cronograma = [],
    aulaInfo,
    isLoading,
    hasError,
    errors,
    refetchCronograma,
    isLoadingEstudiante,
    isLoadingCronograma,
    errorEstudiante,
    errorCronograma
  } = useEstudianteConCronograma(estudianteId, {
    enabled: !!estudianteId,
    refetchOnMount: true,
    staleTime: 0, // Forzar refetch
  });
  
  // Debug logs
  console.log('👦 Datos del estudiante:', estudiante);
  console.log('📅 Cronograma obtenido:', cronograma);
  console.log('🏫 Información del aula:', aulaInfo);
  console.log('⏳ Estados de loading:', { 
    isLoading, 
    isLoadingEstudiante, 
    isLoadingCronograma 
  });
  
  if (hasError) {
    console.error('❌ Errores encontrados:', errors);
  }

  // Hook para detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // En móvil, cambiar a vista de día para mejor experiencia
      if (mobile) {
        setSelectedView('day');
      } else {
        // En desktop, mantener vista de mes como predeterminada
        if (selectedView === 'day' && !mobile) {
          setSelectedView('month');
        }
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [selectedView]);

  // Handlers para el calendario
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    console.log('Evento seleccionado:', event);
  };

  const handleSelectSlot = (slotInfo) => {
    console.log('Slot seleccionado:', slotInfo);
    // Los padres no pueden crear nuevas actividades
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleNavigate = (date) => {
    setCurrentWeek(date);
  };

  const handleRefresh = () => {
    refetchCronograma();
  };

  // Función para transformar datos del cronograma al formato del calendario
  const transformarCronogramaParaCalendario = (cronogramaDatos) => {
    if (!Array.isArray(cronogramaDatos)) {
      console.log('⚠️ cronogramaDatos no es un array:', cronogramaDatos);
      return [];
    }

    console.log('🔄 Transformando cronograma:', cronogramaDatos);

    return cronogramaDatos.map((actividad, index) => {
      console.log('📝 Procesando actividad:', actividad);
      
      // Los datos del backend usan nombres con guiones bajos
      let fechaInicio = new Date(actividad.fecha_inicio);
      let fechaFin = new Date(actividad.fecha_fin);
      
      // Si las fechas son iguales o la fecha fin es inválida, agregar duración de 2 horas
      if (fechaInicio.getTime() === fechaFin.getTime() || isNaN(fechaFin.getTime())) {
        fechaFin = new Date(fechaInicio.getTime() + (2 * 60 * 60 * 1000)); // +2 horas
      }
      
      // Si las fechas no tienen hora específica (son medianoche), agregar horas por defecto
      if (fechaInicio.getHours() === 0 && fechaInicio.getMinutes() === 0) {
        fechaInicio.setHours(9, 0); // 9:00 AM por defecto
        fechaFin.setHours(11, 0); // 11:00 AM por defecto
      }
      
      const eventoTransformado = {
        id: actividad.id_cronograma || `actividad-${index}`,
        title: actividad.nombre_actividad || 'Actividad sin nombre',
        start: fechaInicio,
        end: fechaFin,
        resource: {
          tipo: actividad.tipo || 'actividad',
          descripcion: actividad.descripcion || '',
          idCronograma: actividad.id_cronograma,
          seccion: actividad.seccion,
          grado: actividad.grado,
          nombreTrabajador: actividad.nombre_trabajador,
          apellidoTrabajador: actividad.apellido_trabajador,
          estado: actividad.estado || 'activo'
        },
        // Colores según tipo de actividad
        backgroundColor: getColorPorTipo(actividad.tipo || 'actividad'),
        borderColor: getColorPorTipo(actividad.tipo || 'actividad'),
      };
      
      console.log('✅ Evento transformado:', eventoTransformado);
      return eventoTransformado;
    });
  };

  // Función para asignar colores según el tipo de actividad
  const getColorPorTipo = (tipo) => {
    const colores = {
      clase: '#3B82F6',      // Azul
      reunion: '#F59E0B',    // Amarillo
      evaluacion: '#EF4444', // Rojo
      actividad: '#10B981',  // Verde
      capacitacion: '#8B5CF6', // Púrpura
      default: '#6B7280'     // Gris
    };
    
    return colores[tipo?.toLowerCase()] || colores.default;
  };

  // Datos del cronograma procesados para el calendario
  const eventosCalendario = transformarCronogramaParaCalendario(cronograma);
  
  console.log('🎯 FINAL - Datos para el calendario:', {
    cronogramaDatos: cronograma,
    eventosTransformados: eventosCalendario,
    cantidadEventos: eventosCalendario.length
  });

  return (
    <div className={`${isMobile ? 'h-screen flex flex-col' : 'space-y-6'} ${isMobile ? '' : ''}`}>
      {!isMobile && (
        <PageHeader
          title="Cronograma"
          theme="yellow"
          actions={(
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 px-4 py-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          )}
        />
      )}

      {/* Header */}
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 ${isMobile ? 'px-4 py-3 bg-white border-b shrink-0' : ''}`}>
        
        {/* Información del estudiante y aula */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-3">
            <div>
              {isMobile && (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Cronograma
                </h1>
              )}
              {aulaInfo?.grado && aulaInfo?.seccion && (
                <p className="text-sm text-gray-600">
                  {aulaInfo.grado} - Sección {aulaInfo.seccion}
                  {aulaInfo.cantidadEstudiantes && ` • ${aulaInfo.cantidadEstudiantes} estudiantes`}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center space-x-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 ${
              isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
            }`}
          >
            <RefreshCw className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Información del estudiante en card */}
     

      {/* Estados de carga y error */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando cronograma...
            </h3>
            <p className="text-gray-600">
              {isLoadingEstudiante && 'Obteniendo datos del estudiante...'}
              {isLoadingCronograma && 'Cargando actividades programadas...'}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar cronograma
            </h3>
            <div className="text-gray-600 space-y-1">
              {errorEstudiante && (
                <p>Error al cargar datos del estudiante: {errorEstudiante.message}</p>
              )}
              {errorCronograma && (
                <p>Error al cargar cronograma: {errorCronograma.message}</p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intentar de nuevo</span>
            </button>
          </div>
        </div>
      )}

      {/* Vista de Calendario */}
      {!isLoading && !hasError && (
        <div className={`${isMobile ? 'flex-1 overflow-hidden' : ''}`}>
          <CalendarioHorarios
            events={eventosCalendario}
            isLoading={isLoading}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            view={selectedView}
            onView={handleViewChange}
            date={currentWeek}
            onNavigate={handleNavigate}
            isMobile={isMobile}
            readOnly={true} // Los padres solo pueden ver, no editar
          />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasError && eventosCalendario.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="text-center">
            <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay actividades programadas
            </h3>
            <p className="text-gray-600">
              No se encontraron actividades en el cronograma del aula de tu hijo.
            </p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {!isLoading && !hasError && eventosCalendario.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          

          

        </div>
      )}
    </div>
  );
};

export default Cronograma;
