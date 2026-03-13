import React from "react";
import { Users, Search, Brain } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";

const SpecialistEstudiantes = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Mis Estudiantes" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Estudiantes Asignados</h2>
            <p className="text-sm text-gray-500">Listado de estudiantes bajo seguimiento psicopedagógico</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">Módulo en construcción</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Próximamente podrás ver y gestionar todos los estudiantes asignados para seguimiento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialistEstudiantes;
