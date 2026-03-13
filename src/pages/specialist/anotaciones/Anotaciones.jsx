import React from "react";
import { StickyNote, Brain } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";

const SpecialistAnotaciones = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Anotaciones" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
            <StickyNote className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Anotaciones</h2>
            <p className="text-sm text-gray-500">Registro de observaciones y notas por estudiante</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">Módulo en construcción</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Aquí podrás registrar y consultar anotaciones específicas para cada estudiante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialistAnotaciones;
