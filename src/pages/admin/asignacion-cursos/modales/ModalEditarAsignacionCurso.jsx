import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, BookOpen, User, Calendar, CheckCircle, Edit } from 'lucide-react';
import { useCursos } from 'src/hooks/useCursos';
import { useTrabajadores } from 'src/hooks/queries/useTrabajadoresQueries';
import { useUpdateAsignacionCurso } from 'src/hooks/queries/useAsignacionCursosQueries';

const ModalEditarAsignacionCurso = ({ isOpen, onClose, asignacion, onSuccess }) => {
  const [formData, setFormData] = useState({
    fechaAsignacion: '',
    estaActivo: true,
    idCurso: '',
    idTrabajador: ''
  });

  const [errors, setErrors] = useState({});

  // Hooks para obtener datos
  const { data: cursos = [], isLoading: loadingCursos } = useCursos();
  const { data: trabajadoresData, isLoading: loadingTrabajadores } = useTrabajadores({});

  // Extraer trabajadores del hook
  const trabajadores = Array.isArray(trabajadoresData) ? trabajadoresData :
                       trabajadoresData?.trabajadores ? trabajadoresData.trabajadores :
                       trabajadoresData?.data ? trabajadoresData.data : [];

  // Hook para actualizar asignación
  const updateMutation = useUpdateAsignacionCurso();

  // Resetear formulario cuando se abre el modal o cambia la asignación
  useEffect(() => {
    if (isOpen && asignacion) {
      setFormData({
        fechaAsignacion: asignacion.fechaAsignacion ? asignacion.fechaAsignacion.split('T')[0] : '',
        estaActivo: asignacion.estaActivo ?? true,
        idCurso: asignacion.idCurso?.idCurso || asignacion.idCurso || '',
        idTrabajador: asignacion.idTrabajador?.idTrabajador || asignacion.idTrabajador || ''
      });
      setErrors({});
    }
  }, [isOpen, asignacion]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fechaAsignacion) {
      newErrors.fechaAsignacion = 'La fecha de asignación es obligatoria';
    }

    if (!formData.idCurso) {
      newErrors.idCurso = 'Debe seleccionar un curso';
    }

    if (!formData.idTrabajador) {
      newErrors.idTrabajador = 'Debe seleccionar un docente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || !asignacion) {
      return;
    }

    try {
      // Preparar los datos para el envío
      const asignacionData = {
        fechaAsignacion: formData.fechaAsignacion,
        estaActivo: formData.estaActivo,
        idCurso: formData.idCurso,
        idTrabajador: formData.idTrabajador
      };

      await updateMutation.mutateAsync({
        id: asignacion.idAsignacionCurso,
        asignacionData
      });
      onSuccess();
    } catch (error) {
      console.error('Error actualizando asignación de curso:', error);
      setErrors({ submit: 'Error al actualizar la asignación. Por favor, inténtelo de nuevo.' });
    }
  };

  const handleClose = () => {
    setFormData({
      fechaAsignacion: '',
      estaActivo: true,
      idCurso: '',
      idTrabajador: ''
    });
    setErrors({});
    onClose();
  };

  if (!asignacion) return null;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Edit className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Editar Asignación de Curso
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Modificar la asignación de curso
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Error general */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-600 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Fecha de Asignación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Asignación *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        name="fechaAsignacion"
                        value={formData.fechaAsignacion}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                          errors.fechaAsignacion ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.fechaAsignacion && <p className="text-red-500 text-xs mt-1">{errors.fechaAsignacion}</p>}
                  </div>

                  {/* Seleccionar Docente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Docente *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="idTrabajador"
                        value={formData.idTrabajador}
                        onChange={handleInputChange}
                        disabled={loadingTrabajadores}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                          errors.idTrabajador ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {loadingTrabajadores ? 'Cargando docentes...' : 'Seleccionar docente'}
                        </option>
                        {trabajadores
                          .filter(trabajador => trabajador.estaActivo) // Solo docentes activos
                          .map(trabajador => (
                            <option key={trabajador.idTrabajador} value={trabajador.idTrabajador}>
                              {trabajador.nombre} {trabajador.apellido}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    {errors.idTrabajador && <p className="text-red-500 text-xs mt-1">{errors.idTrabajador}</p>}
                  </div>

                  {/* Seleccionar Curso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Curso *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        name="idCurso"
                        value={formData.idCurso}
                        onChange={handleInputChange}
                        disabled={loadingCursos}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                          errors.idCurso ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {loadingCursos ? 'Cargando cursos...' : 'Seleccionar curso'}
                        </option>
                        {cursos.map(curso => (
                          <option key={curso.idCurso} value={curso.idCurso}>
                            {curso.nombreCurso || curso.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.idCurso && <p className="text-red-500 text-xs mt-1">{errors.idCurso}</p>}
                  </div>

                  {/* Estado Activo */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="estaActivo"
                      id="estaActivo"
                      checked={formData.estaActivo}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    />
                    <label htmlFor="estaActivo" className="ml-2 block text-sm text-gray-900">
                      Asignación activa
                    </label>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Actualizando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Actualizar Asignación
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalEditarAsignacionCurso;