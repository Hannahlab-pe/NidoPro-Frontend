import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  BookOpen,
  Award,
  AlertTriangle,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { ModalAgregarNota, ModalEditarNota } from './modales';
import ModalConfirmarEliminar from './modales/ModalConfirmarEliminar';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAnotacionesByTrabajador } from '../../../hooks/queries/useAnotacionesQueries';
import { useAnotaciones } from '../../../hooks/useAnotaciones';
import { AnotacionCard } from './components';
import PageHeader from '../../../components/common/PageHeader';
import StatCard from '../../../components/common/StatCard';

const Notas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalAgregar, setShowModalAgregar] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [anotacionSeleccionada, setAnotacionSeleccionada] = useState(null);
  const [anotacionAEliminar, setAnotacionAEliminar] = useState(null);

  const { user } = useAuthStore();
  const trabajadorId = user?.entidadId || localStorage.getItem('entidadId');

  const { 
    data: anotaciones = [], 
    isLoading: loadingAnotaciones, 
    error: errorAnotaciones,
    refetch: refetchAnotaciones 
  } = useAnotacionesByTrabajador(trabajadorId, { enabled: !!trabajadorId, refetchOnMount: true });

  const { deleteAnotacion, deleting } = useAnotaciones();

  const filteredAnotaciones = anotaciones.filter(anotacion => {
    return searchTerm === '' ||
      anotacion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacion.observacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${anotacion.estudiante?.nombre} ${anotacion.estudiante?.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anotacion.curso?.nombreCurso?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleEditAnotacion = (anotacion) => { setAnotacionSeleccionada(anotacion); setShowModalEditar(true); };
  const handleDeleteAnotacion = (anotacion) => { setAnotacionAEliminar(anotacion); setShowModalEliminar(true); };

  const handleConfirmDelete = async () => {
    if (!anotacionAEliminar) return;
    try {
      await deleteAnotacion(anotacionAEliminar.idAnotacionAlumno);
      refetchAnotaciones();
      setShowModalEliminar(false);
      setAnotacionAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar anotación:', error);
    }
  };

  const handleModalSuccess = () => { refetchAnotaciones(); };
  const handleModalEditarSuccess = () => { refetchAnotaciones(); setShowModalEditar(false); setAnotacionSeleccionada(null); };
  const handleCloseModalEditar = () => { setShowModalEditar(false); setAnotacionSeleccionada(null); };
  const handleCloseModalEliminar = () => { setShowModalEliminar(false); setAnotacionAEliminar(null); };

  return (
    <div className="space-y-6">
      <PageHeader title="Anotaciones" theme="green" />

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={FileText}       label="Total"           value={anotaciones.length}                                                                                       color="#6b7280" />
        <StatCard icon={BookOpen}       label="Académicas"      value={anotaciones.filter(a => a.tipo === 'academic'    || a.categoria === 'academic').length}                    color="#2563eb" />
        <StatCard icon={Award}          label="Logros"          value={anotaciones.filter(a => a.tipo === 'achievement' || a.categoria === 'achievement').length}                 color="#16a34a" />
        <StatCard icon={AlertTriangle}  label="Preocupaciones"  value={anotaciones.filter(a => a.tipo === 'concern'     || a.categoria === 'concern').length}                     color="#dc2626" />
        <StatCard icon={User}           label="Comportamiento"  value={anotaciones.filter(a => a.tipo === 'behavior'    || a.categoria === 'behavior').length}                    color="#ca8a04" />
        <StatCard icon={MessageSquare}  label="Padres"          value={anotaciones.filter(a => a.tipo === 'parent'      || a.categoria === 'parent').length}                      color="#9333ea" />
      </div>

      {/* Filtros sin fondo de tarjeta */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Búsqueda */}
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar anotación</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Nombre, título, curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botón Nueva Anotación */}
        <button
          onClick={() => setShowModalAgregar(true)}
          disabled={loadingAnotaciones}
          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Anotación</span>
        </button>
      </div>

      {/* Lista de anotaciones */}
      {loadingAnotaciones ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <RefreshCw className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando anotaciones...</h3>
            <p className="text-gray-600">Obteniendo las anotaciones del profesor</p>
          </div>
        </div>
      ) : filteredAnotaciones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {errorAnotaciones ? 'Error al cargar anotaciones' : anotaciones.length === 0 ? 'No tienes anotaciones creadas' : 'No se encontraron anotaciones'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {errorAnotaciones
                ? 'Hubo un problema al cargar las anotaciones.'
                : anotaciones.length === 0
                  ? 'Comienza creando tu primera anotación'
                  : 'Intenta ajustar el término de búsqueda'}
            </p>
            {anotaciones.length === 0 && !errorAnotaciones && (
              <button
                onClick={() => setShowModalAgregar(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Crear primera anotación</span>
              </button>
            )}
          </div>
        </div>
      ) : (
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
      )}

      {/* Modales */}
      <ModalAgregarNota
        isOpen={showModalAgregar}
        onClose={() => setShowModalAgregar(false)}
        onSuccess={handleModalSuccess}
      />
      <ModalEditarNota
        isOpen={showModalEditar}
        onClose={handleCloseModalEditar}
        onSuccess={handleModalEditarSuccess}
        anotacion={anotacionSeleccionada}
      />
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
