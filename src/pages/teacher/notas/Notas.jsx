import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Save,
  X,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  BookOpen,
  Award,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ModalAgregarNota, ModalEditarNota } from './modales';
import ModalConfirmarEliminar from './modales/ModalConfirmarEliminar';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAnotacionesByTrabajador } from '../../../hooks/queries/useAnotacionesQueries';
import { useAnotaciones } from '../../../hooks/useAnotaciones';
import { AnotacionCard } from './components';
import PageHeader from '../../../components/common/PageHeader';

const Notas = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [anotacionSeleccionada, setAnotacionSeleccionada] = useState(null);
  const [anotacionAEliminar, setAnotacionAEliminar] = useState(null);

  // Hooks para datos
  const { user } = useAuthStore();
  const trabajadorId = user?.entidadId || localStorage.getItem('entidadId');
  
  // Hook para obtener anotaciones del trabajador
  const { 
    data: anotaciones = [], 
    isLoading: loadingAnotaciones, 
    error: errorAnotaciones,
    refetch: refetchAnotaciones 
  } = useAnotacionesByTrabajador(
    trabajadorId,
    { 
      enabled: !!trabajadorId,
      refetchOnMount: true 
    }
  );

  // Hook para operaciones CRUD de anotaciones
  const { deleteAnotacion, deleting } = useAnotaciones();

  // Debug logs
  console.log('📝 Datos del trabajador:', {
    user,
    trabajadorId,
    entidadIdFromUser: user?.entidadId,
    entidadIdFromStorage: localStorage.getItem('entidadId')
  });
  console.log('📝 Anotaciones obtenidas:', anotaciones);
  console.log('📝 Estado de loading:', loadingAnotaciones);
  
  if (errorAnotaciones) {
    console.error('❌ Error al cargar anotaciones:', errorAnotaciones);
  }

  const [newNote, setNewNote] = useState({
    student: '',
    category: 'academic',
    title: '',
    content: '',
    priority: 'medium'
  });

  // Datos fake de anotaciones
  const [notes, setNotes] = useState([
    {
      id: 1,
      student: "Ana María García",
      studentId: 1,
      category: "academic",
      title: "Excelente progreso en matemáticas",
      content: "Ana ha mostrado una mejora significativa en la resolución de problemas de fracciones. Su participación en clase es activa y sus tareas están bien desarrolladas.",
      date: new Date(Date.now() - 86400000),
      priority: "high",
      status: "active",
      tags: ["matemáticas", "progreso", "participación"]
    },
    {
      id: 2,
      student: "Carlos Eduardo López",
      studentId: 2,
      category: "behavior",
      title: "Incidente en el recreo",
      content: "Carlos tuvo una discusión menor con un compañero durante el recreo. Se conversó con ambos estudiantes y resolvieron sus diferencias. Requiere seguimiento.",
      date: new Date(Date.now() - 172800000),
      priority: "medium",
      status: "pending",
      tags: ["comportamiento", "conflicto", "seguimiento"]
    },
    {
      id: 3,
      student: "Isabella Rodríguez",
      studentId: 3,
      category: "achievement",
      title: "Reconocimiento por proyecto de ciencias",
      content: "Isabella presentó un proyecto excepcional sobre el sistema solar. Su creatividad y dedicación fueron notables. Se recomienda para la feria de ciencias.",
      date: new Date(Date.now() - 259200000),
      priority: "high",
      status: "completed",
      tags: ["ciencias", "proyecto", "creatividad", "reconocimiento"]
    },
    {
      id: 4,
      student: "Diego Fernández",
      studentId: 4,
      category: "concern",
      title: "Ausencias frecuentes",
      content: "Diego ha faltado 3 veces esta semana. Los padres indican problemas de salud menores. Importante dar seguimiento a las tareas perdidas.",
      date: new Date(Date.now() - 345600000),
      priority: "high",
      status: "active",
      tags: ["ausencias", "salud", "tareas", "seguimiento"]
    },
    {
      id: 5,
      student: "Sofía Mendoza",
      studentId: 5,
      category: "parent",
      title: "Reunión con padres",
      content: "Los padres de Sofía solicitaron reunión para discutir su progreso académico. Se programó para el viernes. Preparar informe de rendimiento.",
      date: new Date(Date.now() - 432000000),
      priority: "medium",
      status: "pending",
      tags: ["padres", "reunión", "progreso", "informe"]
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas las categorías', icon: FileText, color: '#6B7280' },
    { id: 'academic', name: 'Académico', icon: BookOpen, color: '#3B82F6' },
    { id: 'behavior', name: 'Comportamiento', icon: User, color: '#F59E0B' },
    { id: 'achievement', name: 'Logros', icon: Award, color: '#10B981' },
    { id: 'concern', name: 'Preocupaciones', icon: AlertTriangle, color: '#EF4444' },
    { id: 'parent', name: 'Padres', icon: MessageSquare, color: '#8B5CF6' }
  ];

  const priorities = [
    { id: 'low', name: 'Baja', color: '#10B981' },
    { id: 'medium', name: 'Media', color: '#F59E0B' },
    { id: 'high', name: 'Alta', color: '#EF4444' }
  ];

  const students = [
    { id: 1, name: "Ana María García" },
    { id: 2, name: "Carlos Eduardo López" },
    { id: 3, name: "Isabella Rodríguez" },
    { id: 4, name: "Diego Fernández" },
    { id: 5, name: "Sofía Mendoza" }
  ];

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : '#6B7280';
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : FileText;
  };

  const getPriorityColor = (priority) => {
    const prio = priorities.find(p => p.id === priority);
    return prio ? prio.color : '#F59E0B';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'active':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  // Filtros para las anotaciones
  const filteredAnotaciones = anotaciones.filter(anotacion => {
    const matchesSearch = searchTerm === '' || 
      anotacion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacion.observacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${anotacion.estudiante?.nombre} ${anotacion.estudiante?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacion.curso?.nombreCurso?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Por ahora no filtramos por categoría ya que el backend no devuelve categorías específicas
    // Podrías agregar esta lógica si tienes un campo de categoría en el backend
    return matchesSearch;
  });

  // Handlers para las acciones
  const handleEditAnotacion = (anotacion) => {
    setAnotacionSeleccionada(anotacion);
    setShowModalEditar(true);
  };

  const handleDeleteAnotacion = (anotacion) => {
    setAnotacionAEliminar(anotacion);
    setShowModalEliminar(true);
  };

  const handleConfirmDelete = async () => {
    if (!anotacionAEliminar) return;

    try {
      await deleteAnotacion(anotacionAEliminar.idAnotacionAlumno);
      refetchAnotaciones(); // Recargar la lista después de eliminar
      setShowModalEliminar(false);
      setAnotacionAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar anotación:', error);
      // El error ya se maneja en el hook useAnotaciones
    }
  };

  const handleRefresh = () => {
    refetchAnotaciones();
  };

  const handleCreateNote = () => {
    if (newNote.title && newNote.content && newNote.student) {
      const note = {
        id: Date.now(),
        ...newNote,
        date: new Date(),
        status: 'active',
        tags: newNote.content.toLowerCase().split(' ').filter(word => word.length > 4).slice(0, 3)
      };
      setNotes(prev => [note, ...prev]);
      setNewNote({
        student: '',
        category: 'academic',
        title: '',
        content: '',
        priority: 'medium'
      });
      setIsCreating(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Funciones para el modal
  const handleModalSuccess = () => {
    refetchAnotaciones();
  };

  const handleModalEditarSuccess = () => {
    refetchAnotaciones();
    setShowModalEditar(false);
    setAnotacionSeleccionada(null);
  };

  const handleCloseModal = () => {
    setShowModalAgregar(false);
  };

  const handleCloseModalEditar = () => {
    setShowModalEditar(false);
    setAnotacionSeleccionada(null);
  };

  const handleCloseModalEliminar = () => {
    setShowModalEliminar(false);
    setAnotacionAEliminar(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anotaciones"
        theme="green"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModalAgregar(true)}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Anotación</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loadingAnotaciones}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 border border-gray-300"
              title="Actualizar anotaciones"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAnotaciones ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        }
      />

      {/* Stats */}


      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar anotaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 flex items-center gap-4">
            <span>{filteredAnotaciones.length} anotaciones encontradas</span>
            
            {loadingAnotaciones && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Cargando...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingNote) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isCreating ? 'Nueva Anotación' : 'Editar Anotación'}
            </h3>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
                setNewNote({
                  student: '',
                  category: 'academic',
                  title: '',
                  content: '',
                  priority: 'medium'
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estudiante
              </label>
              <select
                value={newNote.student}
                onChange={(e) => setNewNote(prev => ({ ...prev, student: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Seleccionar estudiante</option>
                {students.map((student) => (
                  <option key={student.id} value={student.name}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {categories.filter(cat => cat.id !== 'all').map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newNote.priority}
                onChange={(e) => setNewNote(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título de la anotación"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido
            </label>
            <textarea
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Describe la observación, logro o preocupación..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateNote}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar</span>
            </button>
          </div>
        </div>
      )}

      {/* Anotaciones List - Formato Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAnotaciones.map((anotacion) => (
          <AnotacionCard
            key={anotacion.idAnotacionAlumno}
            anotacion={anotacion}
            onEdit={handleEditAnotacion}
            onDelete={handleDeleteAnotacion}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredAnotaciones.length === 0 && !loadingAnotaciones && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {errorAnotaciones ? 'Error al cargar anotaciones' : 'No se encontraron anotaciones'}
          </h3>
          <p className="text-gray-600 mb-4">
            {errorAnotaciones 
              ? 'Hubo un problema al cargar las anotaciones. Intenta actualizar.'
              : searchTerm 
                ? 'Prueba ajustando los filtros de búsqueda'
                : 'Comienza creando tu primera anotación'
            }
          </p>
          {!searchTerm && !errorAnotaciones && (
            <button
              onClick={() => setShowModalAgregar(true)}
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primera Anotación</span>
            </button>
          )}
          {errorAnotaciones && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Intentar de Nuevo</span>
            </button>
          )}
        </div>
      )}

      {/* Loading State */}
      {loadingAnotaciones && filteredAnotaciones.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando anotaciones...</h3>
          <p className="text-gray-600">Obteniendo todas las anotaciones del profesor</p>
        </div>
      )}

      {/* Modal para agregar nueva anotación */}
      <ModalAgregarNota
        isOpen={showModalAgregar}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
      />

      {/* Modal para editar anotación */}
      <ModalEditarNota
        isOpen={showModalEditar}
        onClose={handleCloseModalEditar}
        onSuccess={handleModalEditarSuccess}
        anotacion={anotacionSeleccionada}
      />

      {/* Modal para confirmar eliminación */}
      <ModalConfirmarEliminar
        isOpen={showModalEliminar}
        onClose={handleCloseModalEliminar}
        onConfirm={handleConfirmDelete}
        titulo="Eliminar Anotación"
        mensaje={`¿Estás seguro de que quieres eliminar la anotación "${anotacionAEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        loading={deleting}
      />
    </div>
  );
};

export default Notas;
