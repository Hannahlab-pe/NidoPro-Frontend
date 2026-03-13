import React from "react";
import { FileText, Brain, PlusCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";

const SpecialistInformes = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Informes" />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Informes Psicopedagógicos</h2>
              <p className="text-sm text-gray-500">Gestión de reportes e informes de seguimiento</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors">
            <PlusCircle className="w-4 h-4" />
            Nuevo Informe
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-gray-700 font-semibold mb-1">Módulo en construcción</h3>
          <p className="text-sm text-gray-400 max-w-xs">
            Próximamente podrás crear, editar y descargar informes psicopedagógicos completos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpecialistInformes;
