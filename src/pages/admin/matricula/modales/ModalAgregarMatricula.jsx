import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, UserPlus, DollarSign, User, Users, School, Baby, Upload, Save, Loader2, Search, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useMatricula } from '../../../../hooks/useMatricula';
import { useAsignarAula } from '../../../../hooks/queries/useMatriculaQueries';
import { useAulasAsignacion } from '../../../../hooks/useAulasAsignacion';
import { useApoderados } from '../../../../hooks/useApoderados';
import { useGrados } from '../../../../hooks/useGrados';
import FormField from '../../../../components/common/FormField';
import { 
  validateAndCleanContactos, 
  ensurePrimaryContact, 
  validateMatriculaData,
  generateDataSummary 
} from '../../../../utils/matriculaValidation';
  const schema = yup.object({
  // Información de Matrícula
  costoMatricula: yup.number()
    .required('El costo de matrícula es requerido')
    .positive('El costo debe ser mayor a 0'),
  fechaIngreso: yup.string()
    .required('La fecha de ingreso es requerida'),
  idGrado: yup.string()
    .required('El grado es requerido'),
  metodoPago: yup.string()
    .required('El método de pago es requerido'),
  
  // Voucher - requerido para métodos de pago que no sean efectivo
  voucherFile: yup.mixed()
    .when('metodoPago', {
      is: (metodoPago) => metodoPago && metodoPago !== 'Efectivo',
      then: (schema) => schema.required('El voucher es requerido para este método de pago'),
      otherwise: (schema) => schema.nullable()
    }),
  
  // Información del Estudiante
  estudianteNombre: yup.string()
    .required('El nombre del estudiante es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  estudianteApellido: yup.string()
    .required('El apellido del estudiante es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  estudianteTipoDoc: yup.string()
    .required('El tipo de documento es requerido'),
  estudianteDocumento: yup.string()
    .required('El número de documento es requerido')
    .when('estudianteTipoDoc', {
      is: 'Carnet de Extranjería',
      then: (schema) => schema.min(20, 'El Carnet de Extranjería debe tener al menos 20 caracteres'),
      otherwise: (schema) => schema.min(8, 'El documento debe tener al menos 8 caracteres')
    }),
  contactosEmergencia: yup.array().of(
    yup.object({
      nombre: yup.string()
        .required('Nombre de contacto requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(50, 'El nombre no puede superar los 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
      apellido: yup.string()
        .required('Apellido de contacto requerido')
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .max(50, 'El apellido no puede superar los 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
      telefono: yup.string()
        .required('Teléfono requerido')
        .min(9, 'El teléfono debe tener al menos 9 dígitos')
        .max(15, 'El teléfono no puede superar los 15 dígitos'),
      email: yup.string()
        .email('Email inválido')
        .required('Email requerido')
        .max(100, 'El email no puede superar los 100 caracteres'),
      tipoContacto: yup.string()
        .required('Tipo de contacto requerido')
        .min(2, 'El tipo de contacto debe tener al menos 2 caracteres')
        .max(30, 'El tipo de contacto no puede superar los 30 caracteres'),
      esPrincipal: yup.boolean(),
      prioridad: yup.number()
        .min(1, 'La prioridad debe ser al menos 1')
        .max(10, 'La prioridad no puede superar 10')
        .required('Prioridad requerida'),
    })
  ).min(1, 'Debe agregar al menos un contacto de emergencia').required('Los contactos de emergencia son requeridos'),
  
  // Información del Apoderado
  apoderadoNombre: yup.string()
    .required('El nombre del apoderado es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  apoderadoApellido: yup.string()
    .required('El apellido del apoderado es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios'),
  apoderadoTipoDoc: yup.string()
    .required('El tipo de documento es requerido'),
  apoderadoDocumento: yup.string()
    .required('El número de documento es requerido')
    .when('apoderadoTipoDoc', {
      is: 'Carnet de Extranjería',
      then: (schema) => schema.min(20, 'El Carnet de Extranjería debe tener al menos 20 caracteres'),
      otherwise: (schema) => schema.min(8, 'El documento debe tener al menos 8 caracteres')
    }),
  apoderadoTelefono: yup.string()
    .required('El teléfono es requerido'),
  apoderadoCorreo: yup.string()
    .required('El correo es requerido')
    .email('Debe ser un correo válido'),
  apoderadoDireccion: yup.string()
    .required('La dirección es requerida'),

  // Campos opcionales
  observaciones: yup.string(),
  motivoPreferencia: yup.string()
});

const ModalAgregarMatricula = ({ isOpen, onClose, refetch }) => {
  const { matricularEstudiante, loading, creating } = useMatricula();
  const asignarAulaMutation = useAsignarAula();
  
  // Usar el hook con manejo de errores
  let aulasHookData;
  try {
    aulasHookData = useAulasAsignacion();
  } catch (error) {
    console.error('❌ Error al inicializar useAulasAsignacion:', error);
    aulasHookData = {
      aulas: [],
      loadingAulas: false,
      fetchAulasPorGrado: () => Promise.resolve(),
      aulasDisponiblesPorGrado: [],
      loadingAulasPorGrado: false
    };
  }
  
  const { aulas, aulasDisponiblesPorGrado, loadingAulas, loadingAulasPorGrado, fetchAulasPorGrado } = aulasHookData;
  const { apoderados, loadingApoderados, searchApoderados } = useApoderados();
  const { grados, isLoading: loadingGrados, isError: errorGrados } = useGrados();

  // Debug: Ver qué grados estamos obteniendo
  useEffect(() => {
  }, [grados, loadingGrados, errorGrados]);
  
  const [voucherImage, setVoucherImage] = useState(null);
  const [voucherFile, setVoucherFile] = useState(null);
  const [uploadingVoucher, setUploadingVoucher] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showApoderadoSearch, setShowApoderadoSearch] = useState(false);
  const [selectedApoderado, setSelectedApoderado] = useState(null);
  const [selectedAulaId, setSelectedAulaId] = useState('');
  const [gradoCargado, setGradoCargado] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepDirection, setStepDirection] = useState('forward');

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, setError, clearErrors, trigger, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      metodoPago: 'Transferencia bancaria',
      estudianteTipoDoc: 'DNI',
      apoderadoTipoDoc: 'DNI',
      fechaIngreso: new Date().toISOString().split('T')[0],
      contactosEmergencia: [{ nombre: '', apellido: '', telefono: '', email: '', tipoContacto: '', esPrincipal: true, prioridad: 1 }],
      voucherFile: null,
      idAulaEspecifica: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contactosEmergencia'
  });

  const selectedGrado = watch('idGrado');
  const tipoAsignacionAula = 'manual';

  // Opciones predefinidas — valores exactos que acepta el backend
  const metodosPago = [
    { value: 'Efectivo',             label: 'Efectivo' },
    { value: 'Transferencia bancaria', label: 'Transferencia bancaria' },
    { value: 'Depósito bancario',    label: 'Depósito bancario' },
    { value: 'Tarjeta de crédito',   label: 'Tarjeta de crédito' },
    { value: 'Tarjeta de débito',    label: 'Tarjeta de débito' },
    { value: 'Pago móvil',           label: 'Pago móvil' },
  ];
  const tiposDocumento = ['DNI', 'Carnet de Extranjería', 'Pasaporte'];

  const stepLabels = ['Matrícula', 'Estudiante', 'Apoderado', 'Aula'];
  const isLastStep = currentStep === stepLabels.length - 1;

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setGradoCargado(null);
      setSelectedAulaId('');
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Efectos
  useEffect(() => {
    const handleGradoChange = async () => {

      // Si no hay grado seleccionado o ya se cargó este grado, no hacer nada
      if (!selectedGrado || gradoCargado === selectedGrado) {
        return;
      }

      // Si estamos cargando, no hacer nada
      if (loadingAulasPorGrado) {
        console.log('ℹ️ Omitiendo carga - ya estamos cargando');
        return;
      }

      console.log('🔄 fetchAulasPorGrado disponible:', typeof fetchAulasPorGrado);

      if (fetchAulasPorGrado) {
        try {
          console.log('🎓 Iniciando carga de aulas disponibles para grado:', selectedGrado);
          await fetchAulasPorGrado(selectedGrado);

          // Marcar que este grado ya se cargó
          setGradoCargado(selectedGrado);

          // Limpiar la selección de aula cuando cambia el grado
          setSelectedAulaId('');
          setValue('idAulaEspecifica', '');
        } catch (error) {
          console.error('❌ Error al cargar aulas disponibles para grado:', error);
          console.error('❌ Stack trace:', error.stack);
          toast.error('Error al cargar aulas disponibles para el grado seleccionado');
        }
      } else {
        console.log('ℹ️ fetchAulasPorGrado no disponible');
      }
    };

    handleGradoChange();
  }, [selectedGrado, fetchAulasPorGrado]); // Solo dependencias esenciales // Removido setValue ya que no cambia

  useEffect(() => {
    const handleSearchApoderados = async () => {
      if (searchTerm.length >= 2 && searchApoderados) {
        try {
          await searchApoderados(searchTerm);
        } catch (error) {
          console.error('❌ Error al buscar apoderados:', error);
          toast.error('Error al buscar apoderados');
        }
      }
    };

    handleSearchApoderados();
  }, [searchTerm, searchApoderados]);

  // Funciones de manejo
  const handleClose = () => {
    reset();
    setSelectedAulaId('');
    setVoucherImage(null);
    setVoucherFile(null);
    setSearchTerm('');
    setSelectedApoderado(null);
    setShowApoderadoSearch(false);
    setGradoCargado(null); // Resetear el estado del grado cargado
    setCurrentStep(0);
    onClose();
  };

  const handleNextStep = async () => {
    setStepDirection('forward');
    let fieldsToValidate = [];

    if (currentStep === 0) {
      fieldsToValidate = ['costoMatricula', 'fechaIngreso', 'idGrado', 'metodoPago', 'voucherFile'];
    }

    if (currentStep === 1) {
      fieldsToValidate = [
        'estudianteNombre',
        'estudianteApellido',
        'estudianteTipoDoc',
        'estudianteDocumento',
        'contactosEmergencia'
      ];
    }

    if (currentStep === 2) {
      fieldsToValidate = [
        'apoderadoNombre',
        'apoderadoApellido',
        'apoderadoTipoDoc',
        'apoderadoDocumento',
        'apoderadoTelefono',
        'apoderadoCorreo',
        'apoderadoDireccion'
      ];
    }

    if (currentStep === 3) {
      if (!watch('idAulaEspecifica')) {
        setError('idAulaEspecifica', {
          type: 'manual',
          message: 'Seleccione un aula disponible'
        });
        return;
      }
      clearErrors('idAulaEspecifica');
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, stepLabels.length - 1));
  };

  const handlePrevStep = () => {
    setStepDirection('backward');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleFinalSubmit = async () => {
    if (!watch('idAulaEspecifica')) {
      setError('idAulaEspecifica', {
        type: 'manual',
        message: 'Seleccione un aula disponible'
      });
      return;
    }
    clearErrors('idAulaEspecifica');
    handleSubmit(onSubmit)();
  };

  const handleSelectApoderado = (apoderado) => {
    setSelectedApoderado(apoderado);
    setValue('apoderadoNombre', apoderado.nombre);
    setValue('apoderadoApellido', apoderado.apellido);
    setValue('apoderadoTipoDoc', apoderado.tipoDocumento || 'DNI');
    setValue('apoderadoDocumento', apoderado.documentoIdentidad || '');
    setValue('apoderadoTelefono', apoderado.numero || '');
    setValue('apoderadoCorreo', apoderado.correo || '');
    setValue('apoderadoDireccion', apoderado.direccion || '');
    setShowApoderadoSearch(false);
    setSearchTerm('');
  };

  const clearSelectedApoderado = () => {
    setSelectedApoderado(null);
    setValue('apoderadoNombre', '');
    setValue('apoderadoApellido', '');
    setValue('apoderadoTipoDoc', 'DNI');
    setValue('apoderadoDocumento', '');
    setValue('apoderadoTelefono', '');
    setValue('apoderadoCorreo', '');
    setValue('apoderadoDireccion', '');
  };

  const onSubmit = async (data) => {
    try {
      console.log('📝 Iniciando creación de matrícula (PASO 1 - SIN AULA)...');
      
      // Validar y limpiar contactos de emergencia
      let contactosEmergenciaLimpios = validateAndCleanContactos(data.contactosEmergencia || []);
      contactosEmergenciaLimpios = ensurePrimaryContact(contactosEmergenciaLimpios);

      console.log('🧹 Contactos de emergencia después de validación:', contactosEmergenciaLimpios);

      if (contactosEmergenciaLimpios.length === 0) {
        toast.error('Error de validación', {
          description: 'Debe agregar al menos un contacto de emergencia válido'
        });
        return;
      }

      const matriculaData = {
        // Datos básicos requeridos (PASO 1 - SIN AULA)
        costoMatricula: data.costoMatricula.toString(),
        fechaIngreso: data.fechaIngreso,
        idGrado: data.idGrado,
        metodoPago: data.metodoPago,
        voucherFile,
        
        // Datos del apoderado (para crear nuevo o actualizar)
        apoderadoData: {
          nombre: selectedApoderado ? selectedApoderado.nombre : data.apoderadoNombre,
          apellido: selectedApoderado ? selectedApoderado.apellido : data.apoderadoApellido,
          tipoDocumentoIdentidad: selectedApoderado ? (selectedApoderado.tipoDocumento || 'DNI') : (data.apoderadoTipoDoc || 'DNI'),
          documentoIdentidad: selectedApoderado ? selectedApoderado.documentoIdentidad : data.apoderadoDocumento,
          numero: selectedApoderado ? selectedApoderado.numero : data.apoderadoTelefono,
          correo: selectedApoderado ? selectedApoderado.correo : data.apoderadoCorreo,
          direccion: selectedApoderado ? selectedApoderado.direccion : data.apoderadoDireccion
        },
        
        // Datos del estudiante (para crear nuevo)
        estudianteData: {
          nombre: data.estudianteNombre?.trim() || '',
          apellido: data.estudianteApellido?.trim() || '',
          tipoDocumento: data.estudianteTipoDoc || 'DNI',
          nroDocumento: data.estudianteDocumento?.trim() || '',
          contactosEmergencia: contactosEmergenciaLimpios,
          observaciones: data.observaciones?.trim() || ''
        }
      };

      console.log('📋 Datos preparados para backend (PASO 1):', JSON.stringify(matriculaData, null, 2));
      
      // Debug específico para contactos de emergencia
      console.log('🚨 VERIFICACIÓN CONTACTOS DE EMERGENCIA:');
      console.log('🚨 data.contactosEmergencia original:', data.contactosEmergencia);
      console.log('🚨 contactosEmergenciaLimpios:', contactosEmergenciaLimpios);
      console.log('🚨 matriculaData.estudianteData.contactosEmergencia:', matriculaData.estudianteData.contactosEmergencia);
      console.log('🚨 Tipo de contactos:', typeof matriculaData.estudianteData.contactosEmergencia);
      console.log('🚨 Es array?:', Array.isArray(matriculaData.estudianteData.contactosEmergencia));
      console.log('🚨 Cantidad:', matriculaData.estudianteData.contactosEmergencia?.length);

      // Validar que hay al menos un contacto de emergencia
      if (!matriculaData.estudianteData.contactosEmergencia || matriculaData.estudianteData.contactosEmergencia.length === 0) {
        toast.error('Error de validación', {
          description: 'Debe agregar al menos un contacto de emergencia válido'
        });
        return;
      }

      // Validar que cada contacto tiene los datos mínimos requeridos
      for (let i = 0; i < matriculaData.estudianteData.contactosEmergencia.length; i++) {
        const contacto = matriculaData.estudianteData.contactosEmergencia[i];
        if (!contacto.nombre || !contacto.apellido || !contacto.telefono || !contacto.email) {
          toast.error('Error de validación', {
            description: `El contacto ${i + 1} debe tener nombre, apellido, teléfono y email`
          });
          return;
        }
      }

      // Limpiar campos undefined antes del envío
      // NOTA: JSON.stringify destruye objetos File, por eso guardamos voucherFile aparte
      const rawFile = matriculaData.voucherFile;
      const cleanMatriculaData = JSON.parse(JSON.stringify(
        { ...matriculaData, voucherFile: undefined },
        (key, value) => value === undefined ? null : value
      ));
      // Re-adjuntar el archivo original (no serializable por JSON)
      if (rawFile) {
        cleanMatriculaData.voucherFile = rawFile;
      }

      console.log('🧹 Datos limpiados para envío:', cleanMatriculaData);
      console.log('🧹 voucherFile adjunto:', !!cleanMatriculaData.voucherFile);
      console.log('🧹 Contactos después de limpiar:', cleanMatriculaData.estudianteData?.contactosEmergencia);

      // PASO 1: (Mutación sube voucher → crea matrícula)
      const resultadoMatricula = await matricularEstudiante(cleanMatriculaData);
      console.log('✅ Resultado PASO 1:', resultadoMatricula);

      // Obtener el ID de la matrícula creada
      const idMatricula = resultadoMatricula?.info?.data?.idMatricula || resultadoMatricula?.data?.idMatricula || resultadoMatricula?.idMatricula;
      
      if (!idMatricula) {
        console.warn('⚠️ No se pudo obtener el ID de la matrícula creada');
        toast.success('✅ Matrícula creada exitosamente (Paso 1/3)', {
          description: 'Ahora puede asignar un aula manualmente'
        });
      } else {
        // PASO 2: Asignar aula si se seleccionó una
        const idAulaSeleccionada = data.idAulaEspecifica || watch('idAulaEspecifica');
        
        if (idAulaSeleccionada) {
          try {
            console.log('🏫 Asignando aula automáticamente (PASO 2)...', {
              idMatricula,
              idAula: idAulaSeleccionada
            });
            
            await asignarAulaMutation.mutateAsync({
              idMatricula,
              idAula: idAulaSeleccionada
            });
            
            toast.success('✅ Matrícula completa (Pasos 1 y 2)', {
              description: 'Estudiante matriculado y aula asignada correctamente'
            });
          } catch (errorAula) {
            console.error('❌ Error al asignar aula (PASO 2):', errorAula);
            toast.warning('Matrícula creada, pero no se pudo asignar el aula', {
              description: 'Por favor, asigne el aula manualmente desde la tabla'
            });
          }
        } else {
          toast.success('✅ Matrícula creada exitosamente (Paso 1/3)', {
            description: 'Ahora puede asignar un aula desde la tabla'
          });
        }
      }
      
      handleClose();
      if (refetch) refetch();
    } catch (error) {
      console.error('❌ Error completo al matricular:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Mostrar error más específico
      let errorMessage = 'Error al matricular estudiante';
      let errorDescription = 'Ha ocurrido un error inesperado. Por favor, inténtelo nuevamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errorDescription = error.response.data.details || error.response.data.error || 'Error del servidor';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        errorDescription = error.response.data.details || 'Error del servidor';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
        errorDescription = 'El servidor encontró un error interno. Por favor, contacte al administrador del sistema.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos';
        errorDescription = 'Los datos enviados no son válidos. Por favor, revise la información e inténtelo nuevamente.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Sesión expirada';
        errorDescription = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Permisos insuficientes';
        errorDescription = 'No tiene permisos para realizar esta operación.';
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000
      });
      
      // Log detallado para debugging
      console.error('❌ Detalles completos del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
    }
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
          <div className="fixed inset-0 bg-black/20 bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 text-center">
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
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Matricular Nuevo Estudiante
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Complete la información del estudiante para registrar su matrícula
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

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                  }}
                  className="space-y-6"
                >
                  {/* Stepper */}
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-2">
                      {stepLabels.map((label, index) => (
                        <div
                          key={label}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            index === currentStep
                              ? 'bg-blue-600 text-white'
                              : index < currentStep
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {index + 1}. {label}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Paso {currentStep + 1} de {stepLabels.length}
                    </p>
                  </div>

                  <Transition
                    show={currentStep === 0}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom={stepDirection === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'}
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo={stepDirection === 'forward' ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'}
                  >
                    <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <DollarSign className="w-6 h-6 mr-3 text-blue-600" />
                        Información de Matrícula
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Costo de Matrícula (S/.)"
                          error={errors.costoMatricula?.message}
                          required
                        >
                          <input
                            {...register('costoMatricula')}
                            type="number"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 150.00"
                          />
                        </FormField>

                        <FormField
                          label="Fecha de Ingreso"
                          error={errors.fechaIngreso?.message}
                          required
                        >
                          <input
                            {...register('fechaIngreso')}
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </FormField>

                        <FormField
                          label="Grado"
                          error={errors.idGrado?.message}
                          required
                        >
                          <select
                            {...register('idGrado')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingGrados}
                          >
                            <option value="">
                              {loadingGrados ? 'Cargando grados...' : 'Seleccionar grado'}
                            </option>
                            {grados.map((grado) => (
                              <option key={grado.idGrado || grado.id} value={grado.idGrado || grado.id}>
                                {grado.nombre || grado.grado}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField
                          label="Método de Pago"
                          error={errors.metodoPago?.message}
                          required
                        >
                          <select
                            {...register('metodoPago')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {metodosPago.map((metodo) => (
                              <option key={metodo.value} value={metodo.value}>
                                {metodo.label}
                              </option>
                            ))}
                          </select>
                        </FormField>
                      </div>

                      {/* Voucher de Pago */}
                      <div className="mt-6">
                        <FormField 
                          label={`Voucher de Pago${watch('metodoPago') !== 'Efectivo' ? ' *' : ''}`} 
                          error={errors.voucherFile?.message}
                        >
                          <div className="relative w-full">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors hover:cursor-pointer h-84 flex flex-col items-center justify-center">
                              {voucherImage ? (
                                <div className="relative">
                                  <img
                                    src={voucherImage}
                                    alt="Voucher"
                                    className="max-h-32 mx-auto rounded-lg object-contain"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVoucherImage(null);
                                      setVoucherFile(null);
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                  <p className="text-sm text-gray-600 mb-2">
                                    Subir voucher de pago
                                  </p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        setVoucherFile(file);
                                        setValue('voucherFile', file); // Registrar en el formulario
                                        const reader = new FileReader();
                                        reader.onload = (e) => setVoucherImage(e.target.result);
                                        reader.readAsDataURL(file);
                                      } else {
                                        setVoucherFile(null);
                                        setValue('voucherFile', null); // Limpiar del formulario
                                        setVoucherImage(null);
                                      }
                                    }}
                                    className="hidden"
                                    id="voucher-upload"
                                  />
                                  <label
                                    htmlFor="voucher-upload"
                                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-50"
                                  >
                                    Seleccionar archivo
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        </FormField>
                      </div>
                    </div>
                  </Transition>

                  <Transition
                    show={currentStep === 1}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom={stepDirection === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'}
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo={stepDirection === 'forward' ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'}
                  >
                    <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <User className="w-6 h-6 mr-3 text-green-600" />
                        Información del Estudiante
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Nombre"
                          error={errors.estudianteNombre?.message}
                          required
                        >
                          <input
                            {...register('estudianteNombre')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: María"
                          />
                        </FormField>

                        <FormField
                          label="Apellido"
                          error={errors.estudianteApellido?.message}
                          required
                        >
                          <input
                            {...register('estudianteApellido')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: García"
                          />
                        </FormField>

                        <FormField
                          label="Tipo de Documento"
                          error={errors.estudianteTipoDoc?.message}
                          required
                        >
                          <select
                            {...register('estudianteTipoDoc')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {tiposDocumento.map((tipo) => (
                              <option key={tipo} value={tipo}>
                                {tipo}
                              </option>
                            ))}
                          </select>
                        </FormField>

                        <FormField
                          label="Número de Documento"
                          error={errors.estudianteDocumento?.message}
                          required
                        >
                          <input
                            {...register('estudianteDocumento')}
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: 87654321"
                          />
                        </FormField>
                      </div>

                      {/* Contactos de emergencia dinámicos */}
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Contactos de Emergencia *
                        </label>
                        {fields.map((field, idx) => (
                          <div key={field.id} className="rounded-lg p-4 mb-3 bg-gray-50">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <FormField
                                label="Nombre"
                                error={errors.contactosEmergencia?.[idx]?.nombre?.message}
                                required
                              >
                                <input 
                                  type="text" 
                                  placeholder="Nombre" 
                                  {...register(`contactosEmergencia.${idx}.nombre`)} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </FormField>
                              <FormField
                                label="Apellido"
                                error={errors.contactosEmergencia?.[idx]?.apellido?.message}
                                required
                              >
                                <input 
                                  type="text" 
                                  placeholder="Apellido" 
                                  {...register(`contactosEmergencia.${idx}.apellido`)} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <FormField
                                label="Teléfono"
                                error={errors.contactosEmergencia?.[idx]?.telefono?.message}
                                required
                              >
                                <input 
                                  type="text" 
                                  placeholder="Teléfono" 
                                  {...register(`contactosEmergencia.${idx}.telefono`)} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </FormField>
                              <FormField
                                label="Email"
                                error={errors.contactosEmergencia?.[idx]?.email?.message}
                                required
                              >
                                <input 
                                  type="email" 
                                  placeholder="Email" 
                                  {...register(`contactosEmergencia.${idx}.email`)} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </FormField>
                            </div>
                            <div className="grid grid-cols-1 gap-3 mb-3">
                              <FormField
                                label="Tipo de contacto"
                                error={errors.contactosEmergencia?.[idx]?.tipoContacto?.message}
                                required
                              >
                                <input 
                                  type="text" 
                                  placeholder="Ej: Madre, Padre, Tío" 
                                  {...register(`contactosEmergencia.${idx}.tipoContacto`)} 
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                              </FormField>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    {...register(`contactosEmergencia.${idx}.esPrincipal`)} 
                                    className="rounded"
                                  />
                                  <span className="text-sm">Contacto principal</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  <label className="text-sm">Prioridad:</label>
                                  <input 
                                    type="number" 
                                    min={1} 
                                    {...register(`contactosEmergencia.${idx}.prioridad`)} 
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                  />
                                </div>
                              </div>
                              {fields.length > 1 && (
                                <button 
                                  type="button" 
                                  className="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-500 rounded hover:bg-red-50 transition-colors" 
                                  onClick={() => remove(idx)}
                                >
                                  Eliminar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2" 
                          onClick={() => append({ 
                            nombre: '', 
                            apellido: '', 
                            telefono: '', 
                            email: '', 
                            tipoContacto: '', 
                            esPrincipal: false, 
                            prioridad: fields.length + 1 
                          })}
                        >
                          <UserPlus className="w-4 h-4" />
                          Agregar contacto
                        </button>
                        {errors.contactosEmergencia && (
                          <p className="text-red-500 text-sm mt-2">
                            {errors.contactosEmergencia.message}
                          </p>
                        )}
                      </div>
                      
                      {/* Observaciones */}
                      <div className="mt-6">
                        <FormField
                          label="Observaciones"
                          error={errors.observaciones?.message}
                        >
                          <textarea
                            {...register('observaciones')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Observaciones adicionales sobre el estudiante (opcional)"
                          />
                        </FormField>
                      </div>
                    </div>
                  </Transition>

                  <Transition
                    show={currentStep === 2}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom={stepDirection === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'}
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo={stepDirection === 'forward' ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'}
                  >
                    <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Users className="w-6 h-6 mr-3 text-green-600" />
                          Información del Apoderado
                        </h3>
                        
                        {/* Botón para buscar apoderado existente */}
                        {!selectedApoderado && (
                          <button
                            type="button"
                            onClick={() => setShowApoderadoSearch(!showApoderadoSearch)}
                            className="flex items-center space-x-2 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Search className="w-4 h-4" />
                            <span>Buscar Existente</span>
                          </button>
                        )}
                        
                        {/* Indicador de apoderado seleccionado */}
                        {selectedApoderado && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                              <UserCheck className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {selectedApoderado.nombre} {selectedApoderado.apellido}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={clearSelectedApoderado}
                              className="text-gray-500 hover:text-red-500 transition-colors"
                              title="Limpiar selección"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Buscador de apoderados */}
                      {showApoderadoSearch && !selectedApoderado && (
                        <div className="mb-6 relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Buscar por nombre o apellido del apoderado..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          {/* Lista de resultados */}
                          {searchTerm.length >= 2 && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {loadingApoderados ? (
                                <div className="p-4 text-center text-gray-500">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                  <p className="mt-2">Buscando...</p>
                                </div>
                              ) : apoderados.length > 0 ? (
                                apoderados.map((apoderado) => (
                                  <button
                                    key={apoderado.id}
                                    type="button"
                                    onClick={() => handleSelectApoderado(apoderado)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-green-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {apoderado.nombre} {apoderado.apellido}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          DNI: {apoderado.documentoIdentidad || 'No registrado'} {apoderado.numero && ` • Tel: ${apoderado.numero}`}
                                        </p>
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  <Users className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                                  <p>No se encontraron apoderados</p>
                                  <p className="text-xs mt-1">Búsqueda: "{searchTerm}"</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Nombre"
                            error={errors.apoderadoNombre?.message}
                            required
                          >
                            <input
                              {...register('apoderadoNombre')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Juan"
                            />
                          </FormField>

                          <FormField
                            label="Apellido"
                            error={errors.apoderadoApellido?.message}
                            required
                          >
                            <input
                              {...register('apoderadoApellido')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Pérez"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Tipo de Documento"
                            error={errors.apoderadoTipoDoc?.message}
                            required
                          >
                            <select
                              {...register('apoderadoTipoDoc')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {tiposDocumento.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                            </select>
                          </FormField>

                          <FormField
                            label="Número de Documento"
                            error={errors.apoderadoDocumento?.message}
                            required
                          >
                            <input
                              {...register('apoderadoDocumento')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 12345678"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            label="Teléfono"
                            error={errors.apoderadoTelefono?.message}
                            required
                          >
                            <input
                              {...register('apoderadoTelefono')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: 987654321"
                            />
                          </FormField>

                          <FormField
                            label="Correo"
                            error={errors.apoderadoCorreo?.message}
                            required
                          >
                            <input
                              {...register('apoderadoCorreo')}
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: apoderado@correo.com"
                            />
                          </FormField>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            label="Dirección"
                            error={errors.apoderadoDireccion?.message}
                            required
                          >
                            <input
                              {...register('apoderadoDireccion')}
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Jr. Los Olivos 123"
                            />
                          </FormField>
                        </div>
                      </div>
                    </div>
                  </Transition>

                  <Transition
                    show={currentStep === 3}
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom={stepDirection === 'forward' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4'}
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo={stepDirection === 'forward' ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'}
                  >
                    <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <School className="w-6 h-6 mr-3 text-blue-600" />
                        Asignación de Aula
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Aula Específica"
                          error={errors.idAulaEspecifica?.message}
                          required
                        >
                          <select
                            value={selectedAulaId}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              console.log('🎯 Aula seleccionada - Value:', selectedValue);
                              console.log('🎯 Aula seleccionada - Text:', e.target.options[e.target.selectedIndex]?.text);
                              setSelectedAulaId(selectedValue);
                              setValue('idAulaEspecifica', selectedValue);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loadingAulasPorGrado}
                          >
                            <option value="">
                              {loadingAulasPorGrado ? 'Cargando aulas disponibles...' : 'Seleccione un aula disponible'}
                            </option>
                            {Array.isArray(aulasDisponiblesPorGrado) && aulasDisponiblesPorGrado.length > 0 ? (
                              aulasDisponiblesPorGrado.map((aula) => (
                                <option key={aula.idAula} value={aula.idAula}>
                                  Sección {aula.seccion} - {aula.cuposDisponibles} cupos disponibles ({aula.estudiantesAsignados}/{aula.cantidadEstudiantes} estudiantes)
                                </option>
                              ))
                            ) : (
                              !loadingAulasPorGrado && selectedGrado && (
                                <option value="" disabled>
                                  No hay aulas disponibles para este grado
                                </option>
                              )
                            )}
                          </select>
                        </FormField>
                      </div>

                      <div className="mt-4">
                        <FormField
                          label="Motivo de Preferencia (Opcional)"
                          error={errors.motivoPreferencia?.message}
                        >
                          <textarea
                            {...register('motivoPreferencia')}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Hermano en la misma sección, cercanía al hogar, etc."
                          />
                        </FormField>
                      </div>
                    </div>
                  </Transition>

                  {/* Botones */}
                  <div className="flex items-center justify-between pt-6 border-t">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <div className="flex items-center gap-3">
                      {currentStep > 0 && (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          Atrás
                        </button>
                      )}
                      {!isLastStep ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Siguiente
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinalSubmit}
                          disabled={creating || uploadingVoucher}
                          className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {uploadingVoucher ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Subiendo voucher...
                            </>
                          ) : creating ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Matriculando estudiante...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Matricular Estudiante
                            </>
                          )}
                        </button>
                      )}
                    </div>
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

export default ModalAgregarMatricula;