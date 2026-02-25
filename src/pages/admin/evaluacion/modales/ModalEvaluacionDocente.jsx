import React, { useState, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Upload,
  FileText,
  User,
  MessageSquare,
  Save,
  Loader,
  AlertCircle,
  CheckCircle,
  File,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import StorageService from "../../../../services/storageService";

const ModalEvaluacionDocente = ({
  isOpen,
  onClose,
  evaluacion,
  trabajadores,
  onGuardar,
  coordinadorId,
}) => {
  const [formData, setFormData] = useState({
    motivo: "",
    descripcion: "",
    archivoUrl: "",
    idTrabajador: "",
    idCoordinador: coordinadorId || "",
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (evaluacion) {
        // Modo edición
        setFormData({
          motivo: evaluacion.motivo || "",
          descripcion: evaluacion.descripcion || "",
          archivoUrl: evaluacion.archivoUrl || "",
          idTrabajador: evaluacion.idTrabajador?.idTrabajador || "",
          idCoordinador:
            evaluacion.idCoordinador?.idCoordinador || coordinadorId || "",
        });
        setSelectedFile(null);
      } else {
        // Modo creación
        setFormData({
          motivo: "",
          descripcion: "",
          archivoUrl: "",
          idTrabajador: "",
          idCoordinador: coordinadorId || "",
        });
        setSelectedFile(null);
        setFilePreview(null);
      }
      setErrors({});
    }
  }, [isOpen, evaluacion, coordinadorId]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.motivo.trim()) {
      newErrors.motivo = "El motivo es obligatorio";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    } else if (formData.descripcion.trim().length < 10) {
      newErrors.descripcion = "La descripción debe tener mínimo 10 caracteres";
    }

    if (!formData.idTrabajador) {
      newErrors.idTrabajador = "Debe seleccionar un trabajador";
    }

    if (!formData.idCoordinador) {
      newErrors.idCoordinador = "No se pudo obtener el ID del coordinador";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio de archivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo usando StorageService
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!StorageService.validateFileType(file, allowedTypes)) {
      toast.error("Solo se permiten archivos PDF e imágenes (JPG, PNG)");
      return;
    }

    // Validar tamaño (máximo 10MB) usando StorageService
    if (!StorageService.validateFileSize(file, 10)) {
      toast.error("El archivo no puede superar los 10MB");
      return;
    }

    setSelectedFile(file);
    setFormData((prev) => ({ ...prev, archivoUrl: "" })); // Limpiar URL anterior

    // Crear preview del archivo
    const fileInfo = StorageService.getFileInfo(file);
    setFilePreview(fileInfo);
  };

  // Remover archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFormData((prev) => ({ ...prev, archivoUrl: "" }));
    // Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Subir archivo a Google Cloud Storage
  const uploadFileToStorage = async (file) => {
    try {
      setUploading(true);
      toast.loading("Subiendo archivo...", { id: "upload-file" });

      // Subir archivo usando StorageService a carpeta 'evaluaciones-docentes'
      const uploadResult = await StorageService.uploadFile(
        file,
        "evaluaciones-docentes",
        coordinadorId,
      );

      toast.dismiss("upload-file");
      toast.success("Archivo subido exitosamente");

      return uploadResult.url;
    } catch (error) {
      console.error("Error al subir archivo:", error);
      toast.dismiss("upload-file");
      toast.error("Error al subir el archivo: " + error.message);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      toast.loading("Guardando evaluación...", { id: "save-evaluation" });

      let archivoUrl = formData.archivoUrl;

      // Si hay un archivo seleccionado, subirlo a Google Cloud Storage
      if (selectedFile) {
        archivoUrl = await uploadFileToStorage(selectedFile);
      }

      // Preparar datos finales - si no hay archivoUrl, mandar null
      const evaluacionData = {
        ...formData,
        archivoUrl: archivoUrl || null, // Si no hay URL, mandar null
      };

      // Llamar a la función de guardar
      await onGuardar(evaluacionData);

      toast.dismiss("save-evaluation");
    } catch (error) {
      console.error("Error al guardar evaluación:", error);
      toast.dismiss("save-evaluation");
      toast.error("Error al guardar la evaluación: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={React.Fragment}
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
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl mx-4 transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-white">
                        {evaluacion
                          ? "Editar Evaluación"
                          : "Nueva Evaluación Docente"}
                      </Dialog.Title>
                      <p className="text-sm text-blue-100">
                        {evaluacion
                          ? "Modificar evaluación existente"
                          : "Crear nueva evaluación docente"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                    disabled={saving}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Trabajador */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Docente a Evaluar *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.idTrabajador}
                        onChange={(e) =>
                          handleChange("idTrabajador", e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                          errors.idTrabajador
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={saving}
                      >
                        <option value="">Seleccionar docente...</option>
                        {trabajadores.map((trabajador) => (
                          <option
                            key={trabajador.idTrabajador}
                            value={trabajador.idTrabajador}
                          >
                            {trabajador.nombre} {trabajador.apellido} -{" "}
                            {trabajador.idRol?.nombre}
                          </option>
                        ))}
                      </select>
                      <User className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    {errors.idTrabajador && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.idTrabajador}
                      </p>
                    )}
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de la Evaluación *
                    </label>
                    <input
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => handleChange("motivo", e.target.value)}
                      placeholder="Ej: Excelente desempeño en clases"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.motivo ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={saving}
                    />
                    {errors.motivo && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.motivo}
                      </p>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción Detallada *
                    </label>
                    <div className="relative">
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) =>
                          handleChange("descripcion", e.target.value)
                        }
                        placeholder="Describa detalladamente la evaluación del docente (mínimo 10 caracteres)..."
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                          errors.descripcion
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        disabled={saving}
                      />
                      <MessageSquare className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Mínimo 10 caracteres
                      </p>
                      <p
                        className={`text-xs ${formData.descripcion.length < 10 ? "text-red-500" : "text-green-500"}`}
                      >
                        {formData.descripcion.length}/10 caracteres
                      </p>
                    </div>
                    {errors.descripcion && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.descripcion}
                      </p>
                    )}
                  </div>

                  {/* Archivo adjunto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo Adjunto (Opcional)
                    </label>
                    <div className="space-y-3">
                      {!selectedFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra un archivo aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            PDF o imágenes JPG, PNG (máx. 10MB)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={saving || uploading}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={saving || uploading}
                          >
                            Seleccionar Archivo
                          </button>
                        </div>
                      ) : (
                        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <File className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {filePreview?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {filePreview?.sizeFormatted}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    URL.createObjectURL(selectedFile),
                                    "_blank",
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Vista previa"
                                disabled={uploading}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Remover archivo"
                                disabled={uploading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Archivo existente (modo edición) */}
                      {evaluacion?.archivoUrl && !selectedFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            Archivo adjunto existente
                          </span>
                          <a
                            href={evaluacion.archivoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline ml-auto"
                          >
                            Ver archivo
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      disabled={saving || uploading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      disabled={saving || uploading}
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {evaluacion ? "Actualizar" : "Guardar"} Evaluación
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

export default ModalEvaluacionDocente;
