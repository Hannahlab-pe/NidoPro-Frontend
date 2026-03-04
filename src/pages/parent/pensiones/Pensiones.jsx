// src/pages/parent/pensiones/Pensiones.jsx
import React from 'react';
import { usePensionesPadre } from '../../../hooks/usePensionesPadre';
import PensionesTable from './tablas/PensionesTable';
import { DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../../components/common/PageHeader';

const Pensiones = () => {
  const {
    pensiones,
    apoderado,
    loading,
    error,
    refetchPensiones
  } = usePensionesPadre();

  // Función para refrescar los datos
  const handleRefresh = async () => {
    try {
      await refetchPensiones();
      toast.success('Datos actualizados correctamente');
    } catch (error) {
      toast.error('Error al actualizar los datos');
    }
  };

  // Calcular estadísticas
  const estadisticas = React.useMemo(() => {
    if (!pensiones || pensiones.length === 0) {
      return {
        total: 0,
        pagadas: 0,
        pendientes: 0,
        vencidas: 0,
        totalMonto: 0,
        totalMora: 0
      };
    }

    return pensiones.reduce((acc, pension) => {
      acc.total += 1;

      switch (pension.estadoPension) {
        case 'PAGADO':
          acc.pagadas += 1;
          break;
        case 'PENDIENTE':
          acc.pendientes += 1;
          break;
        case 'VENCIDO':
          acc.vencidas += 1;
          break;
      }

      acc.totalMonto += parseFloat(pension.montoTotal || pension.montoPension || 0);
      acc.totalMora += parseFloat(pension.montoMora || 0);

      return acc;
    }, {
      total: 0,
      pagadas: 0,
      pendientes: 0,
      vencidas: 0,
      totalMonto: 0,
      totalMora: 0
    });
  }, [pensiones]);

  // Función para formatear montos
  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(monto);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pensiones" theme="yellow" />
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error al cargar las pensiones
              </h3>
              <p className="text-gray-500 mb-4">
                {error.message || 'Ha ocurrido un error al cargar los datos de pensiones.'}
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pensiones"
        theme="yellow"
        actions={(
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        )}
      />
      <div className="max-w-7xl mx-auto space-y-6">
        <p className="text-gray-600 -mt-2">Gestiona las pensiones de tus hijos</p>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pensiones</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pagadas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.pagadas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas.vencidas}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Apoderado */}
        {apoderado && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Apoderado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre</p>
                <p className="text-sm text-gray-900">{apoderado.nombre} {apoderado.apellido}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tipo</p>
                <p className="text-sm text-gray-900">{apoderado.tipoApoderado}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Número de Hijos</p>
                <p className="text-sm text-gray-900">{apoderado.matriculas?.length || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Pensiones */}
        <PensionesTable pensiones={pensiones} loading={loading} />

        {/* Resumen Financiero */}
        {(estadisticas.totalMonto > 0 || estadisticas.totalMora > 0) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Financiero</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Monto Total de Pensiones</p>
                <p className="text-2xl font-bold text-gray-900">{formatMonto(estadisticas.totalMonto)}</p>
              </div>
              {estadisticas.totalMora > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total en Mora</p>
                  <p className="text-2xl font-bold text-red-600">{formatMonto(estadisticas.totalMora)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pensiones;