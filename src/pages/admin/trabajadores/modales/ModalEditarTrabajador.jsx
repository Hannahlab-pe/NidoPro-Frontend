import React, { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  Save,
  Edit3,
  Loader2,
  Star,
  Briefcase
} from 'lucide-react';
import ImageUploader from '../../../../components/common/ImageUploader';
import { useTrabajadores, useUpdateTrabajador } from 'src/hooks/queries/useTrabajadoresQueries';
import { useRoles } from '../../../../hooks/useRoles';

// Esquema de validación con Yup (solo campos reales del backend)
const validationSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido').trim(),
  apellido: yup.string().required('El apellido es requerido').trim(),
  correo: yup.string()
    .email('El email no es válido')
    .required('El email es requerido'),
  telefono: yup.string().required('El teléfono es requerido').trim(),
  direccion: yup.string().required('La dirección es requerida').trim()
  // tipoDocumento, nroDocumento e idRol se excluyen porque no se pueden editar una vez creado el trabajador
});

// Componente FormField reutilizable
const FormField = ({ label, error, required, children, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Componente FormSection reutilizable
const FormSection = ({ title, icon: Icon, iconColor, children }) => (
  <div>
    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      {title}
    </h3>
    {children}
  </div>
);

const subjects = ['Matemáticas', 'Comunicación', 'Ciencias Naturales', 'Ciencias Sociales'];
const schedules = ['Mañana', 'Tarde', 'Completo'];
const tiposDocumento = ['DNI', 'Carnet de Extranjería', 'Pasaporte'];

const ModalEditarTrabajador = ({ isOpen, onClose, trabajador }) => {
  // Hook personalizado para gestión de trabajadores
  const { uploading } = useTrabajadores();
  
  // Hook para actualizar trabajador
  const updateTrabajadorMutation = useUpdateTrabajador();
  
  // Hook para obtener los roles disponibles
  const { roles, isLoading: loadingRoles } = useRoles();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      correo: '',
      telefono: '',
      direccion: '',
      tipoDocumento: 'DNI',
      nroDocumento: '',
      idRol: ''
    }
  });

  const photoValue = watch('foto');

  // Cargar datos del trabajador cuando se abre el modal
  useEffect(() => {
    if (trabajador && isOpen) {
      console.log('📝 Cargando datos del trabajador para editar:', trabajador);
      
      // Resetear y cargar solo los datos que existen en el backend
      reset({
        nombre: trabajador.nombre || '',
        apellido: trabajador.apellido || '',
        correo: trabajador.correo || '',
        telefono: trabajador.telefono || trabajador.numero || '',
        direccion: trabajador.direccion || '',
        tipoDocumento: trabajador.tipoDocumento || 'DNI',
        nroDocumento: trabajador.nroDocumento || '',
        idRol: trabajador.idRol || ''
      });
    }
  }, [trabajador, isOpen, reset]);

  const onSubmit = async (data) => {
    console.log('📋 Form submission - data:', data);
    
    try {
      // Excluir campos inmutables de los datos a enviar (no se pueden editar)
      const { idRol, tipoDocumento, nroDocumento, ...dataToUpdate } = data;
      console.log('📋 Datos a actualizar (sin campos inmutables):', dataToUpdate);
      console.log('📋 Campos excluidos:', { idRol, tipoDocumento, nroDocumento });
      
      // Usar la mutación para actualizar el trabajador
      await updateTrabajadorMutation.mutateAsync({ 
        id: trabajador.idTrabajador, 
        data: dataToUpdate 
      });
      
      // Cerrar modal después del éxito
      handleClose();
    } catch (error) {
      console.error('❌ Error al actualizar trabajador:', error);
      // El error ya está siendo manejado por el hook con toast
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inputClassName = (fieldError) => 
    `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      fieldError ? 'border-red-500' : 'border-gray-300'
    }`;

  // Estado de carga general
  const isLoading = updateTrabajadorMutation.isLoading || uploading;

  if (!trabajador) return null;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 bg-blue-50">
                  <div className="flex items-center gap-3">
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Edit3 className="w-6 h-6 text-blue-600" />
                        Editar Trabajador
                      </Dialog.Title>
                      <p className="text-blue-600 font-medium">{`${trabajador.nombre} ${trabajador.apellido}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Información Personal */}
                  <FormSection title="Información Personal" icon={User} iconColor="text-blue-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField label="Nombre" required error={errors.nombre?.message}>
                        <input
                          {...register('nombre')}
                          className={inputClassName(errors.nombre)}
                          placeholder="Ej: María Elena"
                          disabled={isLoading}
                        />
                      </FormField>

                      <FormField label="Apellido" required error={errors.apellido?.message}>
                        <input
                          {...register('apellido')}
                          className={inputClassName(errors.apellido)}
                          placeholder="Ej: Vásquez García"
                          disabled={isLoading}
                        />
                      </FormField>

                      <FormField label="Tipo de Documento" required error={errors.tipoDocumento?.message}>
                        <select
                          {...register('tipoDocumento')}
                          className={`${inputClassName(errors.tipoDocumento)} bg-gray-100 cursor-not-allowed`}
                          disabled={true}
                        >
                          {tiposDocumento.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          ℹ️ El tipo de documento no se puede modificar una vez creado el trabajador
                        </p>
                      </FormField>

                      <FormField label="Número de Documento" required error={errors.nroDocumento?.message}>
                        <input
                          {...register('nroDocumento')}
                          className={`${inputClassName(errors.nroDocumento)} bg-gray-100 cursor-not-allowed`}
                          placeholder="Ej: 12345678"
                          disabled={true}
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          ℹ️ El número de documento no se puede modificar (es único e inmutable)
                        </p>
                      </FormField>

                      <FormField label="Email" required error={errors.correo?.message}>
                        <input
                          type="email"
                          {...register('correo')}
                          className={inputClassName(errors.correo)}
                          placeholder="Ej: maria.vasquez@colegio.edu"
                          disabled={isLoading}
                        />
                      </FormField>

                      <FormField label="Teléfono" required error={errors.telefono?.message}>
                        <input
                          type="tel"
                          {...register('telefono')}
                          className={inputClassName(errors.telefono)}
                          placeholder="Ej: +51 987 123 456"
                          disabled={isLoading}
                        />
                      </FormField>

                      <FormField label="Dirección" required error={errors.direccion?.message} className="md:col-span-2">
                        <input
                          {...register('direccion')}
                          className={inputClassName(errors.direccion)}
                          placeholder="Ej: Jr. San Isidro 2403, Lima"
                          disabled={isLoading}
                        />
                      </FormField>
                    </div>
                  </FormSection>

                  {/* Sección de Rol */}
                  <FormSection title="Información del Rol" icon={Briefcase} iconColor="text-purple-600">
                    <div className="grid grid-cols-1 gap-4">
                      <FormField label="Rol" required error={errors.idRol?.message}>
                        <select
                          {...register('idRol')}
                          className={`${inputClassName(errors.idRol)} bg-gray-100 cursor-not-allowed`}
                          disabled={true}
                        >
                          <option value="">
                            {loadingRoles ? 'Cargando roles...' : 'Seleccione un rol'}
                          </option>
                          {Array.isArray(roles) && roles
                            .filter(rol => rol.nombre?.toLowerCase() !== 'secretaria' && rol.nombre?.toLowerCase() !== 'estudiante')
                            .map((rol) => (
                              <option key={rol.idRol} value={rol.idRol}>
                                {rol.nombre}
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          ℹ️ El rol no se puede modificar una vez creado el trabajador
                        </p>
                      </FormField>
                    </div>
                  </FormSection>
                </form>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {uploading ? 'Subiendo...' : 'Guardando...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                      </>
                    )}
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

export default ModalEditarTrabajador;