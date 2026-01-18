// src/hooks/useStudents.js
import { useState, useCallback, useMemo } from 'react'; // <-- Agrega useMemo
import {
  useEstudiantes,
  useCreateEstudiante,
  useUpdateEstudiante,
  useDeleteEstudiante,
  useToggleEstudianteStatus
} from './queries/useEstudiantesQueries';

/**
 * Hook personalizado para gestionar estudiantes usando TanStack Query
 * Proporciona todas las funcionalidades CRUD, gestión de estado y estadísticas
 */
export const useStudents = () => {
  // Estado para filtros y búsqueda
  const [filters, setFilters] = useState({
    grade: '',
    status: '',
    search: ''
  });

  // TanStack Query hooks - Cargar todos los estudiantes por defecto
  const { data: students = [], isLoading: loading, refetch: fetchStudents } = useEstudiantes({});
  const createMutation = useCreateEstudiante();
  const updateMutation = useUpdateEstudiante();
  const deleteMutation = useDeleteEstudiante();
  const toggleStatusMutation = useToggleEstudianteStatus();

  // Estados de operaciones
  const creating = createMutation.isPending;
  const updating = updateMutation.isPending;
  const deleting = deleteMutation.isPending;
  const uploading = creating || updating; // Se maneja internamente en las mutaciones

  // --- Sección de Estadísticas ---
  /**
   * Calcular y memorizar estadísticas de los estudiantes
   */
  const statistics = useMemo(() => {
    if (!students || students.length === 0) {
      return {
        total: 0,
        active: 0,
        inactive: 0,
        byGrade: {},
        recentEnrollments: 0
      };
    }

    const total = students.length;
    const active = students.filter(s => s.idUsuario?.estaActivo === true).length;
    const inactive = students.filter(s => s.idUsuario?.estaActivo === false || s.idUsuario?.estaActivo === null || s.idUsuario?.estaActivo === undefined).length;

    // Agrupar por grado
    const byGrade = students.reduce((acc, student) => {
      // Asume que el objeto estudiante tiene un campo idGrado.grado o similar
      const grade = student.idGrado?.grado || student.grado || 'Sin grado';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});
    
    // Matrículas recientes (último mes)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const recentEnrollments = students.filter(s => 
      new Date(s.fechaIngreso) > oneMonthAgo
    ).length;

    return {
      total,
      active,
      inactive,
      byGrade,
      recentEnrollments,
    };
  }, [students]);
  // --- Fin de la Sección de Estadísticas ---

  /**
   * Crear un nuevo estudiante
   */
  const createStudent = useCallback(async (studentData) => {
    return createMutation.mutateAsync(studentData);
  }, [createMutation]);

  /**
   * Actualizar un estudiante existente
   */
  const updateStudent = useCallback(async (id, studentData) => {
    console.log('🔧 useStudents updateStudent - ID recibido:', id);
    console.log('🔧 useStudents updateStudent - Datos recibidos:', studentData);
    
    if (!id) {
      console.error('❌ useStudents: ID del estudiante es undefined o null');
      throw new Error('ID del estudiante es requerido para actualizar');
    }
    
    return updateMutation.mutateAsync({ id, ...studentData });
  }, [updateMutation]);

  /**
   * Eliminar un estudiante
   */
  const deleteStudent = useCallback(async (id) => {
    return deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  /**
   * Cambiar estado de un estudiante
   */
  const changeStudentStatus = useCallback(async (id) => {
    return toggleStatusMutation.mutateAsync(id);
  }, [toggleStatusMutation]);

  /**
   * Buscar estudiantes (actualizar filtros)
   */
  const searchStudents = useCallback(async (query) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);

  /**
   * Filtrar estudiantes por grado
   */
  const filterByGrade = useCallback(async (grade) => {
    setFilters(prev => ({ ...prev, grade }));
  }, []);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Resetear filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      grade: '',
      status: '',
      search: ''
    });
  }, []);

  /**
   * Refrescar lista de estudiantes
   */
  const refreshStudents = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  /**
   * Obtener un estudiante por ID (se puede implementar con useEstudiante)
   */
  const getStudentById = useCallback(async (id) => {
    const student = students.find(s => s.id === id || s.idEstudiante === id);
    return student;
  }, [students]);

  // Objeto de retorno del hook
  return {
    // Estados
    students,
    loading,
    creating,
    updating,
    deleting,
    uploading,
    filters,
    statistics, // <-- Agregas esto aquí

    // Funciones CRUD
    createStudent,
    updateStudent,
    deleteStudent,
    changeStudentStatus,
    
    // Funciones de búsqueda y filtrado
    searchStudents,
    filterByGrade,
    updateFilters,
    resetFilters,
    
    // Funciones de utilidad
    fetchStudents,
    refreshStudents,
    getStudentById,

    // Funciones derivadas
    getActiveStudents: () => students.filter(s => s.idUsuario?.estaActivo === true),
    getInactiveStudents: () => students.filter(s => s.idUsuario?.estaActivo === false),
    getStudentsByGrade: (grade) => students.filter(s => s.grado === grade),
    getTotalStudents: () => students.length,
    
    // Estados computados
    hasStudents: students.length > 0,
    isOperating: creating || updating || deleting || uploading,
    isCached: true, // TanStack Query maneja el cache automáticamente
  };
};

export default useStudents;
