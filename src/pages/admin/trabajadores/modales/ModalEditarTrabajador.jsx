import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'sonner';
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
  Briefcase,
  Plus,
  Trash2,
  Shield
} from 'lucide-react';
import ImageUploader from '../../../../components/common/ImageUploader';
import { useTrabajadores, useUpdateTrabajador } from 'src/hooks/queries/useTrabajadoresQueries';
import { useRoles } from '../../../../hooks/useRoles';
import trabajadorService from '../../../../services/trabajadorService';

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

  // Roles: se acumulan cambios localmente y se aplican al guardar
  const [trabajadorRoles, setTrabajadorRoles] = useState([]); // roles actuales del servidor
  const [rolesToAdd, setRolesToAdd] = useState([]);            // ids de roles pendientes de agregar
  const [rolesToRemove, setRolesToRemove] = useState([]);      // ids de roles pendientes de quitar
  const [loadingTrabajadorRoles, setLoadingTrabajadorRoles] = useState(false);
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  // Roles visibles = (originales - quitados) + agregados
  const visibleRoles = [
    ...trabajadorRoles.filter(r => !rolesToRemove.includes(r.idRol)),
    ...rolesToAdd.map(idRol => {
      const found = (roles || []).find(r => r.idRol === idRol);
      return found || { idRol, nombre: '...' };
    }),
  ];

  useEffect(() => {
    if (isOpen && trabajador?.idTrabajador) {
      setLoadingTrabajadorRoles(true);
      setRolesToAdd([]);
      setRolesToRemove([]);
      setShowRoleSelect(false);

      // Usar roles del listado si están disponibles
      if (trabajador.roles && trabajador.roles.length > 0) {
        setTrabajadorRoles(trabajador.roles);
        setLoadingTrabajadorRoles(false);
      } else {
        trabajadorService.getTrabajadorRoles(trabajador.idTrabajador)
          .then(data => {
            setTrabajadorRoles(data.roles || []);
          })
          .catch(() => {
            if (trabajador.idRol) {
              const rolData = typeof trabajador.idRol === 'object'
                ? trabajador.idRol
                : { idRol: trabajador.idRol, nombre: 'Rol actual' };
              setTrabajadorRoles([rolData]);
            }
          })
          .finally(() => setLoadingTrabajadorRoles(false));
      }
    }
  }, [isOpen, trabajador]);

  const availableRoles = (roles || []).filter(
    r => !visibleRoles.some(vr => vr.idRol === r.idRol)
  );

  const handleAddRoleLocal = (idRol) => {
    // Si estaba en la lista de quitar, simplemente lo sacamos de ahí
    if (rolesToRemove.includes(idRol)) {
      setRolesToRemove(prev => prev.filter(id => id !== idRol));
    } else {
      setRolesToAdd(prev => [...prev, idRol]);
    }
    setShowRoleSelect(false);
  };

  const handleRemoveRoleLocal = (idRol) => {
    // Si estaba en la lista de agregar, simplemente lo sacamos de ahí
    if (rolesToAdd.includes(idRol)) {
      setRolesToAdd(prev => prev.filter(id => id !== idRol));
    } else {
      setRolesToRemove(prev => [...prev, idRol]);
    }
  };

  const hasRoleChanges = rolesToAdd.length > 0 || rolesToRemove.length > 0;

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
    try {
      // Excluir campos inmutables de los datos a enviar
      const { idRol, tipoDocumento, nroDocumento, ...dataToUpdate } = data;

      // PASO 1: Actualizar datos personales
      await updateTrabajadorMutation.mutateAsync({
        id: trabajador.idTrabajador,
        data: dataToUpdate
      });

      // PASO 2: Aplicar cambios de roles pendientes
      for (const idRolToAdd of rolesToAdd) {
        await trabajadorService.addRoleToTrabajador(trabajador.idTrabajador, idRolToAdd);
      }
      for (const idRolToRemove of rolesToRemove) {
        await trabajadorService.removeRoleFromTrabajador(trabajador.idTrabajador, idRolToRemove);
      }

      if (hasRoleChanges) {
        toast.success("Roles actualizados correctamente");
      }

      handleClose();
    } catch (error) {
      console.error('❌ Error al actualizar trabajador:', error);
    }
  };

  const handleClose = () => {
    reset();
    setRolesToAdd([]);
    setRolesToRemove([]);
    setShowRoleSelect(false);
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

                  {/* Sección de Roles */}
                  <FormSection title="Roles del Trabajador" icon={Shield} iconColor="text-purple-600">
                    {loadingTrabajadorRoles ? (
                      <div className="flex items-center py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                        <span className="text-sm text-gray-500">Cargando roles...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {visibleRoles.map((rol) => {
                            const isPending = rolesToAdd.includes(rol.idRol);
                            return (
                              <div
                                key={rol.idRol}
                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                  isPending
                                    ? 'bg-green-50 border-green-300 border-dashed'
                                    : 'bg-purple-50 border-purple-200'
                                }`}
                              >
                                <Shield className={`w-4 h-4 ${isPending ? 'text-green-600' : 'text-purple-600'}`} />
                                <span className={`text-sm font-medium ${isPending ? 'text-green-800' : 'text-purple-800'}`}>
                                  {rol.nombre}
                                </span>
                                {isPending && (
                                  <span className="text-xs text-green-600">(nuevo)</span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRoleLocal(rol.idRol)}
                                  disabled={visibleRoles.length <= 1}
                                  className="ml-1 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  title={visibleRoles.length <= 1 ? "No se puede quitar el único rol" : "Quitar rol"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {availableRoles.length > 0 && (
                          <div>
                            {showRoleSelect ? (
                              <div className="flex items-center gap-2">
                                <select
                                  onChange={(e) => { if (e.target.value) handleAddRoleLocal(e.target.value); }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Seleccionar rol...</option>
                                  {availableRoles.map((rol) => (
                                    <option key={rol.idRol} value={rol.idRol}>
                                      {rol.nombre}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowRoleSelect(false)}
                                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowRoleSelect(true)}
                                className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium"
                              >
                                <Plus className="w-4 h-4" />
                                Agregar rol
                              </button>
                            )}
                          </div>
                        )}

                        {hasRoleChanges && (
                          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-md">
                            Los cambios de roles se aplicarán al guardar
                          </p>
                        )}
                      </div>
                    )}
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