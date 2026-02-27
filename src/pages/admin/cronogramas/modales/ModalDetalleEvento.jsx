import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  X,
  Calendar,
  Clock,
  FileText,
  User,
  MapPin,
  School
} from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const ModalDetalleEvento = ({ isOpen, onClose, evento }) => {
  if (!evento) return null;

  // Estilo estandarizado de modal admin
  const actionButtonClass = 'bg-blue-600 hover:bg-blue-700';

  const formatearFecha = (fecha) => {
    return moment(fecha).format('dddd, DD [de] MMMM [de] YYYY');
  };

  const formatearHora = (fecha) => {
    return moment(fecha).format('HH:mm');
  };

  const esMismoDia = moment(evento.start).isSame(moment(evento.end), 'day');

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
              <Dialog.Panel className="w-full max-w-md sm:max-w-sm md:max-w-md mx-4 sm:mx-auto transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-base sm:text-lg font-semibold text-gray-900">
                        Detalles del Evento
                      </Dialog.Title>
                      <p className="text-xs sm:text-sm text-gray-500">Vista de Administrador</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Título de la Actividad */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Actividad</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {evento.title}
                    </h3>
                  </div>

                  {/* Información del Aula */}
                  {evento.resource?.aula && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <School className="w-4 h-4" />
                        <span className="text-sm font-medium">Aula</span>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            {evento.resource.aula.seccion}
                          </span>
                          <span className="text-sm text-blue-700">
                            ({evento.resource.aula.cantidadEstudiantes} estudiantes)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  {evento.resource?.descripcion && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Descripción</span>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {evento.resource.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Información del Docente */}
                  {(evento.resource?.nombreTrabajador || evento.resource?.apellidoTrabajador) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Docente</span>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900">
                            {evento.resource.nombreTrabajador} {evento.resource.apellidoTrabajador}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fechas y Horarios */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Programación</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {/* Fecha de Inicio */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha de inicio:</span>
                        <span className="font-medium text-gray-900">
                          {formatearFecha(evento.start)}
                        </span>
                      </div>

                      {/* Fecha de Fin (solo si es diferente) */}
                      {!esMismoDia && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Fecha de fin:</span>
                          <span className="font-medium text-gray-900">
                            {formatearFecha(evento.end)}
                          </span>
                        </div>
                      )}

                      {/* Horarios */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Horario:</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {formatearHora(evento.start)} - {formatearHora(evento.end)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información Adicional */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Detalles</span>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          evento.resource?.estado === 'activo' ? 'bg-green-500' :
                          evento.resource?.estado === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">
                          Estado: {evento.resource?.estado || 'Programado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">
                          Tipo: {evento.resource?.tipo || 'Actividad'}
                        </span>
                      </div>

                      {evento.resource?.seccion && (
                        <div className="flex items-center gap-2">
                          <School className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">
                            Sección: {evento.resource.seccion}
                          </span>
                        </div>
                      )}

                      {evento.id && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">ID: {evento.id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={onClose}
                    className={`w-full sm:w-auto px-4 py-2 ${actionButtonClass} text-white rounded-md transition-colors`}
                  >
                    Entendido
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

export default ModalDetalleEvento;