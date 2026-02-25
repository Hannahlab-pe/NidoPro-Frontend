import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Save,
  Loader2,
  DollarSign,
  Info,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import secretariaPagosService from "../../../../services/secretariaPagosService";

const METODOS_PAGO = [
  "Efectivo",
  "Yape",
  "Plin",
  "Transferencia",
  "Depósito",
  "Tarjeta",
];

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const ModalPagoMensual = ({ isOpen, onClose, registro, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [detalleEstudiante, setDetalleEstudiante] = useState(null);
  const [pagoInicialAnterior, setPagoInicialAnterior] = useState(null);
  const [tipoOperacion, setTipoOperacion] = useState("cuotaMensual"); // 'pagoInicial' | 'cuotaMensual'

  // Estados para selección de horario
  const [horarioAsignado, setHorarioAsignado] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [guardandoHorario, setGuardandoHorario] = useState(false);

  // Estados para modal de confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [datosConfirmacion, setDatosConfirmacion] = useState(null);

  const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const estudiante =
    registro?.registro?.estudiante ||
    registro?.estudiante ||
    registro?.registro?.idEstudiante ||
    registro?.idEstudiante ||
    null;

  const estudianteId = useMemo(() => {
    if (!estudiante) return null;
    if (typeof estudiante === "string") return estudiante;
    return estudiante.idEstudiante || estudiante.id || null;
  }, [estudiante]);

  const estudianteNombre = useMemo(() => {
    if (!estudiante) return "";
    return `${estudiante.apellido || ""} ${estudiante.nombre || ""}`.trim();
  }, [estudiante]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      mes: "",
      anio: new Date().getFullYear(),
      monto: "",
      fechaPago: new Date().toISOString().split("T")[0],
      metodoPago: "Efectivo",
      esParcial: false,
      pagoInicialMonto: "",
      pagoInicialFecha: "",
      pagoInicialMetodo: "Efectivo",
    },
  });

  const handleClose = () => {
    if (!submitting) {
      reset();
      setDetalleEstudiante(null);
      setPagoInicialAnterior(null);
      setTipoOperacion("cuotaMensual");
      setHorarioAsignado(null);
      setSelectedDays([]);
      setShowConfirmacion(false);
      setDatosConfirmacion(null);
      onClose();
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleGuardarHorario = async () => {
    if (selectedDays.length === 0) {
      toast.error("Selecciona al menos un día de asistencia");
      return;
    }

    try {
      setGuardandoHorario(true);
      const horario = selectedDays
        .sort((a, b) => {
          const order = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
          return order.indexOf(a) - order.indexOf(b);
        })
        .join(" - ");

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
        return;
      }

      const registroData =
        detalleEstudiante?.registro ||
        detalleEstudiante?.data ||
        detalleEstudiante ||
        null;
      const payload = {
        idEstudiante: estudianteId,
        idAula: registroData?.idAula || registroData?.aula?.idAula,
        horario,
        registradoPor,
      };

      await secretariaPagosService.registrarHorarioPagoInicial(payload);
      toast.success("Horario asignado correctamente");
      setHorarioAsignado(horario);
      setSelectedDays([]);

      // Refrescar la tabla
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.message || "Error al asignar horario");
    } finally {
      setGuardandoHorario(false);
    }
  };

  const handleConfirmarActualizacion = async () => {
    if (!datosConfirmacion) return;

    try {
      setSubmitting(true);
      setShowConfirmacion(false);

      const { pagoExistente, payload, diferencia, registradoPor, tipoPago } =
        datosConfirmacion;

      if (tipoPago === "pagoInicial") {
        // Actualizar Pago Inicial usando el endpoint específico
        const payloadMontoInicial = {
          pagoInicialMonto: payload.monto,
          pagoInicialFecha: payload.fecha,
          pagoInicialMetodo: payload.metodo,
          registradoPor,
        };

        await secretariaPagosService.actualizarMontoInicial(
          estudianteId,
          payloadMontoInicial,
        );

        toast.success(
          `Pago inicial actualizado. ${diferencia > 0 ? "Aumento" : "Reducción"} de S/.${Math.abs(diferencia).toFixed(2)} registrado en caja`,
        );
      } else {
        // Actualizar Cuota Mensual - El backend registra automáticamente en caja
        await secretariaPagosService.actualizarPagoMensual(
          pagoExistente.idPagoMensual,
          {
            monto: payload.monto,
            registradoPor,
          },
        );

        toast.success(
          `Pago mensual actualizado. ${diferencia > 0 ? "Aumento" : "Reducción"} de S/.${Math.abs(diferencia).toFixed(2)} registrado en caja`,
        );
      }

      setDatosConfirmacion(null);
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || "Error al actualizar pago");
    } finally {
      setSubmitting(false);
    }
  };

  const pagosMensuales = useMemo(() => {
    const source =
      detalleEstudiante?.pagosMensuales ||
      detalleEstudiante?.registro?.pagosMensuales ||
      detalleEstudiante?.pagos ||
      detalleEstudiante?.detallePagos ||
      registro?.pagosMensuales ||
      registro?.pagos ||
      registro?.detallePagos ||
      registro?.registro?.pagosMensuales ||
      [];
    return Array.isArray(source) ? source : [];
  }, [detalleEstudiante, registro]);

  useEffect(() => {
    const fetchDetalle = async () => {
      if (!isOpen || !estudianteId) return;
      try {
        setLoadingDetalle(true);
        const response =
          await secretariaPagosService.getEstudianteDetalle(estudianteId);
        const raw = response?.info?.data || response?.data || response || null;
        setDetalleEstudiante(raw);

        // Detectar si tiene horario asignado
        const registroData = raw?.registro || raw?.data || raw || null;
        const horario = registroData?.horario || null;
        setHorarioAsignado(horario);

        // Guardar pago inicial anterior para calcular diferencias
        if (registroData?.pagoInicialMonto) {
          setPagoInicialAnterior({
            monto: registroData.pagoInicialMonto,
            fecha: registroData.pagoInicialFecha,
            metodo: registroData.pagoInicialMetodo,
          });
        } else {
          setPagoInicialAnterior(null);
        }
      } catch (error) {
        setDetalleEstudiante(null);
        setPagoInicialAnterior(null);
        setHorarioAsignado(null);
      } finally {
        setLoadingDetalle(false);
      }
    };

    fetchDetalle();
  }, [isOpen, estudianteId]);

  // Auto-llenar campos de Pago Inicial si ya existe
  useEffect(() => {
    if (tipoOperacion === "pagoInicial") {
      if (pagoInicialAnterior) {
        // Pre-llenar con datos existentes
        setValue("pagoInicialMonto", pagoInicialAnterior.monto || "");
        setValue("pagoInicialFecha", pagoInicialAnterior.fecha || "");
        setValue("pagoInicialMetodo", pagoInicialAnterior.metodo || "Efectivo");
      } else {
        // Limpiar campos si no hay pago inicial previo
        setValue("pagoInicialMonto", "");
        setValue("pagoInicialFecha", new Date().toISOString().split("T")[0]);
        setValue("pagoInicialMetodo", "Efectivo");
      }
    }
  }, [tipoOperacion, pagoInicialAnterior, setValue]);

  const getPagoExistente = (mes, anio) => {
    return (
      pagosMensuales.find(
        (pago) =>
          Number(pago.mes) === Number(mes) &&
          Number(pago.anio) === Number(anio),
      ) || null
    );
  };

  // Auto-llenar monto, fecha y método si ya existe pago para el mes/año seleccionado
  useEffect(() => {
    if (tipoOperacion !== "cuotaMensual") return;

    const subscription = watch((value, { name }) => {
      if (name === "mes" || name === "anio") {
        const mesActual = value.mes;
        const anioActual = value.anio;

        if (mesActual && anioActual) {
          const pagoExistente = getPagoExistente(mesActual, anioActual);
          if (pagoExistente) {
            // Llenar campos con datos existentes
            setValue("monto", pagoExistente.monto);
            setValue("fechaPago", pagoExistente.fechaPago || "");
            setValue("metodoPago", pagoExistente.metodoPago || "Efectivo");
          } else {
            // Limpiar campos si no existe pago
            setValue("monto", "");
            setValue("fechaPago", new Date().toISOString().split("T")[0]);
            setValue("metodoPago", "Efectivo");
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, tipoOperacion, pagosMensuales, setValue]);

  const onSubmit = async (data) => {
    if (!estudianteId) {
      toast.error("No se encontró el estudiante");
      return;
    }

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

      // Modo: Pago Inicial
      if (tipoOperacion === "pagoInicial") {
        if (!data.pagoInicialMonto) {
          toast.error("Ingresa el monto del pago inicial");
          setSubmitting(false);
          return;
        }

        if (!data.pagoInicialFecha) {
          toast.error("Ingresa la fecha del pago inicial");
          setSubmitting(false);
          return;
        }

        const nuevoMonto = Number(data.pagoInicialMonto);

        // Si existe pago inicial anterior, verificar si hay cambio de monto
        if (pagoInicialAnterior && pagoInicialAnterior.monto) {
          const montoAnterior = Number(pagoInicialAnterior.monto);
          const diferencia = nuevoMonto - montoAnterior;

          // Si hay cambio de monto, pedir confirmación
          if (diferencia !== 0) {
            const tipoMovimiento = diferencia > 0 ? "INGRESO" : "EGRESO";

            // Guardar datos para confirmar después
            setDatosConfirmacion({
              tipoPago: "pagoInicial",
              payload: {
                monto: nuevoMonto,
                fecha: data.pagoInicialFecha,
                metodo: data.pagoInicialMetodo || "Efectivo",
              },
              montoAnterior,
              montoNuevo: nuevoMonto,
              diferencia,
              tipoMovimiento,
              registradoPor,
            });

            setShowConfirmacion(true);
            setSubmitting(false);
            return;
          }
        }

        // Si no hay cambio de monto o es un nuevo pago, proceder directamente
        const payloadPagoInicial = {
          idEstudiante: estudianteId,
          pagoInicialMonto: nuevoMonto,
          pagoInicialFecha: data.pagoInicialFecha,
          pagoInicialMetodo: data.pagoInicialMetodo || "Efectivo",
          registradoPor,
        };

        await secretariaPagosService.registrarHorarioPagoInicial(
          payloadPagoInicial,
        );

        toast.success("Pago inicial registrado correctamente");

        if (onSuccess) onSuccess();
        handleClose();
        return;
      }

      // Modo: Cuota Mensual
      const payload = {
        idEstudiante: estudianteId,
        mes: Number(data.mes),
        anio: Number(data.anio),
        monto: Number(data.monto),
        fechaPago: data.fechaPago,
        metodoPago: data.metodoPago,
        esParcial: false,
        registradoPor,
      };

      if (!payload.monto) {
        toast.error("Ingresa el monto del pago");
        setSubmitting(false);
        return;
      }

      if (!payload.fechaPago) {
        toast.error("Ingresa la fecha de pago");
        setSubmitting(false);
        return;
      }

      // Verificar si ya existe un pago para este mes/año
      const pagoExistente = getPagoExistente(data.mes, data.anio);

      try {
        if (!pagoExistente) {
          // Crear nuevo pago
          await secretariaPagosService.registrarPagoMensual(payload);
          toast.success("Pago mensual registrado correctamente");
        } else {
          // Actualizar pago existente
          const montoAnterior = Number(pagoExistente.monto);
          const montoNuevo = Number(data.monto);
          const diferencia = montoNuevo - montoAnterior;

          // Si hay cambio de monto, pedir confirmación
          if (diferencia !== 0) {
            const tipoMovimiento = diferencia > 0 ? "INGRESO" : "EGRESO";

            // Guardar datos para confirmar después
            setDatosConfirmacion({
              tipoPago: "cuotaMensual",
              pagoExistente,
              payload,
              diferencia,
              tipoMovimiento,
              montoAnterior,
              montoNuevo,
              data,
              registradoPor,
            });
            setShowConfirmacion(true);
            setSubmitting(false);
            return;
          } else {
            // Sin cambio de monto, solo actualizar otros campos
            await secretariaPagosService.actualizarPagoMensual(
              pagoExistente.idPagoMensual,
              {
                monto: payload.monto,
                registradoPor,
              },
            );
            toast.success("Pago mensual actualizado correctamente");
          }
        }
      } catch (error) {
        throw error;
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
    <>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Registrar o editar pago mensual
                      </Dialog.Title>
                      {estudianteNombre && (
                        <p className="text-sm text-gray-500 mt-1">
                          {estudianteNombre}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Mostrar selector de horario si no tiene asignado */}
                  {!horarioAsignado && !loadingDetalle ? (
                    <div className="space-y-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-900 mb-2">
                          ⚠️ Asignar Horario
                        </p>
                        <p className="text-xs text-yellow-700">
                          Este estudiante no tiene un horario asignado. Por
                          favor, selecciona los días de asistencia antes de
                          continuar.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Días de asistencia{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {DIAS_SEMANA.map((dia) => (
                            <button
                              key={dia}
                              type="button"
                              onClick={() => handleDayToggle(dia)}
                              className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                selectedDays.includes(dia)
                                  ? "bg-blue-600 text-white shadow-md"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {dia}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          disabled={guardandoHorario}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleGuardarHorario}
                          disabled={
                            guardandoHorario || selectedDays.length === 0
                          }
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {guardandoHorario ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Guardar Horario
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : loadingDetalle ? (
                    <div className="p-6 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      Cargando información...
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Botones de selección de tipo de operación */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTipoOperacion("pagoInicial")}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                            tipoOperacion === "pagoInicial"
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <DollarSign className="w-5 h-5" />
                          Pago Inicial
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoOperacion("cuotaMensual")}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                            tipoOperacion === "cuotaMensual"
                              ? "bg-green-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          <CalendarIcon className="w-5 h-5" />
                          Cuota Mensual
                        </button>
                      </div>

                      {/* Modo: Pago Inicial */}
                      {tipoOperacion === "pagoInicial" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Monto <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register("pagoInicialMonto", {
                                required:
                                  tipoOperacion === "pagoInicial"
                                    ? "Monto requerido"
                                    : false,
                              })}
                              className={inputClass(
                                errors.pagoInicialMonto,
                              )}
                              placeholder="0.00"
                            />
                            {errors.pagoInicialMonto && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.pagoInicialMonto.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Fecha <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              {...register("pagoInicialFecha", {
                                required:
                                  tipoOperacion === "pagoInicial"
                                    ? "Fecha requerida"
                                    : false,
                              })}
                              className={inputClass(
                                errors.pagoInicialFecha,
                              )}
                            />
                            {errors.pagoInicialFecha && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.pagoInicialFecha.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Método de pago <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...register("pagoInicialMetodo")}
                              className={inputClass(
                                errors.pagoInicialMetodo,
                              )}
                            >
                              {METODOS_PAGO.map((metodo) => (
                                <option key={metodo} value={metodo}>
                                  {metodo}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Modo: Cuota Mensual */}
                      {tipoOperacion === "cuotaMensual" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mes <span className="text-red-500">*</span>
                              </label>
                              <select
                                {...register("mes", {
                                  required: "Mes requerido",
                                })}
                                className={inputClass(errors.mes)}
                              >
                                <option value="">Seleccionar mes</option>
                                {MESES.map((label, index) => (
                                  <option key={label} value={index + 1}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                              {errors.mes && (
                                <p className="text-xs text-red-600 mt-1">
                                  {errors.mes.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Año <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                {...register("anio", {
                                  required: "Año requerido",
                                })}
                                className={inputClass(errors.anio)}
                              />
                              {errors.anio && (
                                <p className="text-xs text-red-600 mt-1">
                                  {errors.anio.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monto <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                {...register("monto", {
                                  required: "Monto requerido",
                                })}
                                className={inputClass(errors.monto)}
                                placeholder="0.00"
                              />
                              {errors.monto && (
                                <p className="text-xs text-red-600 mt-1">
                                  {errors.monto.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de pago{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                {...register("fechaPago", {
                                  required: "Fecha requerida",
                                })}
                                className={inputClass(errors.fechaPago)}
                              />
                              {errors.fechaPago && (
                                <p className="text-xs text-red-600 mt-1">
                                  {errors.fechaPago.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Método de pago{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <select
                              {...register("metodoPago", {
                                required: "Método de pago requerido",
                              })}
                              className={inputClass(errors.metodoPago)}
                            >
                              {METODOS_PAGO.map((metodo) => (
                                <option key={metodo} value={metodo}>
                                  {metodo}
                                </option>
                              ))}
                            </select>
                            {errors.metodoPago && (
                              <p className="text-xs text-red-600 mt-1">
                                {errors.metodoPago.message}
                              </p>
                            )}
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
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de Confirmación */}
      <Transition appear show={showConfirmacion} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[60]"
          onClose={() => {
            setShowConfirmacion(false);
            setDatosConfirmacion(null);
            setSubmitting(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                  {datosConfirmacion && (
                    <>
                      {/* Header con color según tipo */}
                      <div
                        className={`px-6 py-4 ${
                          datosConfirmacion.tipoMovimiento === "INGRESO"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-red-500 to-rose-600"
                        }`}
                      >
                        <Dialog.Title className="text-lg font-semibold text-white flex items-center gap-2">
                          <Info className="w-5 h-5" />
                          Confirmar Actualización
                        </Dialog.Title>
                      </div>

                      {/* Contenido */}
                      <div className="px-6 py-5">
                        <p className="text-gray-700 mb-4">
                          ¿Está seguro que desea actualizar el {datosConfirmacion.tipoPago === "pagoInicial" ? "pago inicial" : "pago mensual"}?
                        </p>

                        {/* Detalle del movimiento */}
                        <div
                          className={`rounded-lg p-4 mb-4 ${
                            datosConfirmacion.tipoMovimiento === "INGRESO"
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign
                              className={`w-5 h-5 ${
                                datosConfirmacion.tipoMovimiento === "INGRESO"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            />
                            <span
                              className={`font-semibold ${
                                datosConfirmacion.tipoMovimiento === "INGRESO"
                                  ? "text-green-800"
                                  : "text-red-800"
                              }`}
                            >
                              {datosConfirmacion.tipoMovimiento}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Monto anterior:
                              </span>
                              <span className="font-medium text-gray-800">
                                S/. {datosConfirmacion.montoAnterior.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Monto nuevo:
                              </span>
                              <span className="font-medium text-gray-800">
                                S/. {datosConfirmacion.montoNuevo.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-gray-700 font-medium">
                                  {datosConfirmacion.tipoMovimiento ===
                                  "INGRESO"
                                    ? "Aumento:"
                                    : "Reducción:"}
                                </span>
                                <span
                                  className={`font-bold ${
                                    datosConfirmacion.tipoMovimiento ===
                                    "INGRESO"
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }`}
                                >
                                  S/.{" "}
                                  {Math.abs(
                                    datosConfirmacion.diferencia,
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">
                          Se registrará automáticamente en caja como{" "}
                          <span
                            className={`font-semibold ${
                              datosConfirmacion.tipoMovimiento === "INGRESO"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {datosConfirmacion.tipoMovimiento}
                          </span>
                          .
                        </p>
                      </div>

                      {/* Botones */}
                      <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowConfirmacion(false);
                            setDatosConfirmacion(null);
                            setSubmitting(false);
                          }}
                          disabled={submitting}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmarActualizacion}
                          disabled={submitting}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center gap-2 disabled:opacity-50 ${
                            datosConfirmacion.tipoMovimiento === "INGRESO"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Confirmar
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ModalPagoMensual;
