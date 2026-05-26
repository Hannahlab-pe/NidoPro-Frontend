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
              <Dialog.Panel className="w-full max-w-2xl mx-4 sm:mx-auto transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Detalles del Evento
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">Vista de Administrador</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                  {/* Título de la Actividad */}
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <FileText className="w-4 h-4" />
                      <span className="text-xs font-medium uppercase tracking-wide">Actividad</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{evento.title}</h3>
                  </div>

                  {/* Grid 2 columnas principal */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Columna izquierda */}
                    <div className="space-y-4">
                      {/* Aula */}
                      {evento.resource?.aula && (
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                            <School className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Aula</span>
                          </div>
                          <div className="bg-blue-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                            <School className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="font-semibold text-blue-900">{evento.resource.aula.seccion}</span>
                            <span className="text-sm text-blue-600">({evento.resource.aula.cantidadEstudiantes} estudiantes)</span>
                          </div>
                        </div>
                      )}

                      {/* Docente */}
                      {(evento.resource?.nombreTrabajador || evento.resource?.apellidoTrabajador) && (
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Docente</span>
                          </div>
                          <div className="bg-green-50 rounded-lg px-3 py-2.5 flex items-center gap-2">
                            <User className="w-4 h-4 text-green-600 shrink-0" />
                            <span className="font-semibold text-green-900">
                              {evento.resource.nombreTrabajador} {evento.resource.apellidoTrabajador}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Descripción */}
                      {evento.resource?.descripcion && (
                        <div>
                          <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">Descripción</span>
                          </div>
                          <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg leading-relaxed">
                            {evento.resource.descripcion}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha */}
                    <div className="space-y-4">
                      {/* Programación */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Programación</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-4 py-3 space-y-2.5">
                          <div>
                            <span className="text-xs text-gray-500 block mb-0.5">Fecha de inicio</span>
                            <span className="text-sm font-semibold text-gray-900">{formatearFecha(evento.start)}</span>
                          </div>
                          {!esMismoDia && (
                            <div>
                              <span className="text-xs text-gray-500 block mb-0.5">Fecha de fin</span>
                              <span className="text-sm font-semibold text-gray-900">{formatearFecha(evento.end)}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-xs text-gray-500 block mb-0.5">Horario</span>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-gray-500 shrink-0" />
                              <span className="text-sm font-semibold text-gray-900">
                                {formatearHora(evento.start)} - {formatearHora(evento.end)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div>
                        <div className="flex items-center gap-2 text-gray-500 mb-1.5">
                          <FileText className="w-4 h-4" />
                          <span className="text-xs font-medium uppercase tracking-wide">Detalles</span>
                        </div>
                        <div className="bg-blue-50 rounded-lg px-4 py-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              evento.resource?.estado === 'activo' ? 'bg-green-500' :
                              evento.resource?.estado === 'cancelado' ? 'bg-red-500' : 'bg-yellow-500'
                            }`} />
                            <span className="text-sm text-gray-700 capitalize">
                              Estado: <span className="font-medium">{evento.resource?.estado || 'Programado'}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                            <span className="text-sm text-gray-700 capitalize">
                              Tipo: <span className="font-medium">{evento.resource?.tipo || 'Actividad'}</span>
                            </span>
                          </div>
                          {evento.resource?.seccion && (
                            <div className="flex items-center gap-2">
                              <School className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-sm text-gray-700">
                                Sección: <span className="font-medium">{evento.resource.seccion}</span>
                              </span>
                            </div>
                          )}
                          {evento.id && (
                            <p className="text-xs text-gray-400 pt-1 border-t border-blue-100">ID: {evento.id}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={onClose}
                    className={`px-4 py-2 ${actionButtonClass} text-white rounded-lg transition-colors text-sm`}
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