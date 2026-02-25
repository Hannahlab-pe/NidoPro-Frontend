import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  MapPin,
  Users,
  BookOpen,
  Bell,
  Filter,
  Download,
  Share2,
  MoreVertical,
  Eye,
  CalendarDays
} from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';
import CalendarioHorarios from './components/CalendarioHorarios';
import ModalAgregarActividad from './modales/ModalAgregarActividad';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAulasByTrabajador } from '../../../hooks/queries/useAulasQueries';
import { useCronogramaDocente } from '../../../hooks/queries/useCronogramaQueries';
import PageHeader from '../../../components/common/PageHeader';

// Configurar moment en español
moment.locale('es');

const Horarios = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month'); // month por defecto en desktop
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true); // Para alternar entre vista calendario y tabla
  const [selectedEvent, setSelectedEvent] = useState(null); // Evento seleccionado
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal de nueva actividad
  const [isMobile, setIsMobile] = useState(false);

  // Hooks para datos
  const { user } = useAuthStore();
  const trabajadorId = user?.entidadId || localStorage.getItem('entidadId');
  
  // Debug del trabajadorId
  console.log('👤 Datos de usuario completos:', {
    user,
    trabajadorId,
    entidadIdFromUser: user?.entidadId,
    entidadIdFromStorage: localStorage.getItem('entidadId'),
    rol: user?.rol
  });
  
  // Obtener aulas asignadas al docente
  const { 
    data: aulasTrabajador = [], 
    isLoading: loadingAulas, 
    error: errorAulas,
    isError: hasErrorAulas 
  } = useAulasByTrabajador(
    trabajadorId,
    { 
      enabled: !!trabajadorId,
      refetchOnMount: true,
      staleTime: 0, // Forzar actualización inmediata
      refetchOnWindowFocus: true,
    }
  );
  
  // Debug adicional para errores de aulas
  if (hasErrorAulas) {
    console.error('❌ Error al cargar aulas del trabajador:', errorAulas);
  }
  console.log('🔍 Query de aulas - Estado:', {
    trabajadorId,
    enabled: !!trabajadorId,
    aulasTrabajador,
    loadingAulas,
    hasErrorAulas,
    errorAulas
  });
  
  // Obtener cronograma de todas las aulas asignadas
  const { data: cronogramaData = [], isLoading: loadingCronograma, error: errorCronograma, refetch: refetchCronograma } = useCronogramaDocente(
    aulasTrabajador,
    { 
      enabled: !!(aulasTrabajador?.aulas?.length > 0 || (Array.isArray(aulasTrabajador) && aulasTrabajador.length > 0)),
      staleTime: 0, // Forzar actualización inmediata
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  );

  // Debug logs
  console.log('🏫 Aulas del trabajador:', aulasTrabajador);
  console.log('📅 Cronograma obtenido:', cronogramaData);
  console.log('⏳ Estados de loading:', { loadingAulas, loadingCronograma });
  
  if (errorCronograma) {
    console.error('❌ Error en cronograma:', errorCronograma);
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
    // Aquí puedes abrir un modal para crear nueva clase
  };

  const handleEventCreated = async (newEvent) => {
    console.log('Nueva actividad creada:', newEvent);
    // Forzar refetch inmediato del cronograma
    await refetchCronograma();
    console.log('✅ Cronograma actualizado después de crear nueva actividad');
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };

  const handleNavigate = (date) => {
    setCurrentWeek(date);
  };

  // Función para transformar datos del cronograma al formato del calendario
  const transformarCronogramaParaCalendario = (cronogramaDatos) => {
    if (!Array.isArray(cronogramaDatos)) {
      return [];
    }

    return cronogramaDatos.map((actividad, index) => {
      // Los datos del backend usan nombres con guiones bajos
      // Usar moment con zona horaria UTC para evitar problemas de conversión
      const fechaInicio = moment.utc(actividad.fecha_inicio).toDate();
      const fechaFin = moment.utc(actividad.fecha_fin).toDate();
      
      // Si las fechas no tienen hora específica, agregar horas por defecto
      if (fechaInicio.getHours() === 0 && fechaInicio.getMinutes() === 0) {
        fechaInicio.setHours(8, 0); // 8:00 AM por defecto
        fechaFin.setHours(9, 30); // 9:30 AM por defecto
      }
      
      return {
        id: actividad.id_cronograma || index,
        title: actividad.nombre_actividad || actividad.title || 'Actividad sin nombre',
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
  const eventosCalendario = transformarCronogramaParaCalendario(cronogramaData);

  // Loading state combinado
  const isLoading = loadingAulas || loadingCronograma;

  // Datos fake del cronograma (mantener como fallback)
  const HorariosDataFallback = [
    {
      id: 1,
      title: "Matemáticas - 5to A",
      subject: "Matemáticas",
      grade: "5to A",
      startTime: "08:00",
      endTime: "09:30",
      day: "monday",
      classroom: "Aula 201",
      students: 25,
      color: "#3B82F6",
      type: "class"
    },
    {
      id: 2,
      title: "Ciencias Naturales - 5to A",
      subject: "Ciencias",
      grade: "5to A",
      startTime: "09:45",
      endTime: "11:15",
      day: "monday",
      classroom: "Lab. Ciencias",
      students: 25,
      color: "#10B981",
      type: "class"
    },
    {
      id: 3,
      title: "Reunión de Padres",
      subject: "Reunión",
      startTime: "14:00",
      endTime: "16:00",
      day: "monday",
      classroom: "Aula 201",
      participants: "Padres 5to A",
      color: "#F59E0B",
      type: "meeting"
    }
  ];

  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes', short: 'L' },
    { key: 'tuesday', label: 'Martes', short: 'M' },
    { key: 'wednesday', label: 'Miércoles', short: 'X' },
    { key: 'thursday', label: 'Jueves', short: 'J' },
    { key: 'friday', label: 'Viernes', short: 'V' }
  ];

  const getEventsForDay = (day) => {
    return HorariosData.filter(event => event.day === day);
  };

  const getEventPosition = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const startMinutes = 7 * 60; // 7:00 AM
    return ((totalMinutes - startMinutes) / 30) * 60; // 60px por cada 30 minutos
  };

  const getEventHeight = (startTime, endTime) => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;
    const duration = endTotal - startTotal;
    return (duration / 30) * 60; // 60px por cada 30 minutos
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'class':
        return BookOpen;
      case 'meeting':
        return Users;
      case 'training':
        return BookOpen;
      case 'exam':
        return Edit;
      default:
        return Clock;
    }
  };

  const formatWeekRange = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lunes
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Viernes
    
    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} de ${endOfWeek.toLocaleDateString('es-ES', { month: 'long' })} ${endOfWeek.getFullYear()}`;
  };

  const navigateWeek = (direction) => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cronograma"
        theme="green"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Actividad</span>
          </button>
        }
      />


      {/* Vista de Calendario */}
      <div className={`${isMobile ? 'flex-1 overflow-hidden' : ''}`}>
        {showCalendar ? (
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
            onEventCreated={handleEventCreated}
          />
        ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-6 border-b border-gray-200">
            {/* Time column header */}
            <div className="p-4 bg-gray-50 border-r border-gray-200">
              <div className="text-sm font-medium text-gray-700">Hora</div>
            </div>
            
            {/* Day headers */}
            {daysOfWeek.map((day) => (
              <div key={day.key} className="p-4 bg-gray-50 text-center border-r border-gray-200 last:border-r-0">
                <div className="text-sm font-medium text-gray-900">{day.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <div className="grid grid-cols-6 min-h-[600px]">
              {/* Time slots */}
              <div className="border-r border-gray-200 bg-gray-50">
                {timeSlots.map((time, index) => (
                  <div
                    key={time}
                    className="h-[60px] border-b border-gray-100 px-4 py-2 text-sm text-gray-600"
                  >
                    {index % 2 === 0 ? time : ''}
                  </div>
                ))}
              </div>

              {/* Days columns */}
              {daysOfWeek.map((day) => (
                <div key={day.key} className="relative border-r border-gray-200 last:border-r-0">
                  {/* Time grid lines */}
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="h-[60px] border-b border-gray-100"
                    />
                  ))}
                  
                  {/* Events */}
                  {getEventsForDay(day.key).map((event) => {
                    const IconComponent = getTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 rounded-lg p-2 text-white text-xs shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: event.color,
                          top: `${getEventPosition(event.startTime)}px`,
                          height: `${getEventHeight(event.startTime, event.endTime)}px`,
                          minHeight: '50px'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-1 mb-1">
                              <IconComponent className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium truncate">{event.title}</span>
                            </div>
                            <div className="text-xs opacity-90 mb-1">
                              {event.startTime} - {event.endTime}
                            </div>
                            {event.classroom && (
                              <div className="flex items-center space-x-1 text-xs opacity-80">
                                <MapPin className="w-2 h-2" />
                                <span>{event.classroom}</span>
                              </div>
                            )}
                            {event.students && (
                              <div className="flex items-center space-x-1 text-xs opacity-80">
                                <Users className="w-2 h-2" />
                                <span>{event.students} estudiantes</span>
                              </div>
                            )}
                          </div>
                          <button className="p-1 hover:bg-black hover:bg-opacity-20 rounded">
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Quick Stats */}


      {/* Modal para agregar actividad */}
      <ModalAgregarActividad
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={null}
        onEventCreated={handleEventCreated}
      />
    </div>
  );
};

export default Horarios;
