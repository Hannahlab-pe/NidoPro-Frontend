import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import useGradosSimple from '../../../../hooks/useGrados';
import { usePensionesOptions } from '../../../../hooks/usePensiones';

const ModalAgregarGrado = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    grado: '',
    descripcion: '',
    estaActivo: true,
    idPension: ''
  });
  const [loading, setLoading] = useState(false);
  const { crearGrado } = useGradosSimple();
  const { options: pensionesOptions, isLoading: loadingPensiones, hasPensiones } = usePensionesOptions();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!form.grado.trim()) {
      toast.error('El nombre del grado es requerido');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        ...(form.idPension ? { idPension: form.idPension } : {})
      };

      if (!form.idPension) {
        delete payload.idPension;
      }

      await crearGrado(payload);
      toast.success('Grado creado correctamente');
      setForm({ grado: '', descripcion: '', estaActivo: true, idPension: '' });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Error al crear grado');
    } finally {
      setLoading(false);
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
          <div className="fixed inset-0 bg-black/20 bg-opacity-40 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Crear nuevo grado académico
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del grado *</label>
                    <input
                      type="text"
                      name="grado"
                      value={form.grado}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pensión Asociada
                    </label>
                    {loadingPensiones ? (
                      <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-gray-500">Cargando pensiones...</span>
                      </div>
                    ) : !hasPensiones ? (
                      <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700">
                        No hay pensiones disponibles. Cree una pensión primero.
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          name="idPension"
                          value={form.idPension}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                        >
                          <option value="">Seleccione una pensión</option>
                          {pensionesOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                    {form.idPension && (
                      <p className="text-xs text-gray-500 mt-1">
                        Pensión seleccionada: {pensionesOptions.find(p => p.value === form.idPension)?.label}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 mr-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || loadingPensiones}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      <span>Crear</span>
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

export default ModalAgregarGrado;
