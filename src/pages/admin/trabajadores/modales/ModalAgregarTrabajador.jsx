import React, { Fragment } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Dialog, Transition } from "@headlessui/react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import trabajadorService from "src/services/trabajadorService";
import { useCursos } from "src/hooks/useCursos";
import { useCreateAsignacionCurso } from "src/hooks/queries/useAsignacionCursosQueries";
import { useRoles } from "src/hooks/useRoles";

const ROLE_WHITELIST = ["ADMINISTRADOR", "SECRETARIA", "DOCENTE", "ESPECIALISTA"];

// Esquema de validación
const validationSchema = yup.object({
  nombre: yup.string().required("El nombre es requerido").trim(),
  apellido: yup.string().required("El apellido es requerido").trim(),
  tipoDocumento: yup.string().required("El tipo de documento es requerido"),
  nroDocumento: yup
    .string()
    .required("El número de documento es requerido")
    .trim(),
  idRol: yup.string().required("El rol es requerido"),
  idCurso: yup.string().nullable(),
  correo: yup.string().email("El correo no es válido").nullable(),
  telefono: yup.string().nullable(),
  direccion: yup.string().nullable(),
});

const ModalAgregarTrabajador = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { data: cursos = [], isLoading: loadingCursos } = useCursos();
  const asignarCursoMutation = useCreateAsignacionCurso();
  const { roles = [], loading: loadingRoles } = useRoles();

  const visibleRoles = roles.filter((rol) =>
    ROLE_WHITELIST.includes(rol.nombre?.toUpperCase())
  );
  const docenteRoleId = roles.find(
    (rol) => rol.nombre?.toLowerCase() === "docente"
  )?.idRol;

  const createMutation = useMutation({
    mutationFn: (data) => trabajadorService.createTrabajadorSimple(data),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      tipoDocumento: "DNI",
      nroDocumento: "",
      correo: "",
      telefono: "",
      direccion: "",
      idRol: "",
      idCurso: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const { idCurso, ...trabajadorData } = data;

      if (docenteRoleId && data.idRol === docenteRoleId && !idCurso) {
        setError("idCurso", {
          type: "manual",
          message: "Seleccione un curso para docentes",
        });
        return;
      }
      trabajadorData.estaActivo = true;
      const response = await createMutation.mutateAsync(trabajadorData);

      const createdId =
        response?.trabajador?.idTrabajador ||
        response?.trabajador?.id ||
        response?.data?.idTrabajador ||
        response?.data?.id ||
        response?.info?.data?.idTrabajador;

      if (docenteRoleId && data.idRol === docenteRoleId && idCurso) {
        if (!createdId) {
          throw new Error("No se pudo obtener el ID del trabajador creado");
        }
        await asignarCursoMutation.mutateAsync({
          idCurso,
          idTrabajador: createdId,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["trabajadores"] });
      toast.success("¡Trabajador creado exitosamente!");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Error al crear trabajador", {
        description: error.message,
      });
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      reset();
      onClose();
    }
  };

  const creating = createMutation.isPending;
  const selectedRol = watch("idRol");

  const inputClass = (fieldError) =>
    `block w-full px-3 py-2 border ${fieldError ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50`;

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
              <Dialog.Panel className="w-full max-w-2xl transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                    Crear Nuevo Trabajador
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    disabled={creating}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        {...register("nombre")}
                        className={inputClass(errors.nombre)}
                        placeholder="Ej: Walter Eduardo"
                        disabled={creating}
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        {...register("apellido")}
                        className={inputClass(errors.apellido)}
                        placeholder="Ej: Martinez Gonzales"
                        disabled={creating}
                      />
                      {errors.apellido && (
                        <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento *
                      </label>
                      <select
                        {...register("tipoDocumento")}
                        className={inputClass(errors.tipoDocumento)}
                        disabled={creating}
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">Carnet de Extranjería</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Documento *
                      </label>
                      <input
                        {...register("nroDocumento")}
                        className={inputClass(errors.nroDocumento)}
                        placeholder="Ej: 24323234"
                        disabled={creating}
                      />
                      {errors.nroDocumento && (
                        <p className="text-red-500 text-sm mt-1">{errors.nroDocumento.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol *
                      </label>
                      <select
                        {...register("idRol")}
                        className={inputClass(errors.idRol)}
                        disabled={creating || loadingRoles}
                      >
                        <option value="">
                          {loadingRoles
                            ? "Cargando roles..."
                            : visibleRoles.length
                              ? "Seleccione un rol"
                              : "No hay roles disponibles"}
                        </option>
                        {visibleRoles.map((rol) => (
                          <option key={rol.idRol || rol.id} value={rol.idRol || rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.idRol && (
                        <p className="text-red-500 text-sm mt-1">{errors.idRol.message}</p>
                      )}
                    </div>

                    {selectedRol === docenteRoleId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Curso *
                        </label>
                        <select
                          {...register("idCurso")}
                          className={inputClass(errors.idCurso)}
                          disabled={creating || loadingCursos}
                        >
                          <option value="">Seleccione un curso</option>
                          {cursos.map((curso) => (
                            <option
                              key={curso.idCurso || curso.id}
                              value={curso.idCurso || curso.id}
                            >
                              {curso.nombreCurso || curso.nombre}
                            </option>
                          ))}
                        </select>
                        {errors.idCurso && (
                          <p className="text-red-500 text-sm mt-1">{errors.idCurso.message}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        {...register("correo")}
                        className={inputClass(errors.correo)}
                        placeholder="Ej: ejemplo@correo.com"
                        disabled={creating}
                      />
                      {errors.correo && (
                        <p className="text-red-500 text-sm mt-1">{errors.correo.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        {...register("telefono")}
                        className={inputClass(errors.telefono)}
                        placeholder="Ej: 925757151"
                        disabled={creating}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        {...register("direccion")}
                        className={inputClass(errors.direccion)}
                        placeholder="Ej: AV. MICHAEL FARADAY NRO. 1060"
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={creating}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Crear Trabajador
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

export default ModalAgregarTrabajador;
