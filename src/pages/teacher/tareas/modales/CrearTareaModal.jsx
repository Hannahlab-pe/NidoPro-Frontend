import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  X,
  Calendar,
  FileText,
  Users,
  AlertCircle,
  Upload,
  Loader2,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { tareaService } from "../../../../services/tareaService";
import { aulaService } from "../../../../services/aulaService";
import { getIdTrabajadorFromToken } from "../../../../utils/tokenUtils";
import { useAuthStore } from "../../../../store/useAuthStore";
import { StorageService } from "../../../../services/storageService";

const CrearTareaModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    fechaEntrega: "",
    idAula: "",
    archivo: null, // Cambiado de archivos[] a archivo único
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aulas, setAulas] = useState([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false); // Cambiado de uploadingFiles
  const [uploadedFileUrl, setUploadedFileUrl] = useState(""); // Cambiado de uploadedFiles

  // Cargar aulas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      console.log("🎓 [CREAR TAREA] Usuario actual:", {
        rol: user?.role?.nombre || user?.rol,
        entidadId: user?.entidadId,
        fullUserData: user,
      });

      // Función de debug para consola
      window.debugCrearTarea = () => {
        console.log("🔧 DEBUG CREAR TAREA:");
        console.log("- Token:", localStorage.getItem("token"));
        console.log("- User from store:", user);
        console.log(
          "- getIdTrabajadorFromToken():",
          getIdTrabajadorFromToken(),
        );
        console.log("- getEntidadIdFromToken():", getEntidadIdFromToken());
        console.log(
          "- localStorage entidadId:",
          localStorage.getItem("entidadId"),
        );
        return {
          token: localStorage.getItem("token"),
          user,
          idTrabajadorFromToken: getIdTrabajadorFromToken(),
          entidadIdFromToken: getEntidadIdFromToken(),
          entidadIdFromStorage: localStorage.getItem("entidadId"),
        };
      };

      cargarAulas();
    }
  }, [isOpen, user]);

  const cargarAulas = async () => {
    try {
      setLoadingAulas(true);
      console.log("🔍 [CREAR TAREA] Cargando aulas asignadas al trabajador...");

      // Usar la función específica para obtener el ID del trabajador del token
      const trabajadorId = getIdTrabajadorFromToken();
      console.log("👨‍🏫 [CREAR TAREA] ID Trabajador del token:", trabajadorId);

      // Fallback al store si no se encuentra en el token
      const fallbackId = user?.entidadId || localStorage.getItem("entidadId");
      console.log(
        "� [CREAR TAREA] ID Fallback (store/localStorage):",
        fallbackId,
      );

      const finalTrabajadorId = trabajadorId || fallbackId;
      console.log("🎯 [CREAR TAREA] ID final usado:", finalTrabajadorId);

      if (!finalTrabajadorId) {
        console.warn(
          "⚠️ [CREAR TAREA] No se encontró ID del trabajador ni en token ni en store",
        );
        setAulas([]);
        return;
      }

      // Usar el endpoint específico para obtener aulas asignadas al trabajador
      console.log(
        "🌐 [CREAR TAREA] Endpoint que se va a llamar:",
        `/trabajador/aulas/${finalTrabajadorId}`,
      );

      try {
        const response =
          await aulaService.getAulasByTrabajador(finalTrabajadorId);
        console.log(
          "📥 [CREAR TAREA] Respuesta del endpoint trabajador/aulas:",
          response,
        );
        console.log("📥 [CREAR TAREA] Tipo de respuesta:", typeof response);
        console.log(
          "📥 [CREAR TAREA] Estructura de respuesta:",
          Object.keys(response || {}),
        );

        // Extraer el array de aulas de la respuesta
        const aulasData = response?.aulas || response?.data || [];
        console.log("📚 [CREAR TAREA] Aulas asignadas obtenidas:", aulasData);
        console.log("📚 [CREAR TAREA] Estructura primera aula:", aulasData[0]);
        console.log(
          "📚 [CREAR TAREA] Cantidad de aulas asignadas:",
          aulasData?.length,
        );

        setAulas(aulasData);
      } catch (error) {
        console.warn(
          "⚠️ [CREAR TAREA] Error con endpoint específico, intentando con getAllAulas:",
          error,
        );

        // Fallback: usar getAllAulas si el endpoint específico falla
        try {
          const response = await aulaService.getAllAulas();
          const aulasData = response?.info?.data || response?.data || [];
          console.log(
            "📚 [CREAR TAREA] Aulas obtenidas con fallback:",
            aulasData,
          );
          setAulas(aulasData);
        } catch (fallbackError) {
          console.error(
            "❌ [CREAR TAREA] Error también con fallback:",
            fallbackError,
          );
          setAulas([]);
        }
      }
    } catch (error) {
      console.error("❌ [CREAR TAREA] Error al cargar aulas asignadas:", error);
      toast.error("Error al cargar las aulas asignadas");
      setAulas([]);
    } finally {
      setLoadingAulas(false);
    }
  };

  // Debug: mostrar aulas procesadas para el select

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`🔄 [CREAR TAREA] Input change - ${name}:`, value);

    // Debug específico para idAula
    if (name === "idAula") {
      console.log("🏫 [CREAR TAREA] Aula seleccionada ID:", value);
      const aulaSeleccionada = aulas.find(
        (aula) => aula.id_aula === value || aula.idAula === value,
      );
      console.log(
        "🏫 [CREAR TAREA] Aula completa seleccionada:",
        aulaSeleccionada,
      );
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const file = files[0]; // Solo tomar el primer archivo

    // Validar archivo
    const fileInfo = StorageService.getFileInfo(file);

    // Validar tipo de archivo
    if (!StorageService.validateFileType(file)) {
      toast.error("Tipo de archivo no permitido", {
        description:
          "Solo se permiten: PDF, DOC, DOCX, imágenes (JPG, PNG, GIF)",
      });
      e.target.value = "";
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (!StorageService.validateFileSize(file, 10)) {
      toast.error("Archivo demasiado grande", {
        description: "El archivo no puede superar los 10MB",
      });
      e.target.value = "";
      return;
    }

    // Agregar archivo
    setFormData((prev) => ({
      ...prev,
      archivo: {
        file,
        info: fileInfo,
        id: Date.now(),
      },
    }));

    toast.success(`Archivo "${file.name}" agregado correctamente`);

    // Limpiar el input
    e.target.value = "";
  };

  const removeFile = () => {
    // Si el archivo ya fue subido, eliminarlo del storage
    if (uploadedFileUrl) {
      try {
        StorageService.deleteFile(uploadedFileUrl);
        toast.success("Archivo eliminado de la nube");
      } catch (error) {
        console.error("Error al eliminar archivo de storage:", error);
        toast.error("Error al eliminar archivo de la nube");
      }
    }

    setFormData((prev) => ({
      ...prev,
      archivo: null,
    }));
    setUploadedFileUrl("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "El título es obligatorio";
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
    }

    if (!formData.fechaEntrega) {
      newErrors.fechaEntrega = "La fecha de entrega es obligatoria";
    } else {
      const today = new Date();
      const entrega = new Date(formData.fechaEntrega);
      if (entrega <= today) {
        newErrors.fechaEntrega = "La fecha de entrega debe ser futura";
      }
    }

    if (!formData.idAula) {
      newErrors.idAula = "Debe seleccionar un aula";
    } else {
      // Validar que el idAula sea un UUID válido o al menos que exista en las aulas
      const aulaExiste = aulas.find(
        (aula) =>
          aula.id_aula === formData.idAula || aula.idAula === formData.idAula,
      );
      if (!aulaExiste) {
        newErrors.idAula = "El aula seleccionada no es válida";
        console.error(
          "❌ [CREAR TAREA] Aula no encontrada. idAula:",
          formData.idAula,
          "Aulas disponibles:",
          aulas,
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    try {
      setLoading(true);
      console.log("🚀 [CREAR TAREA] Iniciando creación de tarea...");

      // Obtener el ID del trabajador del token
      const idTrabajador = getIdTrabajadorFromToken();
      if (!idTrabajador) {
        throw new Error("No se pudo obtener el ID del trabajador del token");
      }

      console.log("👨‍🏫 [CREAR TAREA] ID Trabajador obtenido:", idTrabajador);

      let archivoUrl = "";

      // Subir archivo al endpoint de storage si hay un archivo
      if (formData.archivo) {
        try {
          setUploadingFile(true);
          toast.info("Subiendo archivo a la nube...");

          const uploadResult = await StorageService.uploadFile(
            formData.archivo.file,
            "tareas",
            idTrabajador,
          );

          archivoUrl = uploadResult.url;
          setUploadedFileUrl(archivoUrl);

          toast.success("Archivo subido exitosamente");

          console.log("📁 [CREAR TAREA] Archivo subido:", uploadResult);
        } catch (error) {
          console.error("❌ [CREAR TAREA] Error al subir archivo:", error);
          toast.error("Error al subir archivo", {
            description: "El archivo no se pudo subir. Inténtalo de nuevo.",
          });
          return;
        } finally {
          setUploadingFile(false);
        }
      }

      // Preparar datos para el backend según el endpoint especificado
      const tareaData = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        fechaEntrega: formData.fechaEntrega,
        estado: "pendiente",
        archivoUrl: archivoUrl || null,
        idAula: formData.idAula,
        idTrabajador: idTrabajador,
      };

      console.log("📝 [CREAR TAREA] Datos a enviar:", tareaData);

      // Enviar al backend usando la función del hook padre
      if (onSave) {
        await onSave(tareaData);
      }

      // Limpiar formulario y cerrar modal
      resetForm();
      toast.success("Tarea creada exitosamente");
    } catch (error) {
      console.error("❌ [CREAR TAREA] Error al crear tarea:", error);

      // Si hay error y se subió un archivo, eliminarlo de storage
      if (uploadedFileUrl) {
        try {
          await StorageService.deleteFile(uploadedFileUrl);
          console.log("🗑️ [CREAR TAREA] Archivo eliminado por error en creación");
        } catch (cleanupError) {
          console.error(
            "❌ [CREAR TAREA] Error al limpiar archivo:",
            cleanupError,
          );
        }
      }

      toast.error("Error al crear la tarea", {
        description: error.message || "Ocurrió un error inesperado",
      });
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };
  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
      fechaEntrega: "",
      idAula: "",
      archivo: null,
    });
    setErrors({});
    setUploadedFileUrl("");
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  // Obtener fecha mínima (mañana)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
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
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Crear Nueva Tarea
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Crea una tarea y asígnala a todos los estudiantes del
                        aula
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={loading || uploadingFile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la Tarea *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Ensayo sobre el calentamiento global"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.titulo ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                    {errors.titulo && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.titulo}
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción *
                    </label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Escribe las instrucciones y detalles de la tarea..."
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.descripcion
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      disabled={loading}
                    />
                    {errors.descripcion && (
                      <div className="mt-1 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.descripcion}
                      </div>
                    )}
                  </div>

                  {/* Aula y Fecha */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Aula */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Aula *
                      </label>
                      <select
                        name="idAula"
                        value={formData.idAula}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.idAula ? "border-red-300" : "border-gray-300"
                        }`}
                        disabled={loading || loadingAulas}
                      >
                        <option value="">
                          {loadingAulas
                            ? "Cargando aulas asignadas..."
                            : "Seleccionar aula asignada"}
                        </option>
                        {aulas.map((aula) => (
                          <option
                            key={aula.id_aula || aula.idAula || aula.id}
                            value={aula.id_aula || aula.idAula || aula.id}
                          >
                            {aula.grado && aula.seccion
                              ? `${aula.grado} - ${aula.seccion}`
                              : aula.nombre ||
                                `Aula ${aula.seccion || aula.numero || aula.id}`}
                            {aula.cantidadEstudiantes &&
                              ` (${aula.cantidadEstudiantes} estudiantes)`}
                          </option>
                        ))}
                      </select>
                      {errors.idAula && (
                        <div className="mt-1 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.idAula}
                        </div>
                      )}
                    </div>

                    {/* Fecha de Entrega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Fecha de Entrega *
                      </label>
                      <input
                        type="date"
                        name="fechaEntrega"
                        value={formData.fechaEntrega}
                        onChange={handleInputChange}
                        min={getMinDate()}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.fechaEntrega
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={loading}
                      />
                      {errors.fechaEntrega && (
                        <div className="mt-1 flex items-center text-sm text-red-600">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.fechaEntrega}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Archivos Adjuntos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="w-4 h-4 inline mr-1" />
                      Archivos Adjuntos (Opcional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="archivo"
                        disabled={loading || uploadingFile}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                      <label htmlFor="archivo" className="cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Haz clic para subir un archivo
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX, IMG (máx. 10MB)
                        </p>
                      </label>
                    </div>

                    {/* Archivo seleccionado */}
                    {formData.archivo && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            {formData.archivo.info.isImage ? (
                              <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                {formData.archivo.info.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formData.archivo.info.sizeFormatted} •{" "}
                                {(formData.archivo.info.extension || 'archivo').toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                            disabled={loading || uploadingFile}
                            title="Eliminar archivo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Indicador de subida */}
                    {uploadingFile && (
                      <div className="mt-3 flex items-center justify-center space-x-2 text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          Subiendo archivo a la nube...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading || uploadingFile}
                      className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploadingFile}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {uploadingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Subiendo archivo...
                        </>
                      ) : loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando tarea...
                        </>
                      ) : (
                        "Crear Tarea"
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

export default CrearTareaModal;
