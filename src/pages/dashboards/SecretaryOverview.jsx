import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import cajaService from "../../services/cajaService";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatearFecha = (fechaStr) => {
  if (!fechaStr) return "";
  if (typeof fechaStr === "string" && fechaStr.includes("/")) return fechaStr;
  
  const partes = fechaStr.split("T")[0].split("-");
  if (partes.length === 3) {
    const [year, month, day] = partes;
    return `${day}/${month}/${year}`;
  }
  return fechaStr;
};

const SecretaryOverview = () => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [loading, setLoading] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState(null);

  // Estados para ingresos paginados
  const [ingresos, setIngresos] = useState([]);
  const [ingresosPage, setIngresosPage] = useState(1);
  const [ingresosTotalPages, setIngresosTotalPages] = useState(1);
  const [loadingIngresos, setLoadingIngresos] = useState(false);

  // Estados para egresos paginados
  const [egresos, setEgresos] = useState([]);
  const [egresosPage, setEgresosPage] = useState(1);
  const [egresosTotalPages, setEgresosTotalPages] = useState(1);
  const [loadingEgresos, setLoadingEgresos] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
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
    cargarDatos();
    setIngresosPage(1);
    setEgresosPage(1);
  }, [mes, anio]);

  useEffect(() => {
    const cargarIngresos = async () => {
      try {
        setLoadingIngresos(true);
        const response = await cajaService.obtenerIngresosPaginados({
          page: ingresosPage,
          limit: 10,
          mes,
          anio,
        });
        if (response.success) {
          setIngresos(response.data);
          setIngresosTotalPages(response.totalPages);
        }
      } catch (err) {
        console.error("Error al cargar ingresos:", err);
      } finally {
        setLoadingIngresos(false);
      }
    };
    cargarIngresos();
  }, [ingresosPage, mes, anio]);

  useEffect(() => {
    const cargarEgresos = async () => {
      try {
        setLoadingEgresos(true);
        const response = await cajaService.obtenerEgresosPaginados({
          page: egresosPage,
          limit: 10,
          mes,
          anio,
        });
        if (response.success) {
          setEgresos(response.data);
          setEgresosTotalPages(response.totalPages);
        }
      } catch (err) {
        console.error("Error al cargar egresos:", err);
      } finally {
        setLoadingEgresos(false);
      }
    };
    cargarEgresos();
  }, [egresosPage, mes, anio]);

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

      {/* Tablas de Ingresos y Egresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de Ingresos */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Últimos Ingresos</h3>
            </div>
            <span className="text-xs text-gray-500">
              {ingresos.length > 0 ? `${ingresos.length} registros` : "Sin registros"}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loadingIngresos ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : ingresos.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay ingresos registrados</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Concepto</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-600">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ingresos.map((ingreso) => (
                    <tr key={ingreso.idMovimiento} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {formatearFecha(ingreso.fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{ingreso.concepto}</div>
                        {ingreso.estudiante && (
                          <div className="text-xs text-gray-500">
                            {ingreso.estudiante.persona?.nombre} {ingreso.estudiante.persona?.apellido}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">
                        S/ {formatMoney(ingreso.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Paginación Ingresos */}
          {ingresosTotalPages > 1 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setIngresosPage((p) => Math.max(1, p - 1))}
                disabled={ingresosPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600">
                Página {ingresosPage} de {ingresosTotalPages}
              </span>
              <button
                onClick={() => setIngresosPage((p) => Math.min(ingresosTotalPages, p + 1))}
                disabled={ingresosPage === ingresosTotalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tabla de Egresos */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">Últimos Egresos</h3>
            </div>
            <span className="text-xs text-gray-500">
              {egresos.length > 0 ? `${egresos.length} registros` : "Sin registros"}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loadingEgresos ? (
              <div className="p-8 text-center text-gray-400">Cargando...</div>
            ) : egresos.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay egresos registrados</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-600">Concepto</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-gray-600">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {egresos.map((egreso) => (
                    <tr key={egreso.idMovimiento} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {formatearFecha(egreso.fecha)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-900">{egreso.concepto}</div>
                        {egreso.estudiante && (
                          <div className="text-xs text-gray-500">
                            {egreso.estudiante.persona?.nombre} {egreso.estudiante.persona?.apellido}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-red-500">
                        S/ {formatMoney(egreso.monto)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Paginación Egresos */}
          {egresosTotalPages > 1 && (
            <div className="p-3 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setEgresosPage((p) => Math.max(1, p - 1))}
                disabled={egresosPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600">
                Página {egresosPage} de {egresosTotalPages}
              </span>
              <button
                onClick={() => setEgresosPage((p) => Math.min(egresosTotalPages, p + 1))}
                disabled={egresosPage === egresosTotalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default SecretaryOverview;
