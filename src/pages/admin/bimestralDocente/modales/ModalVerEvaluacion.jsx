import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Award, Calendar, User, FileText } from 'lucide-react';

const ModalVerEvaluacion = ({ isOpen, onClose, evaluacion }) => {
  if (!evaluacion) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Detalles de Evaluación
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">Evaluación bimestral docente</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Información básica */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Docente</span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {evaluacion.idTrabajador2?.nombre} {evaluacion.idTrabajador2?.apellido}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {evaluacion.idTrabajador2?.correo}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Bimestre</span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {evaluacion.idBimestre2?.nombreBimestre}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Bimestre {evaluacion.idBimestre2?.numeroBimestre}
                      </p>
                    </div>
                  </div>

                  {/* Puntajes */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Award className="w-4 h-4 mr-2" />
                      Puntajes Individuales
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evaluacion.puntajePlanificacion}</div>
                        <div className="text-xs text-gray-600">Planificación</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evaluacion.puntajeMetodologia}</div>
                        <div className="text-xs text-gray-600">Metodología</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evaluacion.puntajePuntualidad}</div>
                        <div className="text-xs text-gray-600">Puntualidad</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evaluacion.puntajeCreatividad}</div>
                        <div className="text-xs text-gray-600">Creatividad</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{evaluacion.puntajeComunicacion}</div>
                        <div className="text-xs text-gray-600">Comunicación</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{evaluacion.puntajeTotal}</div>
                        <div className="text-xs text-gray-600">Total</div>
                      </div>
                    </div>
                  </div>

                  {/* Calificación final */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Calificación Final</h4>
                    <div className="flex items-center">
                      <span className={`inline-flex px-3 py-1 text-lg font-bold rounded-full ${
                        evaluacion.calificacionFinal === 'A' ? 'bg-green-100 text-green-800' :
                        evaluacion.calificacionFinal === 'B' ? 'bg-blue-100 text-blue-800' :
                        evaluacion.calificacionFinal === 'C' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluacion.calificacionFinal}
                      </span>
                      <span className="ml-3 text-sm text-gray-600">
                        Puntaje total: {evaluacion.puntajeTotal}
                      </span>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <FileText className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Observaciones</span>
                    </div>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {evaluacion.observaciones}
                    </p>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Fecha de evaluación:</span>
                      <span className="ml-2 text-gray-900">{formatDate(evaluacion.fechaEvaluacion)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Coordinador:</span>
                      <span className="ml-2 text-gray-900">
                        {evaluacion.idCoordinador?.nombre} {evaluacion.idCoordinador?.apellido}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalVerEvaluacion;