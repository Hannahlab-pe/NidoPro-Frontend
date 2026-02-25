import React, { useEffect } from 'react';
import {
  Users,
  GraduationCap,
  School
} from 'lucide-react';
import { useMisEstudiantes } from '../../../hooks/useMisEstudiantes';
import TablaMisEstudiantes from './tablas/TablaMisEstudiantes';
import PageHeader from '../../../components/common/PageHeader';

const MisEstudiantes = () => {
  // Hook personalizado para gestión de estudiantes del docente
  const {
    estudiantes,
    aulas,
    loading,
    error,
    statistics,
    refreshEstudiantes
  } = useMisEstudiantes();

  // Estados locales solo para UI
  // (Los modales ahora están integrados en la tabla)

  // --- Console.log para depuración ---
  console.log('--- Renderizando Componente MisEstudiantes ---');
  console.log('Estado de carga (loading):', loading);
  console.log('Estudiantes obtenidos:', estudiantes);
  console.log('Aulas asignadas:', aulas);
  console.log('Estadísticas calculadas:', statistics);

  if (error) {
    console.error('Error en useMisEstudiantes:', error);
  }

  // useEffect para ver los cambios en los datos
  useEffect(() => {
    console.log('El hook useMisEstudiantes ha actualizado sus datos.');
    console.log('Estudiantes actuales:', estudiantes);
    console.log('Estadísticas actuales:', statistics);
  }, [estudiantes, statistics]);

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Estudiantes" theme="green" />
      {/* Stats Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Estudiantes</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <School className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Aulas Asignadas</p>
                <p className="text-2xl font-bold text-green-900">{statistics.aulasAsignadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Estudiantes por Aula</p>
                <p className="text-2xl font-bold text-purple-900">
                  {statistics.aulasAsignadas > 0 ? Math.round(statistics.total / statistics.aulasAsignadas) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Componente de Tabla de Estudiantes */}
      <TablaMisEstudiantes
        estudiantes={estudiantes}
        loading={loading}
      />
    </div>
  );
};

export default MisEstudiantes;
