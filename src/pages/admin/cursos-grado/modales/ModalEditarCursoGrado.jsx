import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { useCursos } from '../../../../hooks/useCursos';
import { useGrados } from '../../../../hooks/useGrados';
import { useUpdateCursoGrado } from '../../../../hooks/queries/useCursoGradoQueries';

const ModalEditarCursoGrado = ({ isOpen, onClose, cursoGrado, onSuccess }) => {
  const [formData, setFormData] = useState({
    idCurso: '',
    idGrado: '',
    fechaAsignacion: '',
    estaActivo: true
  });

  const [errors, setErrors] = useState({});

  // Hooks
  const { data: cursosData = [] } = useCursos();
  const { grados = [] } = useGrados();

  const cursos = Array.isArray(cursosData) ? cursosData : cursosData?.cursos || cursosData?.data || [];

  const updateMutation = useUpdateCursoGrado();

  // Cargar datos del curso-grado
  useEffect(() => {
    if (isOpen && cursoGrado) {
      setFormData({
        idCurso: cursoGrado.idCurso || cursoGrado.id_curso || '',
        idGrado: cursoGrado.idGrado || cursoGrado.id_grado || '',
        fechaAsignacion: cursoGrado.fechaAsignacion ?
          new Date(cursoGrado.fechaAsignacion).toISOString().split('T')[0] : '',
        estaActivo: cursoGrado.estaActivo ?? true
      });
      setErrors({});
    }
  }, [isOpen, cursoGrado]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idGrado) {
      newErrors.idGrado = 'Debe seleccionar un grado';
    }

    if (!formData.idCurso) {
      newErrors.idCurso = 'Debe seleccionar un curso';
    }

    if (!formData.fechaAsignacion) {
      newErrors.fechaAsignacion = 'La fecha de asignación es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const id = cursoGrado.idCursoGrado || cursoGrado.id_curso_grado;
      await updateMutation.mutateAsync({
        id,
        cursoGradoData: formData
      });
      onSuccess();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Editar Asignación
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Grado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      Grado Académico *
                    </label>
                    <select
                      name="idGrado"
                      value={formData.idGrado}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.idGrado ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar grado</option>
                      {grados.map((grado) => (
                        <option key={grado.idGrado || grado.id} value={grado.idGrado || grado.id}>
                          {grado.grado || grado.nombreGrado} {grado.nivel ? `- ${grado.nivel}` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.idGrado && <p className="mt-1 text-sm text-red-600">{errors.idGrado}</p>}
                  </div>

                  {/* Curso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Curso *
                    </label>
                    <select
                      name="idCurso"
                      value={formData.idCurso}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.idCurso ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Seleccionar curso</option>
                      {cursos.map((curso) => (
                        <option key={curso.idCurso || curso.id} value={curso.idCurso || curso.id}>
                          {curso.nombreCurso || curso.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.idCurso && <p className="mt-1 text-sm text-red-600">{errors.idCurso}</p>}
                  </div>

                  {/* Fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha de Asignación *
                    </label>
                    <input
                      type="date"
                      name="fechaAsignacion"
                      value={formData.fechaAsignacion}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.fechaAsignacion ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.fechaAsignacion && <p className="mt-1 text-sm text-red-600">{errors.fechaAsignacion}</p>}
                  </div>

                  {/* Estado */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="estaActivo"
                      checked={formData.estaActivo}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">Asignación activa</label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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

export default ModalEditarCursoGrado;
