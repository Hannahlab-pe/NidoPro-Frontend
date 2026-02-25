import React from 'react';
import PageHeader from '../../../components/common/PageHeader';

const Clases = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Mis Clases" theme="green" />
      
      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <h3 className="text-3xl font-bold text-blue-600 mb-2">4</h3>
            <p className="text-gray-600 text-sm">Clases Activas</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <h3 className="text-3xl font-bold text-green-600 mb-2">85</h3>
            <p className="text-gray-600 text-sm">Total Estudiantes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <h3 className="text-3xl font-bold text-orange-600 mb-2">12</h3>
            <p className="text-gray-600 text-sm">Tareas Pendientes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
            <h3 className="text-3xl font-bold text-purple-600 mb-2">3</h3>
            <p className="text-gray-600 text-sm">Exámenes Esta Semana</p>
          </div>
        </div>
        
        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Matemáticas 5A</h3>
            <p className="text-gray-600 mb-4">22 estudiantes</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Ver Estudiantes
              </button>
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Calificaciones
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Matemáticas 5B</h3>
            <p className="text-gray-600 mb-4">20 estudiantes</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Ver Estudiantes
              </button>
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Calificaciones
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Matemáticas 6A</h3>
            <p className="text-gray-600 mb-4">21 estudiantes</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Ver Estudiantes
              </button>
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Calificaciones
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Matemáticas 6B</h3>
            <p className="text-gray-600 mb-4">22 estudiantes</p>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Ver Estudiantes
              </button>
              <button className="px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 hover:border-gray-300 transition-colors">
                Calificaciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clases;
