import React, { useState, useEffect } from 'react';
import { Shield, Plus, DollarSign, Percent, CheckCircle, XCircle } from 'lucide-react';
import CrearTipoSeguroModal from './modales/CrearTipoSeguroModal';
import { toast } from 'sonner';

const Seguros = () => {
  const [modalCrearTipoSeguro, setModalCrearTipoSeguro] = useState(false);
  const [seguros, setSeguros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener tipos de seguro al cargar el componente
  useEffect(() => {
    fetchSeguros();
  }, []);

  const fetchSeguros = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('auth-storage'))?.state?.token;

      const response = await fetch(`${API_BASE_URL}/tipo-seguro`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener tipos de seguro');
      }

      const result = await response.json();

      if (result.success && result.tiposSeguro) {
        setSeguros(result.tiposSeguro);
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (error) {
      console.error('Error fetching seguros:', error);
      toast.error('Error al cargar los tipos de seguro');
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTipoSeguro = () => {
    setModalCrearTipoSeguro(true);
  };

  const handleTipoSeguroCreado = () => {
    fetchSeguros(); // Recargar la lista de seguros
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Seguros</h1>
              <p className="text-gray-600">Administra los tipos de seguro disponibles en el sistema</p>
            </div>
          </div>

          {/* Botón Crear Tipo de Seguro */}
          <button
            onClick={handleCrearTipoSeguro}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Crear Tipo de Seguro</span>
          </button>
        </div>
      </div>

      {/* Lista de Seguros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Tipos de Seguro Registrados</h2>
          <p className="text-sm text-gray-600 mt-1">Lista de todos los tipos de seguro configurados</p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Cargando seguros...</span>
            </div>
          ) : seguros.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de seguro registrados</h3>
              <p className="text-gray-600 mb-4">Comienza creando tu primer tipo de seguro</p>
              <button
                onClick={handleCrearTipoSeguro}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Tipo de Seguro
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seguros.map((seguro) => (
                <div key={seguro.idTipoSeguro || seguro.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{seguro.nombreSeguro}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {seguro.estaActivo ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactivo
                            </span>
                          )}
                          {seguro.esObligatorio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Obligatorio
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{seguro.descripcion}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tipo de Cálculo:</span>
                      <span className="font-medium text-gray-900">{seguro.tipoCalculo}</span>
                    </div>

                    {seguro.tipoCalculo === 'PORCENTAJE' ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Porcentaje:</span>
                        <div className="flex items-center space-x-1">
                          <Percent className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">{seguro.porcentajeDescuento}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Monto Fijo:</span>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-600">S/ {seguro.montoFijo}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    {/* Funcionalidades próximamente disponibles */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {modalCrearTipoSeguro && (
        <CrearTipoSeguroModal
          isOpen={modalCrearTipoSeguro}
          onClose={() => setModalCrearTipoSeguro(false)}
          onTipoSeguroCreado={handleTipoSeguroCreado}
        />
      )}
    </div>
  );
};

export default Seguros;