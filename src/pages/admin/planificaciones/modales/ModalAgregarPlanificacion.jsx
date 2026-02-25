import { Fragment, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dialog, Transition } from "@headlessui/react";
import {
  FileText,
  Loader2,
  Save,
  X,
  Upload,
  File,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../../../../store";
import { planificacionService } from "../../../../services/planificacionService";
import StorageService from "../../../../services/storageService";

const validationSchema = yup.object({
  tipoPlanificacion: yup
    .string()
    .required("El tipo de planificación es requerido"),
  fechaPlanificacion: yup
    .string()
    .required("La fecha de planificación es requerida"),
  archivo: yup.mixed().required("Debe seleccionar un archivo"),
  observaciones: yup.string().required("Las observaciones son requeridas"),
});

const FormField = ({ label, error, required, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ModalAgregarPlanificacion = ({ open, onClose, onSuccess }) => {
  const { user } = useAuthStore();

  const [aulas, setAulas] = useState([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [selectedAulaId, setSelectedAulaId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      tipoPlanificacion: "",
      fechaPlanificacion: "",
      archivo: null,
      observaciones: "",
    },
  });

  // Registrar el campo archivo manualmente
  useEffect(() => {
    register("archivo");
  }, [register]);

  // Limpiar archivo cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFilePreview(null);
    }
  }, [open]);

  // Obtener aulas del trabajador cuando se abre el modal
  useEffect(() => {
    if (open && user?.entidadId) {
      fetchAulasTrabajador();
    }
  }, [open, user?.entidadId]);

  const fetchAulasTrabajador = async () => {
    try {
      setLoadingAulas(true);
      const response = await planificacionService.getAulasTrabajador(
        user.entidadId,
      );

      if (response.success && response.aulas.length > 0) {
        setAulas(response.aulas);
        // Si solo hay una aula, la seleccionamos automáticamente
        if (response.aulas.length === 1) {
          setSelectedAulaId(response.aulas[0].id_aula);
        }
      } else {
        toast.error("No se encontraron aulas asignadas al trabajador");
      }
    } catch (error) {
      console.error("❌ Error al obtener aulas:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al cargar las aulas asignadas";
      toast.error(errorMessage);
    } finally {
      setLoadingAulas(false);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!StorageService.validateFileType(file, allowedTypes)) {
      toast.error(
        "Tipo de archivo no permitido. Use PDF, Word, Excel o imágenes.",
      );
      return;
    }

    // Validar tamaño (máximo 10MB)
    if (!StorageService.validateFileSize(file, 10)) {
      toast.error("El archivo es demasiado grande. Máximo 10MB.");
      return;
    }

    setSelectedFile(file);
    setValue("archivo", file);

    // Crear preview del archivo
    const fileInfo = StorageService.getFileInfo(file);
    setFilePreview(fileInfo);
  };

  // Remover archivo seleccionado
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setValue("archivo", null);
    // Limpiar el input file
    const fileInput = document.getElementById("archivo-input");
    if (fileInput) fileInput.value = "";
  };

  const onSubmit = async (data) => {
    if (!selectedAulaId) {
      toast.error("Debe seleccionar un aula");
      return;
    }

    if (!selectedFile) {
      toast.error("Debe seleccionar un archivo");
      return;
    }

    if (!user?.entidadId) {
      toast.error("No se pudo obtener la información del usuario");
      return;
    }

    try {
      setUploadingFile(true);
      toast.loading("Subiendo archivo...", { id: "upload" });

      // Subir archivo al storage (mismo endpoint que vouchers de matrícula)
      const uploadResult = await StorageService.uploadFile(
        selectedFile,
        "planificaciones",
      );

      toast.dismiss("upload");
      toast.success("Archivo subido exitosamente");

      const payload = {
        tipoPlanificacion:
          data.tipoPlanificacion === "Anual"
            ? "Planificación Anual"
            : data.tipoPlanificacion === "Mensual"
              ? "Planificación Mensual"
              : data.tipoPlanificacion === "Semanal"
                ? "Planificación Semanal"
                : "Planificación Diaria", // Formato esperado por el backend
        fechaPlanificacion: data.fechaPlanificacion + "T00:00:00.000Z", // Formato ISO completo
        archivoUrl: uploadResult.url,
        observaciones: data.observaciones || "", // Asegurar que no sea null
        idTrabajador: user.entidadId,
        idAula: selectedAulaId,
      };

      // Validar que todos los campos requeridos estén presentes y sean válidos
      if (
        !payload.tipoPlanificacion ||
        typeof payload.tipoPlanificacion !== "string"
      ) {
        throw new Error("Tipo de planificación inválido");
      }
      if (
        !payload.fechaPlanificacion ||
        typeof payload.fechaPlanificacion !== "string"
      ) {
        throw new Error("Fecha de planificación inválida");
      }
      if (!payload.archivoUrl || typeof payload.archivoUrl !== "string") {
        throw new Error("URL del archivo inválida");
      }
      if (!payload.idTrabajador || typeof payload.idTrabajador !== "string") {
        throw new Error("ID del trabajador inválido");
      }
      if (!payload.idAula || typeof payload.idAula !== "string") {
        throw new Error("ID del aula inválido");
      }

      // Enviar datos al API
      await planificacionService.crearPlanificacion(payload);
      toast.success("Planificación registrada correctamente");

      // Llamar a onSuccess si está definido
      if (onSuccess) {
        onSuccess();
      }

      reset();
      setSelectedAulaId("");
      setSelectedFile(null);
      setFilePreview(null);
      onClose();
    } catch (error) {
      console.error("Error al crear planificación:", error);
      toast.dismiss("upload");
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al registrar la planificación";
      toast.error(errorMessage);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedAulaId("");
    setSelectedFile(null);
    setFilePreview(null);
    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
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
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Agregar Planificación
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Complete la información para registrar una planificación
                        docente
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Tipo de Planificación"
                      error={errors.tipoPlanificacion?.message}
                      required
                    >
                      <select
                        {...register("tipoPlanificacion")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="Diaria">Diaria</option>
                        <option value="Semanal">Semanal</option>
                        <option value="Mensual">Mensual</option>
                        <option value="Anual">Anual</option>
                      </select>
                    </FormField>
                    <FormField
                      label="Fecha de Planificación"
                      error={errors.fechaPlanificacion?.message}
                      required
                    >
                      <input
                        {...register("fechaPlanificacion")}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </FormField>
                  </div>
                  <FormField
                    label="Aula"
                    error={
                      !selectedAulaId ? "Debe seleccionar un aula" : undefined
                    }
                    required
                  >
                    <select
                      value={selectedAulaId}
                      onChange={(e) => setSelectedAulaId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingAulas}
                    >
                      <option value="">
                        {loadingAulas
                          ? "Cargando aulas..."
                          : "Seleccionar aula"}
                      </option>
                      {aulas.map((aula) => (
                        <option key={aula.id_aula} value={aula.id_aula}>
                          {aula.nombre} - {aula.seccion} ({aula.grado})
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="Archivo"
                    error={errors.archivo?.message}
                    required
                  >
                    <div className="space-y-3">
                      {!selectedFile ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Arrastra un archivo aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            PDF, Word, Excel, imágenes (máx. 10MB)
                          </p>
                          <input
                            id="archivo-input"
                            type="file"
                            onChange={handleFileSelect}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document.getElementById("archivo-input").click()
                            }
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                title="Remover archivo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </FormField>
                  <FormField
                    label="Observaciones"
                    error={errors.observaciones?.message}
                    required
                  >
                    <textarea
                      {...register("observaciones")}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Observaciones adicionales..."
                    />
                  </FormField>
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !selectedAulaId ||
                        loadingAulas ||
                        uploadingFile ||
                        !selectedFile
                      }
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting || uploadingFile ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {uploadingFile
                            ? "Subiendo archivo..."
                            : "Guardando..."}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Guardar Planificación
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

export default ModalAgregarPlanificacion;
