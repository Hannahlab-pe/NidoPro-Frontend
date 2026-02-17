import React, { useState } from 'react';
import { X, Shield, Save, Loader2 } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'sonner';

const CrearTipoSeguroModal = ({ isOpen, onClose, onTipoSeguroCreado }) => {
  const [formData, setFormData] = useState({
    nombreSeguro: '',
    descripcion: '',
    porcentajeDescuento: '',
    montoFijo: '',
    esObligatorio: false,
    estaActivo: true,
    tipoCalculo: 'PORCENTAJE'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTipoCalculoChange = (tipoCalculo) => {
    setFormData(prev => ({
      ...prev,
      tipoCalculo,
      // Limpiar los campos opuestos cuando se cambia el tipo
      porcentajeDescuento: tipoCalculo === 'PORCENTAJE' ? prev.porcentajeDescuento : '',
      montoFijo: tipoCalculo === 'MONTO_FIJO' ? prev.montoFijo : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombreSeguro.trim()) {
      toast.error('El nombre del seguro es obligatorio');
      return;
    }

    if (!formData.descripcion.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    if (formData.tipoCalculo === 'PORCENTAJE' && !formData.porcentajeDescuento) {
      toast.error('El porcentaje de descuento es obligatorio para este tipo de cálculo');
      return;
    }

    if (formData.tipoCalculo === 'MONTO_FIJO' && !formData.montoFijo) {
      toast.error('El monto fijo es obligatorio para este tipo de cálculo');
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

      // Preparar los datos para enviar
      const dataToSend = {
        nombreSeguro: formData.nombreSeguro.trim(),
        descripcion: formData.descripcion.trim(),
        porcentajeDescuento: formData.tipoCalculo === 'PORCENTAJE' ? parseFloat(formData.porcentajeDescuento).toFixed(2) : null,
        montoFijo: formData.tipoCalculo === 'MONTO_FIJO' ? parseFloat(formData.montoFijo).toFixed(2) : null,
        esObligatorio: formData.esObligatorio,
        estaActivo: formData.estaActivo,
        tipoCalculo: formData.tipoCalculo
      };

      const response = await fetch(`${API_BASE_URL}/tipo-seguro`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        throw new Error('Error al crear el tipo de seguro');
      }

      const result = await response.json();

      toast.success('Tipo de seguro creado exitosamente');
      onTipoSeguroCreado();
      onClose();

      // Reset form
      setFormData({
        nombreSeguro: '',
        descripcion: '',
        porcentajeDescuento: '',
        montoFijo: '',
        esObligatorio: false,
        estaActivo: true,
        tipoCalculo: 'PORCENTAJE'
      });

    } catch (error) {
      console.error('Error creating tipo seguro:', error);
      toast.error(error.message || 'Error al crear el tipo de seguro');
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
          <div className="fixed inset-0 bg-black/20 bg-opacity-25" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Crear Tipo de Seguro
                      </h3>
                      <p className="text-sm text-gray-600">
                        Configura un nuevo tipo de seguro para el sistema
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={onClose}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre del Seguro */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Seguro *
                      </label>
                      <input
                        type="text"
                        name="nombreSeguro"
                        value={formData.nombreSeguro}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Ej: ESSALUD, EPS, etc."
                        required
                      />
                    </div>

                    {/* Descripción */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Describe el tipo de seguro"
                        required
                      />
                    </div>

                    {/* Tipo de Cálculo */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Cálculo *
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tipoCalculo"
                            value="PORCENTAJE"
                            checked={formData.tipoCalculo === 'PORCENTAJE'}
                            onChange={() => handleTipoCalculoChange('PORCENTAJE')}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Porcentaje</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="tipoCalculo"
                            value="MONTO_FIJO"
                            checked={formData.tipoCalculo === 'MONTO_FIJO'}
                            onChange={() => handleTipoCalculoChange('MONTO_FIJO')}
                            className="mr-2 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Monto Fijo</span>
                        </label>
                      </div>
                    </div>

                    {/* Porcentaje de Descuento */}
                    {formData.tipoCalculo === 'PORCENTAJE' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Porcentaje de Descuento *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            name="porcentajeDescuento"
                            value={formData.porcentajeDescuento}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            max="100"
                            className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="9.00"
                            required
                          />
                          <span className="absolute right-3 top-2 text-gray-500">%</span>
                        </div>
                      </div>
                    )}

                    {/* Monto Fijo */}
                    {formData.tipoCalculo === 'MONTO_FIJO' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monto Fijo *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">S/</span>
                          <input
                            type="number"
                            name="montoFijo"
                            value={formData.montoFijo}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full pl-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="50.00"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Es Obligatorio */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="esObligatorio"
                          checked={formData.esObligatorio}
                          onChange={handleInputChange}
                          className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">Es obligatorio</span>
                      </label>
                    </div>

                    {/* Está Activo */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="estaActivo"
                          checked={formData.estaActivo}
                          onChange={handleInputChange}
                          className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">Está activo</span>
                      </label>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-2"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{loading ? 'Creando...' : 'Crear Tipo de Seguro'}</span>
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

export default CrearTipoSeguroModal;