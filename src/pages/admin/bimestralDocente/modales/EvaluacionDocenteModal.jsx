import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Loader2, Award, UserCheck, Calendar, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import trabajadorService from "../../../../services/trabajadorService.js";
import { bimestreService } from "../../../../services/bimestreService.js";
import { evaluacionService } from "../../../../services/evaluacionService.js";

const schema = yup.object({
  tipoCalificacion: yup
    .string()
    .oneOf(["NUMERICA", "LITERAL"])
    .required("Tipo de calificación es requerido"),
  // Campos numéricos (condicionales)
  puntajePlanificacionNumerico: yup.mixed().when("tipoCalificacion", {
    is: "NUMERICA",
    then: (schema) =>
      yup.number()
        .min(0)
        .max(20)
        .required("Puntaje numérico de planificación es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeMetodologiaNumerico: yup.mixed().when("tipoCalificacion", {
    is: "NUMERICA",
    then: (schema) =>
      yup.number()
        .min(0)
        .max(20)
        .required("Puntaje numérico de metodología es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajePuntualidadNumerico: yup.mixed().when("tipoCalificacion", {
    is: "NUMERICA",
    then: (schema) =>
      yup.number()
        .min(0)
        .max(20)
        .required("Puntaje numérico de puntualidad es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeCreatividadNumerico: yup.mixed().when("tipoCalificacion", {
    is: "NUMERICA",
    then: (schema) =>
      yup.number()
        .min(0)
        .max(20)
        .required("Puntaje numérico de creatividad es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeComunicacionNumerico: yup.mixed().when("tipoCalificacion", {
    is: "NUMERICA",
    then: (schema) =>
      yup.number()
        .min(0)
        .max(20)
        .required("Puntaje numérico de comunicación es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  // Campos literales (condicionales)
  puntajePlanificacionLiteral: yup.mixed().when("tipoCalificacion", {
    is: "LITERAL",
    then: (schema) =>
      yup.string()
        .oneOf(["A", "B", "C", "D"])
        .required("Puntaje literal de planificación es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeMetodologiaLiteral: yup.mixed().when("tipoCalificacion", {
    is: "LITERAL",
    then: (schema) =>
      yup.string()
        .oneOf(["A", "B", "C", "D"])
        .required("Puntaje literal de metodología es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajePuntualidadLiteral: yup.mixed().when("tipoCalificacion", {
    is: "LITERAL",
    then: (schema) =>
      yup.string()
        .oneOf(["A", "B", "C", "D"])
        .required("Puntaje literal de puntualidad es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeCreatividadLiteral: yup.mixed().when("tipoCalificacion", {
    is: "LITERAL",
    then: (schema) =>
      yup.string()
        .oneOf(["A", "B", "C", "D"])
        .required("Puntaje literal de creatividad es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  puntajeComunicacionLiteral: yup.mixed().when("tipoCalificacion", {
    is: "LITERAL",
    then: (schema) =>
      yup.string()
        .oneOf(["A", "B", "C", "D"])
        .required("Puntaje literal de comunicación es requerido"),
    otherwise: (schema) => yup.mixed().optional(),
  }),
  idTrabajador: yup.string().required("Docente es requerido"),
  idBimestre: yup.string().required("Bimestre es requerido"),
  observaciones: yup.string().required("Observaciones son requeridas"),
  fechaEvaluacion: yup.string().required("Fecha de evaluación es requerida"),
});

const EvaluacionDocenteModal = ({ isOpen, onClose, onSuccess }) => {
  const [trabajadores, setTrabajadores] = useState([]);
  const [bimestres, setBimestres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tipoCalificacion: "NUMERICA",
    },
  });

  // Observar el tipo de calificación seleccionado
  const tipoCalificacion = watch("tipoCalificacion");

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trabajadoresRes, bimestreActualRes] = await Promise.all([
        trabajadorService.getAllTrabajadores(),
        bimestreService.getBimestreActual(),
      ]);

      // Filtrar solo los trabajadores con rol DOCENTE
      const docentes = (trabajadoresRes || []).filter(
        (trabajador) =>
          trabajador.idRol?.nombre === "DOCENTE" ||
          trabajador.rol?.nombre === "DOCENTE"
      );

      setTrabajadores(docentes);
      setBimestres(bimestreActualRes ? [bimestreActualRes] : []);

      // Preseleccionar el bimestre activo si existe
      if (bimestreActualRes) {
        reset((prevValues) => ({
          ...prevValues,
          idBimestre: bimestreActualRes.idBimestre,
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    console.log("🚀 onSubmit ejecutándose...");
    console.log("📄 Datos del formulario:", data);
    console.log("🔍 Errores actuales:", errors);

    // Log específico para debugging de campos LITERAL
    if (data.tipoCalificacion === "LITERAL") {
      console.log("🔤 Debugging campos LITERAL:");
      console.log("  - puntajePlanificacionLiteral:", data.puntajePlanificacionLiteral);
      console.log("  - puntajeMetodologiaLiteral:", data.puntajeMetodologiaLiteral);
      console.log("  - puntajePuntualidadLiteral:", data.puntajePuntualidadLiteral);
      console.log("  - puntajeCreatividadLiteral:", data.puntajeCreatividadLiteral);
      console.log("  - puntajeComunicacionLiteral:", data.puntajeComunicacionLiteral);
    }

    // Validaciones adicionales antes de enviar
    if (!data.idTrabajador || !data.idBimestre) {
      console.error("❌ Faltan datos requeridos: trabajador o bimestre");
      toast.error("Por favor selecciona un docente y un bimestre");
      return;
    }

    setSubmitting(true);
    try {
      // Get idCoordinador from localStorage
      const authData = JSON.parse(
        localStorage.getItem("auth-storage") ||
          localStorage.getItem("auth") ||
          "{}"
      );
      console.log("🔑 Auth data from localStorage:", authData);

      const idCoordinador = authData.state?.user?.entidadId;
      console.log("👤 ID Coordinador:", idCoordinador);

      if (!idCoordinador) {
        console.error("❌ No se pudo obtener el ID del coordinador");
        toast.error("No se pudo obtener el ID del coordinador");
        return;
      }

      const evaluationData = {
        tipoCalificacion: data.tipoCalificacion,
        idTrabajador: data.idTrabajador,
        idBimestre: data.idBimestre,
        idCoordinador,
        observaciones: data.observaciones,
        fechaEvaluacion: data.fechaEvaluacion
          ? new Date(data.fechaEvaluacion).toISOString().split("T")[0]
          : null,
      };

      console.log("📊 Tipo de calificación:", data.tipoCalificacion);

      // Agregar campos según el tipo de calificación
      if (data.tipoCalificacion === "NUMERICA") {
        console.log("🔢 Procesando calificación NUMERICA");
        evaluationData.puntajePlanificacionNumerico = parseFloat(
          data.puntajePlanificacionNumerico
        );
        evaluationData.puntajeMetodologiaNumerico = parseFloat(
          data.puntajeMetodologiaNumerico
        );
        evaluationData.puntajePuntualidadNumerico = parseFloat(
          data.puntajePuntualidadNumerico
        );
        evaluationData.puntajeCreatividadNumerico = parseFloat(
          data.puntajeCreatividadNumerico
        );
        evaluationData.puntajeComunicacionNumerico = parseFloat(
          data.puntajeComunicacionNumerico
        );

        // Campos de compatibilidad (por si el backend los necesita)
        evaluationData.puntajePlanificacion = parseFloat(
          data.puntajePlanificacionNumerico
        );
        evaluationData.puntajeMetodologia = parseFloat(
          data.puntajeMetodologiaNumerico
        );
        evaluationData.puntajePuntualidad = parseFloat(
          data.puntajePuntualidadNumerico
        );
        evaluationData.puntajeCreatividad = parseFloat(
          data.puntajeCreatividadNumerico
        );
        evaluationData.puntajeComunicacion = parseFloat(
          data.puntajeComunicacionNumerico
        );
        
        // Asegurar que los campos literales estén undefined para NUMERICA
        evaluationData.puntajePlanificacionLiteral = undefined;
        evaluationData.puntajeMetodologiaLiteral = undefined;
        evaluationData.puntajePuntualidadLiteral = undefined;
        evaluationData.puntajeCreatividadLiteral = undefined;
        evaluationData.puntajeComunicacionLiteral = undefined;
      } else {
        console.log("🔤 Procesando calificación LITERAL");
        evaluationData.puntajePlanificacionLiteral =
          data.puntajePlanificacionLiteral;
        evaluationData.puntajeMetodologiaLiteral =
          data.puntajeMetodologiaLiteral;
        evaluationData.puntajePuntualidadLiteral =
          data.puntajePuntualidadLiteral;
        evaluationData.puntajeCreatividadLiteral =
          data.puntajeCreatividadLiteral;
        evaluationData.puntajeComunicacionLiteral =
          data.puntajeComunicacionLiteral;

        // Convertir letras a números para compatibilidad
        const convertirLetraANumero = (letra) => {
          const conversion = { A: 20, B: 16, C: 12, D: 8 };
          return conversion[letra] || 0;
        };

        evaluationData.puntajePlanificacion = convertirLetraANumero(
          data.puntajePlanificacionLiteral
        );
        evaluationData.puntajeMetodologia = convertirLetraANumero(
          data.puntajeMetodologiaLiteral
        );
        evaluationData.puntajePuntualidad = convertirLetraANumero(
          data.puntajePuntualidadLiteral
        );
        evaluationData.puntajeCreatividad = convertirLetraANumero(
          data.puntajeCreatividadLiteral
        );
        evaluationData.puntajeComunicacion = convertirLetraANumero(
          data.puntajeComunicacionLiteral
        );
        
        // Asegurar que los campos numéricos estén undefined para LITERAL
        evaluationData.puntajePlanificacionNumerico = undefined;
        evaluationData.puntajeMetodologiaNumerico = undefined;
        evaluationData.puntajePuntualidadNumerico = undefined;
        evaluationData.puntajeCreatividadNumerico = undefined;
        evaluationData.puntajeComunicacionNumerico = undefined;
      }

      console.log("📤 Datos finales a enviar al backend:", evaluationData);

      console.log("🌐 Llamando a evaluacionService.createEvaluacionDocente...");
      const response = await evaluacionService.createEvaluacionDocente(
        evaluationData
      );
      console.log("✅ Respuesta del backend:", response);

      toast.success("Evaluación creada exitosamente");
      reset();
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("❌ Error completo:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error message:", error.message);

      // Show specific error message from backend if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error al crear la evaluación";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      console.log("🏁 onSubmit finalizado");
    }
  };

  // Función para manejar errores de validación
  const onError = (errors) => {
    console.log("❌ Errores de validación del formulario:", errors);
    console.log("❌ Cantidad de errores:", Object.keys(errors).length);
    
    // Mostrar cada error específico
    Object.keys(errors).forEach(field => {
      console.log(`❌ Campo "${field}": ${errors[field]?.message}`);
    });
    
    // Crear mensaje más específico
    const errorMessages = Object.keys(errors).map(field => 
      `• ${field}: ${errors[field]?.message}`
    ).join('\n');
    
    console.log("❌ Resumen de errores:\n" + errorMessages);
    toast.error(`Faltan campos requeridos:\n${errorMessages}`);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        Evaluar Docente
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Registra la evaluación bimestral del docente
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    {/* Sección de tipo de calificación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Calificación *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="NUMERICA"
                            {...register("tipoCalificacion")}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">
                            Numérica (0-20)
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="LITERAL"
                            {...register("tipoCalificacion")}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">
                            Literal (A-D)
                          </span>
                        </label>
                      </div>
                      {errors.tipoCalificacion && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tipoCalificacion.message}
                        </p>
                      )}
                    </div>

                    {/* Sección de selección */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Docente *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserCheck className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            {...register("idTrabajador")}
                            disabled={loading}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seleccionar docente</option>
                            {trabajadores.map((trabajador) => (
                              <option
                                key={trabajador.idTrabajador}
                                value={trabajador.idTrabajador}
                              >
                                {trabajador.nombre} {trabajador.apellido}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.idTrabajador && (
                          <p className="text-red-500 text-sm">
                            {errors.idTrabajador.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bimestre Activo *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            {...register("idBimestre")}
                            disabled={loading}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seleccionar bimestre</option>
                            {bimestres.map((bimestre) => (
                              <option
                                key={bimestre.idBimestre}
                                value={bimestre.idBimestre}
                              >
                                {bimestre.nombreBimestre} (Activo)
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors.idBimestre && (
                          <p className="text-red-500 text-sm">
                            {errors.idBimestre.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sección de puntajes */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Puntajes de Evaluación (
                        {tipoCalificacion === "NUMERICA"
                          ? "Numérica 0-20"
                          : "Literal A-D"}
                        )
                      </h4>

                      {tipoCalificacion === "NUMERICA" ? (
                        // Puntajes numéricos
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Planificación *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                {...register("puntajePlanificacionNumerico")}
                                disabled={loading}
                                placeholder="18.5"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Puntaje de 0 a 20
                            </p>
                            {errors.puntajePlanificacionNumerico && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajePlanificacionNumerico.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Metodología *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                {...register("puntajeMetodologiaNumerico")}
                                disabled={loading}
                                placeholder="16.5"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Puntaje de 0 a 20
                            </p>
                            {errors.puntajeMetodologiaNumerico && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeMetodologiaNumerico.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Puntualidad *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                {...register("puntajePuntualidadNumerico")}
                                disabled={loading}
                                placeholder="15.0"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Puntaje de 0 a 20
                            </p>
                            {errors.puntajePuntualidadNumerico && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajePuntualidadNumerico.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Creatividad *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                {...register("puntajeCreatividadNumerico")}
                                disabled={loading}
                                placeholder="17.0"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Puntaje de 0 a 20
                            </p>
                            {errors.puntajeCreatividadNumerico && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeCreatividadNumerico.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Comunicación *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="20"
                                {...register("puntajeComunicacionNumerico")}
                                disabled={loading}
                                placeholder="19.0"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Puntaje de 0 a 20
                            </p>
                            {errors.puntajeComunicacionNumerico && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeComunicacionNumerico.message}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Puntajes literales
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Planificación *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                {...register("puntajePlanificacionLiteral")}
                                disabled={loading}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Seleccionar</option>
                                <option value="A">A - Excelente</option>
                                <option value="B">B - Bueno</option>
                                <option value="C">C - Regular</option>
                                <option value="D">D - Deficiente</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              A=Excelente, B=Bueno, C=Regular, D=Deficiente
                            </p>
                            {errors.puntajePlanificacionLiteral && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajePlanificacionLiteral.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Metodología *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                {...register("puntajeMetodologiaLiteral")}
                                disabled={loading}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Seleccionar</option>
                                <option value="A">A - Excelente</option>
                                <option value="B">B - Bueno</option>
                                <option value="C">C - Regular</option>
                                <option value="D">D - Deficiente</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              A=Excelente, B=Bueno, C=Regular, D=Deficiente
                            </p>
                            {errors.puntajeMetodologiaLiteral && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeMetodologiaLiteral.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Puntualidad *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                {...register("puntajePuntualidadLiteral")}
                                disabled={loading}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Seleccionar</option>
                                <option value="A">A - Excelente</option>
                                <option value="B">B - Bueno</option>
                                <option value="C">C - Regular</option>
                                <option value="D">D - Deficiente</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              A=Excelente, B=Bueno, C=Regular, D=Deficiente
                            </p>
                            {errors.puntajePuntualidadLiteral && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajePuntualidadLiteral.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Creatividad *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                {...register("puntajeCreatividadLiteral")}
                                disabled={loading}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Seleccionar</option>
                                <option value="A">A - Excelente</option>
                                <option value="B">B - Bueno</option>
                                <option value="C">C - Regular</option>
                                <option value="D">D - Deficiente</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              A=Excelente, B=Bueno, C=Regular, D=Deficiente
                            </p>
                            {errors.puntajeCreatividadLiteral && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeCreatividadLiteral.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Comunicación *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Award className="h-5 w-5 text-gray-400" />
                              </div>
                              <select
                                {...register("puntajeComunicacionLiteral")}
                                disabled={loading}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="">Seleccionar</option>
                                <option value="A">A - Excelente</option>
                                <option value="B">B - Bueno</option>
                                <option value="C">C - Regular</option>
                                <option value="D">D - Deficiente</option>
                              </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              A=Excelente, B=Bueno, C=Regular, D=Deficiente
                            </p>
                            {errors.puntajeComunicacionLiteral && (
                              <p className="text-red-500 text-sm">
                                {errors.puntajeComunicacionLiteral.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sección de observaciones y fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones *
                        </label>
                        <div className="relative">
                          <div className="absolute top-2 left-3 pointer-events-none">
                            <FileText className="h-5 w-5 text-gray-400" />
                          </div>
                          <textarea
                            {...register("observaciones")}
                            rows={4}
                            disabled={loading}
                            placeholder="Comentarios sobre el desempeño del docente"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Comentarios detallados sobre la evaluación
                        </p>
                        {errors.observaciones && (
                          <p className="text-red-500 text-sm">
                            {errors.observaciones.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha de Evaluación *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            {...register("fechaEvaluacion")}
                            disabled={loading}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Fecha en que se realiza la evaluación
                        </p>
                        {errors.fechaEvaluacion && (
                          <p className="text-red-500 text-sm">
                            {errors.fechaEvaluacion.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        onClick={(e) => {
                          console.log("🔘 Botón Evaluar clickeado directamente");
                          console.log("🔍 Errores del formulario:", errors);
                          console.log("🔍 Loading:", loading, "Submitting:", submitting);
                          console.log("🔍 Tipo calificación:", tipoCalificacion);
                          // No prevenir el default, dejar que el formulario maneje el submit
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Evaluando...
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4 mr-2" />
                            Evaluar
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
  );
};

export default EvaluacionDocenteModal;
