import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Loader2, Search } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useUpdateAula } from '../../../../hooks/queries/useAulasQueries';
import { trabajadorService } from '../../../../services/trabajadorService';
import { useGradosOptions } from '../../../../hooks/useGrados';

const ModalEditarAula = ({ isOpen, onClose, aula }) => {
  const [form, setForm] = useState({
    seccion: '',
    cantidadEstudiantes: '',
    idTutor: '',
    idGrado: ''
  });

  const updateAulaMutation = useUpdateAula();
  const { options: gradosOptions, isLoading: loadingGrados } = useGradosOptions();

  // Estado para buscador de tutores
  const [docentes, setDocentes] = useState([]);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  const [searchTutor, setSearchTutor] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tutorSeleccionado, setTutorSeleccionado] = useState(null);
  const dropdownRef = useRef(null);

  // Cargar datos del aula y docentes al abrir
  useEffect(() => {
    if (isOpen && aula) {
      setForm({
        seccion: aula.seccion || '',
        cantidadEstudiantes: aula.cantidadEstudiantes || '',
        idTutor: '',
        idGrado: aula.idGrado?.idGrado || aula.idGrado || ''
      });

      // Precargar tutor actual
      const asignacionActiva = aula.asignacionAulas?.find((a) => a.estadoActivo);
      if (asignacionActiva?.idTrabajador) {
        const tutor = asignacionActiva.idTrabajador;
        setForm((prev) => ({ ...prev, idTutor: tutor.idTrabajador }));
        setTutorSeleccionado(tutor);
        setSearchTutor(`${tutor.nombre} ${tutor.apellido}`);
      } else {
        setTutorSeleccionado(null);
        setSearchTutor('');
      }

      // Cargar docentes
      const fetchDocentes = async () => {
        setLoadingDocentes(true);
        try {
          const data = await trabajadorService.getDocentes();
          setDocentes(data);
        } catch (error) {
          console.error('Error al cargar docentes:', error);
        } finally {
          setLoadingDocentes(false);
        }
      };
      fetchDocentes();
    }
  }, [isOpen, aula]);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const docentesFiltrados = docentes.filter((doc) => {
    const nombre = `${doc.nombre || ''} ${doc.apellido || ''}`.toLowerCase();
    return nombre.includes(searchTutor.toLowerCase());
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectTutor = (docente) => {
    setForm((prev) => ({ ...prev, idTutor: docente.idTrabajador }));
    setTutorSeleccionado(docente);
    setSearchTutor(`${docente.nombre} ${docente.apellido}`);
    setShowDropdown(false);
  };

  const handleClearTutor = () => {
    setForm((prev) => ({ ...prev, idTutor: '' }));
    setTutorSeleccionado(null);
    setSearchTutor('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!aula?.idAula) return;

    const payload = {};
    if (form.seccion.trim()) payload.seccion = form.seccion.trim();
    if (form.cantidadEstudiantes !== '') payload.cantidadEstudiantes = Number(form.cantidadEstudiantes);
    if (form.idTutor) payload.idTutor = form.idTutor;
    if (form.idGrado) payload.idGrado = form.idGrado;

    await updateAulaMutation.mutateAsync({ id: aula.idAula, ...payload });
    handleClose();
  };

  const handleClose = () => {
    if (!updateAulaMutation.isPending) {
      setForm({ seccion: '', cantidadEstudiantes: '', idTutor: '', idGrado: '' });
      setSearchTutor('');
      setTutorSeleccionado(null);
      setShowDropdown(false);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Editar Aula
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={updateAulaMutation.isPending}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Grado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grado
                    </label>
                    <select
                      name="idGrado"
                      value={form.idGrado}
                      onChange={handleChange}
                      disabled={updateAulaMutation.isPending || loadingGrados}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                      <option value="">Seleccionar grado...</option>
                      {gradosOptions.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sección y Cantidad */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sección
                      </label>
                      <input
                        type="text"
                        name="seccion"
                        value={form.seccion}
                        onChange={handleChange}
                        placeholder="Ej: A, B, C"
                        disabled={updateAulaMutation.isPending}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad de Estudiantes
                      </label>
                      <input
                        type="number"
                        name="cantidadEstudiantes"
                        value={form.cantidadEstudiantes}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        disabled={updateAulaMutation.isPending}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Tutor con buscador */}
                  <div ref={dropdownRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tutor
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTutor}
                        onChange={(e) => {
                          setSearchTutor(e.target.value);
                          setShowDropdown(true);
                          if (tutorSeleccionado) {
                            handleClearTutor();
                          }
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder={loadingDocentes ? 'Cargando docentes...' : 'Buscar tutor por nombre...'}
                        disabled={updateAulaMutation.isPending || loadingDocentes}
                        className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                      {tutorSeleccionado && (
                        <button
                          type="button"
                          onClick={handleClearTutor}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showDropdown && !tutorSeleccionado && (
                      <div className="mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
                        {docentesFiltrados.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No se encontraron docentes
                          </div>
                        ) : (
                          docentesFiltrados.map((docente) => (
                            <button
                              key={docente.idTrabajador}
                              type="button"
                              onClick={() => handleSelectTutor(docente)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">
                                {docente.nombre} {docente.apellido}
                              </div>
                              {docente.correo && (
                                <div className="text-xs text-gray-500">{docente.correo}</div>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={updateAulaMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updateAulaMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                      {updateAulaMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Guardar Cambios
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

export default ModalEditarAula;
