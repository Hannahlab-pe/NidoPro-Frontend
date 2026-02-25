import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusCircle, X, Wallet } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../../components/common/PageHeader";
import cajaService from "../../../services/cajaService";
import { DataTable } from "../../../components/common/DataTable";

const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const METODOS_PAGO = [
  "EFECTIVO",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
  "TARJETA",
  "DEPÓSITO",
];

const CATEGORIAS = {
  INGRESO: [
    "PENSION_MENSUAL",
    "MATRICULA",
    "INGRESO_ADICIONAL",
    "MATERIAL_EDUCATIVO",
    "VENTA_UTILES",
    "ACTIVIDADES",
    "DONACIONES",
    "OTROS_INGRESOS",
  ],
  EGRESO: [
    "PAGO_PLANILLA",
    "SUELDO_DOCENTE",
    "GASTOS_OPERATIVOS",
    "GASTOS_ADMINISTRATIVOS",
    "INFRAESTRUCTURA",
    "SERVICIOS",
    "MANTENIMIENTO",
    "UTILES",
    "OTROS_GASTOS",
  ],
};

const getUserId = () => {
  try {
    const authData = localStorage.getItem("auth-storage");
    if (authData) {
      const parsedAuth = JSON.parse(authData);
      return (
        parsedAuth.state?.user?.entidadId ||
        parsedAuth.state?.user?.idTrabajador ||
        parsedAuth.state?.user?.id
      );
    }
    return null;
  } catch (error) {
    return null;
  }
};

const Caja = () => {
  const hoy = new Date();
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [filtroTipo, setFiltroTipo] = useState(""); // "" = Todos, "INGRESO", "EGRESO"
  const [loading, setLoading] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [usarFiltroMes, setUsarFiltroMes] = useState(false);
  const lastQueryRef = useRef("");

  const [formData, setFormData] = useState({
    tipo: "INGRESO",
    concepto: "",
    descripcion: "",
    monto: "",
    categoria: "",
    metodoPago: "EFECTIVO",
  });

  const loadMovimientos = async (useMesFiltro = usarFiltroMes, force = false) => {
    try {
      const filtros = useMesFiltro && mes ? { mes, anio } : { anio };
      const queryKey = JSON.stringify(filtros);
      if (!force && lastQueryRef.current === queryKey) return;
      lastQueryRef.current = queryKey;

      setLoading(true);
      const response = await cajaService.obtenerMovimientos(filtros);
      if (response.success) {
        setMovimientos(response.movimientos || []);
      }
    } catch (error) {
      toast.error("Error al cargar caja simple");
      setMovimientos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mes) {
      setUsarFiltroMes(true);
      loadMovimientos(true);
    } else {
      setUsarFiltroMes(false);
      loadMovimientos(false);
    }
  }, [mes, anio]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const registradoPor = getUserId();
    if (!registradoPor) {
      toast.error("No se pudo identificar al usuario actual");
      return;
    }

    if (!formData.concepto || !formData.monto || !formData.categoria) {
      toast.error("Completa concepto, categoría y monto");
      return;
    }

    try {
      await cajaService.crearMovimiento({
        ...formData,
        monto: Number(formData.monto),
        registradoPor,
      });
      toast.success("Movimiento registrado");
      setFormData({
        tipo: "INGRESO",
        concepto: "",
        descripcion: "",
        monto: "",
        categoria: "",
        metodoPago: "EFECTIVO",
      });
      await loadMovimientos(usarFiltroMes, true);
      setShowModal(false);
    } catch (error) {
      toast.error(error.message || "Error al registrar movimiento");
    }
  };

  const tableRows = useMemo(() => {
    let filtered = movimientos || [];
    
    // Filtrar por tipo si se seleccionó uno
    if (filtroTipo) {
      filtered = filtered.filter(mov => mov.tipo === filtroTipo);
    }
    
    return filtered;
  }, [movimientos, filtroTipo]);

  const columns = useMemo(
    () => [
      {
        Header: "Fecha",
        accessor: "fecha",
        sortable: true,
        Cell: ({ value, row }) => (
          <div>
            <div className="font-medium text-gray-900">
              {formatFecha(value || row?.creado || row?.createdAt)}
            </div>
            <div className="text-xs text-gray-500">{row?.hora || ""}</div>
          </div>
        ),
      },
      {
        Header: "Tipo",
        accessor: "tipo",
        sortable: true,
        Cell: ({ value }) => (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              value === "INGRESO"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value === "INGRESO" ? "Ingreso" : "Egreso"}
          </span>
        ),
      },
      {
        Header: "Estudiante",
        accessor: "estudiante",
        sortable: false,
        Cell: ({ value }) => (
          <div>
            <div className="font-medium text-gray-900">
              {value?.apellido || ""} {value?.nombre || ""}
            </div>
            <div className="text-xs text-gray-500">
              {value?.tipoDocumento || "DNI"}: {value?.nroDocumento || ""}
            </div>
          </div>
        ),
      },
      {
        Header: "Concepto",
        accessor: "concepto",
        sortable: true,
        Cell: ({ value, row }) => (
          <div>
            <div className="font-medium text-gray-900">{value || "-"}</div>
            <div className="text-xs text-gray-500">{row?.descripcion || ""}</div>
          </div>
        ),
      },
      {
        Header: "Monto",
        accessor: "monto",
        sortable: true,
        Cell: ({ value, row }) => {
          const monto = value ? Number(value).toFixed(2) : row?.monto ? Number(row.monto).toFixed(2) : "";
          const esIngreso = row?.tipo === "INGRESO";
          return (
            <div className={`text-right font-semibold ${esIngreso ? "text-green-600" : "text-red-600"}`}>
              S/ {monto}
            </div>
          );
        },
      },
      {
        Header: "Método",
        accessor: "metodoPago",
        sortable: true,
      },
      {
        Header: "Categoría",
        accessor: "categoria",
        sortable: true,
        Cell: ({ value, row }) => (
          <div>
            <div className="font-medium text-gray-900">{value || "-"}</div>
            <div className="text-xs text-gray-500">{row?.subcategoria || ""}</div>
          </div>
        ),
      },
      {
        Header: "Registrado por",
        accessor: "registradoPorTrabajador",
        sortable: false,
        Cell: ({ value }) => (
          <div>
            <div className="font-medium text-gray-900">
              {value?.apellido || ""} {value?.nombre || ""}
            </div>
            <div className="text-xs text-gray-500">
              {value?.tipoDocumento || "DNI"}: {value?.nroDocumento || ""}
            </div>
          </div>
        ),
      },
      {
        Header: "Estado",
        accessor: "estado",
        sortable: true,
      },
    ],
    []
  );

  const formatFecha = (value) => {
    if (!value) return "";
    
    // Si ya está en formato DD/MM/YYYY, devolverlo tal cual
    if (typeof value === "string" && value.includes("/")) return value;
    
    // Convertir fecha ISO/timestamp a string si es necesario
    let fechaStr = value;
    if (value instanceof Date) {
      fechaStr = value.toISOString();
    }
    
    // Parsear YYYY-MM-DD directamente sin usar Date() para evitar conversión de timezone
    const partes = fechaStr.split("T")[0].split("-");
    if (partes.length === 3) {
      const [year, month, day] = partes;
      return `${day}/${month}/${year}`;
    }
    
    return value;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Caja Simple"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              <PlusCircle className="w-4 h-4" />
              Registrar movimiento
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="EGRESO">Egresos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos</option>
              {MESES.map((label, index) => (
                <option key={label} value={index + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <DataTable
        data={tableRows}
        columns={columns}
        loading={loading}
        title="Movimientos de Caja"
        icon={Wallet}
        actions={{ add: false, edit: false, delete: false, view: false, import: false, export: false }}
        enablePagination={true}
        enableSearch={true}
        enableSort={true}
        loadingMessage="Cargando movimientos..."
        emptyMessage="No hay movimientos para el periodo."
        itemsPerPage={10}
      />

      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Registrar movimiento
                    </Dialog.Title>
                    <button
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                      <select
                        value={formData.tipo}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipo: e.target.value,
                            categoria: "",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="INGRESO">Ingreso</option>
                        <option value="EGRESO">Egreso</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                      <input
                        value={formData.concepto}
                        onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej. Pago de pensión"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.monto}
                        onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Seleccione categoría</option>
                        {CATEGORIAS[formData.tipo]?.map((categoria) => (
                          <option key={categoria} value={categoria}>
                            {categoria}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
                      <select
                        value={formData.metodoPago}
                        onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {METODOS_PAGO.map((metodo) => (
                          <option key={metodo} value={metodo}>
                            {metodo}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <input
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Detalle opcional"
                      />
                    </div>
                    <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Registrar
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Caja;
