import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Upload, FileText, Camera, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import tareaService from '../../services/tareaService';
import { StorageService } from '../../services/storageService';

const SubirTareaModal = ({ isOpen, onClose, tarea, onSuccess }) => {
  const [formData, setFormData] = useState({
    observaciones: '',
    archivoUrl: '',
    realizoTarea: true
  });
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleClose = () => {
    setFormData({
      observaciones: '',
      archivoUrl: '',
      realizoTarea: true
    });
    setArchivo(null);
    setUploadingFile(false);
    onClose();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no permitido. Solo se permiten imágenes, PDF y documentos de Word.');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 5MB permitido.');
        return;
      }

      setArchivo(file);
      setUploadingFile(true);

      try {
        // Subir archivo a Firebase Storage
        const uploadResult = await StorageService.uploadFile(file, 'tareas');
        
        console.log('✅ Archivo subido exitosamente a Firebase:', uploadResult);
        
        setFormData(prev => ({
          ...prev,
          archivoUrl: uploadResult.url
        }));
        
        toast.success('Archivo subido exitosamente');
      } catch (error) {
        console.error('❌ Error al subir archivo a Firebase:', error);
        toast.error('Error al subir el archivo. Inténtalo de nuevo.');
        setArchivo(null);
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.observaciones.trim()) {
      toast.error('Por favor, agrega observaciones sobre la tarea realizada.');
      return;
    }

    setLoading(true);

    try {
      // Obtener idEstudiante del localStorage
      const authStorage = localStorage.getItem('auth-storage');
      const authData = JSON.parse(authStorage);
      const idEstudiante = authData?.state?.user?.entidadId;

      if (!idEstudiante) {
        throw new Error('No se pudo obtener el ID del estudiante');
      }

      const payload = {
        idTarea: tarea.idTarea,
        idEstudiante: idEstudiante,
        realizoTarea: formData.realizoTarea,
        observaciones: formData.observaciones.trim(),
        archivoUrl: formData.archivoUrl || null
      };

      console.log('📤 Enviando entrega de tarea:', payload);

      // Usar el servicio de tareas
      await tareaService.entregarTarea(payload);
      
      toast.success('¡Tarea entregada exitosamente!');
      
      // Llamar callback de éxito para refrescar la lista
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();

    } catch (error) {
      console.error('❌ Error al enviar tarea:', error);
      toast.error(error.message || 'Error al enviar la tarea');
    } finally {
      setLoading(false);
    }
  };

  if (!tarea) return null;

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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                        Entregar Tarea
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        {tarea.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Información de la tarea */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{tarea.emoji}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">{tarea.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{tarea.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>📚 {tarea.subject}</span>
                        <span>👨‍🏫 Prof. {tarea.profesor}</span>
                        <span>📅 Vence: {new Date(tarea.dueDate).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Observaciones */}
                  <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-2">
                      Observaciones sobre la tarea realizada *
                    </label>
                    <textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                      placeholder="Describe cómo se realizó la tarea, si hubo dificultades, si necesitó ayuda, etc."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cuéntanos cómo fue el proceso de realización de la tarea
                    </p>
                  </div>

                  {/* Subir archivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adjuntar archivo (opcional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {uploadingFile ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Subiendo archivo...</p>
                            <p className="text-xs text-gray-500">Por favor espera</p>
                          </div>
                        </div>
                      ) : archivo ? (
                        <div className="flex items-center justify-center space-x-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{archivo.name}</p>
                            <p className="text-xs text-gray-500">
                              {(archivo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setArchivo(null);
                              setFormData(prev => ({ ...prev, archivoUrl: '' }));
                              setUploadingFile(false);
                            }}
                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">
                            Sube una foto o documento de la tarea realizada
                          </p>
                          <input
                            type="file"
                            id="archivo"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            disabled={uploadingFile}
                            className="hidden"
                          />
                          <label
                            htmlFor="archivo"
                            className={`inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Seleccionar archivo
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            Formatos permitidos: JPG, PNG, PDF, DOC (máx. 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado de realización */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Marcando tarea como completada
                        </p>
                        <p className="text-xs text-green-600">
                          Al enviar esta entrega, la tarea se marcará como realizada
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      disabled={loading || uploadingFile}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingFile || !formData.observaciones.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Entregar Tarea</span>
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

export default SubirTareaModal;
