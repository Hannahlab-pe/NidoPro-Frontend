import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Save,
  Loader2,
  DollarSign,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import secretariaPagosService from "../../../../services/secretariaPagosService";
import cajaService from "../../../../services/cajaService";

const METODOS_PAGO = [
  "Efectivo",
  "Yape",
  "Plin",
  "Transferencia",
  "Depósito",
  "Tarjeta",
];

const ModalAgregarPension = ({ isOpen, onClose, aulas = [], onSuccess }) => {
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [estudiantes, setEstudiantes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [tipoOperacion, setTipoOperacion] = useState("cuotaMensual"); // 'pagoInicial' | 'cuotaMensual'
  const [registroEstudiante, setRegistroEstudiante] = useState(null);
  const [loadingRegistro, setLoadingRegistro] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      idAula: "",
      idEstudiante: "",
      horario: "",
      pagoInicialMonto: "",
      pagoInicialFecha: "",
      pagoInicialMetodo: "Efectivo",
    },
  });

  const selectedAula = watch("idAula");
  const selectedEstudiante = watch("idEstudiante");

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Cargar registro del estudiante al seleccionarlo
  useEffect(() => {
    const fetchRegistroEstudiante = async () => {
      if (!selectedEstudiante) {
        setRegistroEstudiante(null);
        setValue("pagoInicialMonto", "");
        return;
      }

      try {
        setLoadingRegistro(true);
        const response =
          await secretariaPagosService.getEstudianteDetalle(selectedEstudiante);
        const data = response?.info?.data || response?.data || response;
        setRegistroEstudiante(data);

        // Si hay pago inicial existente y estamos en modo pago inicial, mostrarlo
        if (data?.pagoInicialMonto && tipoOperacion === "pagoInicial") {
          setValue("pagoInicialMonto", data.pagoInicialMonto);
          setValue(
            "pagoInicialFecha",
            data.pagoInicialFecha?.split("T")[0] || "",
          );
          setValue("pagoInicialMetodo", data.pagoInicialMetodo || "Efectivo");
        }
      } catch (error) {
        console.error("Error al cargar registro del estudiante:", error);
        setRegistroEstudiante(null);
      } finally {
        setLoadingRegistro(false);
      }
    };

    fetchRegistroEstudiante();
  }, [selectedEstudiante, tipoOperacion, setValue]);

  const updateHorario = (days) => {
    const horarioText = days.join(" - ");
    setValue("horario", horarioText);
    if (days.length === 0) {
      setError("horario", {
        type: "manual",
        message: "Seleccione al menos un día",
      });
    } else {
      clearErrors("horario");
    }
  };

  useEffect(() => {
    const fetchEstudiantes = async () => {
      if (!selectedAula) {
        setEstudiantes([]);
        setValue("idEstudiante", "");
        return;
      }
      try {
        setLoadingEstudiantes(true);
        const response =
          await secretariaPagosService.getEstudiantesByAula(selectedAula);
        const rawData =
          response?.info?.data ||
          response?.data ||
          response?.estudiantes ||
          response ||
          [];
        const normalized = Array.isArray(rawData)
          ? rawData
              .map((item) => {
                if (item?.matricula?.idEstudiante) {
                  return {
                    ...item.matricula.idEstudiante,
                    idEstudiante: item.matricula.idEstudiante.idEstudiante,
                  };
                }
                return item;
              })
              .filter(Boolean)
          : [];
        setEstudiantes(normalized);
        setValue("idEstudiante", "");
      } catch (error) {
        toast.error("Error al cargar estudiantes del aula");
        setEstudiantes([]);
      } finally {
        setLoadingEstudiantes(false);
      }
    };

    fetchEstudiantes();
  }, [selectedAula, setValue]);

  const handleClose = () => {
    if (!submitting) {
      reset();
      setSelectedDays([]);
      setEstudiantes([]);
      setRegistroEstudiante(null);
      setTipoOperacion("cuotaMensual");
      onClose();
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const registradoPor = (() => {
        try {
          const authData = localStorage.getItem("auth-storage");
          if (authData) {
            const parsedAuth = JSON.parse(authData);
            return (
              parsedAuth.state?.user?.entidadId ||
              parsedAuth.state?.user?.idTrabajador ||
              parsedAuth.state?.user?.id
            );
          }
          return null;
        } catch (error) {
          return null;
        }
      })();

      if (!registradoPor) {
        toast.error("No se pudo identificar al usuario actual");
        setSubmitting(false);
        return;
      }

      // Lógica para PAGO INICIAL
      if (tipoOperacion === "pagoInicial") {
        const nuevoMonto = data.pagoInicialMonto
          ? Number(data.pagoInicialMonto)
          : 0;
        const montoAnterior = registroEstudiante?.pagoInicialMonto || 0;
        const diferencia = nuevoMonto - montoAnterior;

        if (!data.pagoInicialFecha) {
          toast.error("Debe ingresar la fecha del pago inicial");
          setSubmitting(false);
          return;
        }

        // Actualizar o crear pago inicial
        const payloadPagoInicial = {
          idEstudiante: data.idEstudiante,
          idAula: data.idAula,
          horario: data.horario || registroEstudiante?.horario || "",
          pagoInicialMonto: nuevoMonto,
          pagoInicialFecha: data.pagoInicialFecha,
          pagoInicialMetodo: data.pagoInicialMetodo || "Efectivo",
          registradoPor,
        };

        await secretariaPagosService.registrarHorarioPagoInicial(
          payloadPagoInicial,
        );

        // Si hay diferencia, registrar en caja
        if (diferencia !== 0) {
          const estudianteData = estudiantes.find(
            (e) => e.idEstudiante === data.idEstudiante,
          );
          const estudianteNombre = estudianteData
            ? `${estudianteData.nombre} ${estudianteData.apellido}`
            : "Estudiante";

          const movimientoCaja = {
            tipo: diferencia > 0 ? "INGRESO" : "EGRESO",
            concepto:
              diferencia > 0
                ? `Aumento de pago inicial - ${estudianteNombre}`
                : `Ajuste de pago inicial - ${estudianteNombre}`,
            descripcion:
              diferencia > 0
                ? `Incremento de pago inicial de S/.${montoAnterior.toFixed(2)} a S/.${nuevoMonto.toFixed(2)}`
                : `Reducción de pago inicial de S/.${montoAnterior.toFixed(2)} a S/.${nuevoMonto.toFixed(2)}`,
            monto: Math.abs(diferencia),
            categoria:
              diferencia > 0 ? "PENSION_MENSUAL" : "GASTOS_ADMINISTRATIVOS",
            metodoPago: data.pagoInicialMetodo || "Efectivo",
            registradoPor,
          };

          await cajaService.crearMovimiento(movimientoCaja);

          toast.success(
            montoAnterior > 0
              ? `Pago inicial actualizado. ${diferencia > 0 ? "Aumento" : "Reducción"} de S/.${Math.abs(diferencia).toFixed(2)} registrado en caja`
              : "Pago inicial registrado correctamente",
          );
        } else {
          toast.success("Pago inicial registrado correctamente");
        }
      }
      // Lógica para CUOTA MENSUAL (original)
      else {
        if (selectedDays.length === 0) {
          setError("horario", {
            type: "manual",
            message: "Seleccione al menos un día",
          });
          setSubmitting(false);
          return;
        }

        const payloadRegistro = {
          idEstudiante: data.idEstudiante,
          idAula: data.idAula,
          horario: data.horario,
          pagoInicialMonto: data.pagoInicialMonto
            ? Number(data.pagoInicialMonto)
            : undefined,
          pagoInicialFecha: data.pagoInicialFecha || undefined,
          pagoInicialMetodo: data.pagoInicialMetodo || undefined,
          registradoPor,
        };

        await secretariaPagosService.registrarHorarioPagoInicial(
          payloadRegistro,
        );
        toast.success("Registro creado correctamente");
      }

      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || "Error al registrar pago");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldError) =>
    `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      fieldError ? "border-red-500" : "border-gray-300"
    }`;

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
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Registrar Pensión
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    disabled={submitting}
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Botones para seleccionar tipo de operación */}
                <div className="mb-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoOperacion("pagoInicial")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      tipoOperacion === "pagoInicial"
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={submitting}
                  >
                    <DollarSign className="w-5 h-5" />
                    Pago Inicial
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoOperacion("cuotaMensual")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                      tipoOperacion === "cuotaMensual"
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    disabled={submitting}
                  >
                    <CalendarIcon className="w-5 h-5" />
                    Cuota Mensual
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aula
                      </label>
                      <select
                        {...register("idAula", {
                          required: "Seleccione un aula",
                        })}
                        className={inputClass(errors.idAula)}
                        disabled={submitting}
                      >
                        <option value="">Seleccione un aula</option>
                        {aulas.map((aula) => (
                          <option
                            key={aula.idAula || aula.id}
                            value={aula.idAula || aula.id}
                          >
                            {aula.seccion} -{" "}
                            {aula.idGrado?.grado || aula.grado || ""}
                          </option>
                        ))}
                      </select>
                      {errors.idAula && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.idAula.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estudiante
                      </label>
                      <select
                        {...register("idEstudiante", {
                          required: "Seleccione un estudiante",
                        })}
                        className={inputClass(errors.idEstudiante)}
                        disabled={
                          !selectedAula || loadingEstudiantes || submitting
                        }
                      >
                        <option value="">
                          {loadingEstudiantes
                            ? "Cargando estudiantes..."
                            : "Seleccione un estudiante"}
                        </option>
                        {estudiantes.map((est) => (
                          <option
                            key={est.idEstudiante || est.id}
                            value={est.idEstudiante || est.id}
                          >
                            {est.nombre} {est.apellido}
                          </option>
                        ))}
                      </select>
                      {errors.idEstudiante && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.idEstudiante.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Información del pago inicial existente */}
                  {tipoOperacion === "pagoInicial" &&
                    registroEstudiante?.pagoInicialMonto && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            Pago inicial actual: S/.
                            {registroEstudiante.pagoInicialMonto.toFixed(2)}
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Fecha:{" "}
                            {registroEstudiante.pagoInicialFecha
                              ? new Date(
                                  registroEstudiante.pagoInicialFecha,
                                ).toLocaleDateString("es-PE")
                              : "No registrada"}
                            {" | "}
                            Método:{" "}
                            {registroEstudiante.pagoInicialMetodo ||
                              "No especificado"}
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            💡 Al cambiar el monto, la diferencia se registrará
                            en caja automáticamente
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Campos para PAGO INICIAL */}
                  {tipoOperacion === "pagoInicial" && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                      <p className="text-base font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Pago Inicial
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            {...register("pagoInicialMonto", {
                              required:
                                tipoOperacion === "pagoInicial"
                                  ? "El monto es requerido"
                                  : false,
                            })}
                            className={inputClass(errors.pagoInicialMonto)}
                            placeholder="0.00"
                            disabled={submitting || loadingRegistro}
                          />
                          {errors.pagoInicialMonto && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.pagoInicialMonto.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha *
                          </label>
                          <input
                            type="date"
                            {...register("pagoInicialFecha", {
                              required:
                                tipoOperacion === "pagoInicial"
                                  ? "La fecha es requerida"
                                  : false,
                            })}
                            className={inputClass(errors.pagoInicialFecha)}
                            disabled={submitting}
                          />
                          {errors.pagoInicialFecha && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.pagoInicialFecha.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Método
                          </label>
                          <select
                            {...register("pagoInicialMetodo")}
                            className={inputClass(errors.pagoInicialMetodo)}
                            disabled={submitting}
                          >
                            {METODOS_PAGO.map((metodo) => (
                              <option key={metodo} value={metodo}>
                                {metodo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campos para CUOTA MENSUAL */}
                  {tipoOperacion === "cuotaMensual" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de asistencia
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {diasSemana.map((dia) => {
                            const isSelected = selectedDays.includes(dia);
                            return (
                              <button
                                key={dia}
                                type="button"
                                onClick={() => {
                                  const next = isSelected
                                    ? selectedDays.filter((d) => d !== dia)
                                    : [...selectedDays, dia];
                                  setSelectedDays(next);
                                  updateHorario(next);
                                }}
                                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                  isSelected
                                    ? "bg-green-600 text-white border-green-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
                                }`}
                                disabled={submitting}
                              >
                                {dia}
                              </button>
                            );
                          })}
                        </div>
                        <input type="hidden" {...register("horario")} />
                        {errors.horario && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.horario.message}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3">
                          Pago inicial (opcional)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monto
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register("pagoInicialMonto")}
                              className={inputClass(errors.pagoInicialMonto)}
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha
                            </label>
                            <input
                              type="date"
                              {...register("pagoInicialFecha")}
                              className={inputClass(errors.pagoInicialFecha)}
                              disabled={submitting}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Método
                            </label>
                            <select
                              {...register("pagoInicialMetodo")}
                              className={inputClass(errors.pagoInicialMetodo)}
                              disabled={submitting}
                            >
                              {METODOS_PAGO.map((metodo) => (
                                <option key={metodo} value={metodo}>
                                  {metodo}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Guardar
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

export default ModalAgregarPension;
