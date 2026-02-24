import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import cajaService from "../../services/cajaService";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SecretaryOverview = () => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  const cargarResumen = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cajaService.obtenerResumen(mes, anio);
      if (response.success) {
        setResumen(response.resumen);
      }
    } catch (err) {
      setError(err.message || "Error al cargar el resumen");
      setResumen(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, [mes, anio]);

  return (
    <div className="space-y-6">
      <PageHeader title="Panel Principal" />

      {/* Filtro de periodo */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mes</label>
          <select
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            {MESES.map((label, index) => (
              <option key={label} value={index + 1}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
          <input
            type="number"
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        {loading && (
          <span className="text-sm text-gray-400 animate-pulse">Cargando...</span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Tarjetas de totales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Ingresos</p>
            <p className="text-lg font-bold text-green-600">S/ {formatMoney(resumen?.ingresos)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Egresos</p>
            <p className="text-lg font-bold text-red-500">S/ {formatMoney(resumen?.egresos)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3 lg:col-span-1 col-span-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Saldo Neto</p>
            <p className={`text-lg font-bold ${Number(resumen?.saldoNeto) >= 0 ? "text-blue-600" : "text-red-600"}`}>
              S/ {formatMoney(resumen?.saldoNeto)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">N° Ingresos</p>
            <p className="text-lg font-bold text-emerald-600">{resumen?.cantidadIngresos ?? "-"}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <ArrowDownCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500">N° Egresos</p>
            <p className="text-lg font-bold text-orange-500">{resumen?.cantidadEgresos ?? "-"}</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecretaryOverview;
