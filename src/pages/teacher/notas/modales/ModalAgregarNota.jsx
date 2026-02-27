import React, { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  User, 
  FileText, 
  Calendar, 
  BookOpen,
  AlertCircle 
} from 'lucide-react'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useAnotaciones } from '../../../../hooks/useAnotaciones'
import { useCursos } from '../../../../hooks/useCursos'
import { useTrabajadores as useTrabajadoresQuery } from 'src/hooks/queries/useTrabajadoresQueries'
import { useAulasByTrabajador, useEstudiantesByAula } from '../../../../hooks/queries/useAulasQueries'
import { getIdTrabajadorFromToken } from '../../../../utils/tokenUtils'

const ModalAgregarNota = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuthStore()
  const { createAnotacion, creating } = useAnotaciones()
  const { data: cursos, isLoading: loadingCursos } = useCursos()
  const { data: trabajadores, isLoading: loadingTrabajadores } = useTrabajadoresQuery()

  // Estado del formulario
  const [formData, setFormData] = useState({
    idTrabajador: '',
    idAula: '',
    idEstudiante: '',
    titulo: '',
    observacion: '',
    fechaObservacion: new Date().toISOString().split('T')[0],
    idCurso: '',
    estaActivo: true
  })

  const [errors, setErrors] = useState({})

  // Obtener el idTrabajador del token JWT
  const idTrabajadorFromToken = getIdTrabajadorFromToken()

  // Hook para obtener aulas asignadas al trabajador
  const {
    data: aulasData,
    isLoading: loadingAulas,
    error: errorAulas
  } = useAulasByTrabajador(idTrabajadorFromToken, {
    enabled: !!idTrabajadorFromToken
  })

  // Hook para obtener estudiantes del aula seleccionada
  const { 
    data: estudiantesData = [],
    isLoading: loadingStudents,
    error: errorStudents
  } = useEstudiantesByAula(formData.idAula, {
    enabled: !!formData.idAula
  })

  const aulasAsignadas = Array.isArray(aulasData?.aulas) ? aulasData.aulas : []

  console.log('👨‍🏫 ID Trabajador desde token:', idTrabajadorFromToken)
  console.log('🏫 Aulas asignadas:', aulasAsignadas)
  console.log('👥 Datos de estudiantes por aula:', estudiantesData)
  console.log('📚 Loading estudiantes:', loadingStudents)

  if (errorAulas) {
    console.error('❌ Error al cargar aulas:', errorAulas)
  }

  if (errorStudents) {
    console.error('❌ Error al cargar estudiantes:', errorStudents)
  }

  // Buscar el trabajador correcto basado en el usuario logueado
  useEffect(() => {
    if (idTrabajadorFromToken) {
      // Usar directamente el ID del token
      setFormData(prev => ({
        ...prev,
        idTrabajador: idTrabajadorFromToken
      }));
    } else if (user && trabajadores && trabajadores.length > 0) {
      // Fallback: buscar trabajador por email, documento o nombre
      const trabajadorEncontrado = trabajadores.find(t => 
        t.email === user.email || 
        t.nroDocumento === user.email ||
        t.usuario === user.email ||
        (t.nombres === user.nombre && t.apellidos === user.apellido)
      );
      
      if (trabajadorEncontrado) {
        setFormData(prev => ({
          ...prev,
          idTrabajador: trabajadorEncontrado.idTrabajador
        }));
      }
    }
  }, [idTrabajadorFromToken, user, trabajadores]);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        idAula: '',
        idEstudiante: '',
        titulo: '',
        observacion: '',
        fechaObservacion: new Date().toISOString().split('T')[0],
        idCurso: '',
        estaActivo: true
      }))
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (field, value) => {
    if (field === 'idAula') {
      setFormData(prev => ({
        ...prev,
        idAula: value,
        idEstudiante: ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.idAula) {
      newErrors.idAula = 'Debe seleccionar un aula'
    }

    if (!formData.idEstudiante) {
      newErrors.idEstudiante = 'Debe seleccionar un estudiante'
    }
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    }
    
    if (!formData.observacion.trim()) {
      newErrors.observacion = 'La observación es requerida'
    }
    
    if (!formData.fechaObservacion) {
      newErrors.fechaObservacion = 'La fecha es requerida'
    }
    
    if (!formData.idCurso) {
      newErrors.idCurso = 'Debe seleccionar un curso'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const { idAula, ...payload } = formData
      const result = await createAnotacion(payload)
      
      if (result.success) {
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      console.error('Error al crear anotación:', error)
    }
  }

  const handleClose = () => {
    if (!creating) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nueva Anotación
              </h2>
              <p className="text-sm text-gray-600">
                Agregar observación sobre un estudiante
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={creating}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del profesor */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Profesor</p>
                <p className="text-sm text-blue-700">
                  {user?.nombre} {user?.apellido} - {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Selección de aula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aula *
            </label>
            {loadingAulas ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-gray-500">Cargando aulas asignadas...</span>
              </div>
            ) : errorAulas ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                <span className="text-red-600">Error al cargar aulas</span>
              </div>
            ) : (
              <select
                value={formData.idAula}
                onChange={(e) => handleInputChange('idAula', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.idAula ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={creating}
              >
                <option value="">Seleccionar aula...</option>
                {aulasAsignadas.map((aula) => {
                  const idAula = aula.id_aula || aula.idAula || aula.id
                  const etiqueta = `${aula.grado || 'Grado'} - Sección ${aula.seccion || ''}`

                  return (
                    <option key={idAula} value={idAula}>
                      {etiqueta}
                    </option>
                  )
                })}
              </select>
            )}

            {aulasAsignadas.length === 0 && !loadingAulas && !errorAulas && (
              <p className="mt-1 text-xs text-amber-600">
                No tienes aulas asignadas
              </p>
            )}

            {errors.idAula && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.idAula}
              </p>
            )}
          </div>

          {/* Selección de estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estudiante *
            </label>
            {!formData.idAula ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-gray-500">Primero selecciona un aula</span>
              </div>
            ) : loadingStudents ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                <span className="text-gray-500">Cargando estudiantes del aula...</span>
              </div>
            ) : errorStudents ? (
              <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50">
                <span className="text-red-600">Error al cargar estudiantes</span>
              </div>
            ) : (
              <select
                value={formData.idEstudiante}
                onChange={(e) => handleInputChange('idEstudiante', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.idEstudiante ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={creating || !formData.idAula}
              >
                <option value="">Seleccionar estudiante...</option>
                {estudiantesData?.map((student) => (
                  <option key={student.idEstudiante} value={student.idEstudiante}>
                    {student.nombre} {student.apellido}
                    {student.infoApoderado?.aula?.seccion && ` - Sección ${student.infoApoderado.aula.seccion}`}
                  </option>
                ))}
              </select>
            )}
            
            {/* Información adicional */}
            {Array.isArray(estudiantesData) && estudiantesData.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {estudiantesData.length} estudiante(s) en el aula seleccionada
              </p>
            )}
            
            {/* Mensaje si no hay estudiantes */}
            {formData.idAula && Array.isArray(estudiantesData) && estudiantesData.length === 0 && !loadingStudents && (
              <p className="mt-1 text-xs text-amber-600">
                No hay estudiantes asignados en el aula seleccionada
              </p>
            )}
            
            {errors.idEstudiante && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.idEstudiante}
              </p>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ej: Excelente participación en clase"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={creating}
              maxLength={200}
            />
            {errors.titulo && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.titulo}
              </p>
            )}
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observación *
            </label>
            <textarea
              value={formData.observacion}
              onChange={(e) => handleInputChange('observacion', e.target.value)}
              placeholder="Descripción detallada de la observación..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.observacion ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={creating}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.observacion ? (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.observacion}
                </p>
              ) : (
                <div></div>
              )}
              <p className="text-xs text-gray-500">
                {formData.observacion.length}/1000
              </p>
            </div>
          </div>

          {/* Fecha y Curso en grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Observación *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={formData.fechaObservacion}
                  onChange={(e) => handleInputChange('fechaObservacion', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fechaObservacion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={creating}
                />
              </div>
              {errors.fechaObservacion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.fechaObservacion}
                </p>
              )}
            </div>

            {/* Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Curso *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={formData.idCurso}
                  onChange={(e) => handleInputChange('idCurso', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.idCurso ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={creating || loadingCursos}
                >
                  <option value="">Seleccionar curso...</option>
                  {cursos?.map((curso) => (
                    <option key={curso.idCurso} value={curso.idCurso}>
                      {curso.nombreCurso}
                    </option>
                  ))}
                </select>
              </div>
              {errors.idCurso && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.idCurso}
                </p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
            >
              {creating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Anotación</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalAgregarNota
