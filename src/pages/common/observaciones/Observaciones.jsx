import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusCircle, X } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../../../components/common/PageHeader";
import StorageService from "../../../services/storageService";
import observacionService from "../../../services/observacionService";
import { DataTable } from "../../../components/common/DataTable";

const TIPOS_OBSERVACION = [
  { value: "BUG", label: "Bug" },
  { value: "SUGERENCIA", label: "Sugerencia" },
  { value: "PREGUNTA", label: "Pregunta" },
];

const Observaciones = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingObservaciones, setLoadingObservaciones] = useState(false);
  const [observaciones, setObservaciones] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    tipo: "BUG",
    imagen: null,
  });

  const cargarObservaciones = async () => {
    try {
      setLoadingObservaciones(true);
      const data = await observacionService.listarObservaciones();
      setObservaciones(data);
    } catch (error) {
      toast.error(error.message || "Error al cargar observaciones");
      setObservaciones([]);
    } finally {
      setLoadingObservaciones(false);
    }
  };

  React.useEffect(() => {
    cargarObservaciones();
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      titulo: "",
      descripcion: "",
      tipo: "BUG",
      imagen: null,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.titulo.trim()) {
      toast.error("Completa el título");
      return;
    }

    try {
      setSubmitting(true);

      let imagenUrl;
      if (formData.imagen) {
        const uploadResult = await StorageService.uploadFile(
          formData.imagen,
          "observaciones",
        );
        imagenUrl = uploadResult?.url;
      }

      await observacionService.crearObservacion({
        titulo: formData.titulo.trim(),
        tipoObservacion: formData.tipo,
        descripcion: formData.descripcion?.trim() || undefined,
        imagenUrl,
      });

      toast.success("Observación registrada correctamente");
      await cargarObservaciones();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || "Error al registrar observación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Observaciones"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4" />
            Agregar observación
          </button>
        }
      />

      <DataTable
        data={observaciones}
        loading={loadingObservaciones}
        title="Listado de Observaciones"
        columns={[
          {
            Header: "ID",
            accessor: "idObservacion",
            sortable: true,
            Cell: ({ value }) => (
              <span className="font-mono text-xs text-gray-600">
                {value ? `${value.slice(0, 8)}...` : "-"}
              </span>
            ),
          },
          {
            Header: "Título",
            accessor: "titulo",
            sortable: true,
          },
          {
            Header: "Tipo",
            accessor: "tipoObservacion",
            sortable: true,
            Cell: ({ value }) => (
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {value || "-"}
              </span>
            ),
          },
          {
            Header: "Descripción",
            accessor: "descripcion",
            sortable: false,
            Cell: ({ value }) => (
              <div className="max-w-65 truncate" title={value || ""}>
                {value || "Sin descripción"}
              </div>
            ),
          },
          {
            Header: "Imagen",
            accessor: "imagenUrl",
            sortable: false,
            Cell: ({ value }) =>
              value ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Ver imagen
                </a>
              ) : (
                <span className="text-gray-400 text-sm">Sin imagen</span>
              ),
          },
          {
            Header: "Fecha Registro",
            accessor: "fechaRegistro",
            type: "date",
            sortable: true,
            Cell: ({ value }) => (
              <span>
                {value ? new Date(value).toLocaleDateString("es-PE") : "-"}
              </span>
            ),
          },
          {
            Header: "Fecha Actualización",
            accessor: "fechaActualizacion",
            type: "date",
            sortable: true,
            Cell: ({ value }) => (
              <span>
                {value ? new Date(value).toLocaleDateString("es-PE") : "-"}
              </span>
            ),
          },
          {
            Header: "Estado",
            accessor: "estaActivo",
            sortable: true,
            Cell: ({ value }) => (
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  value
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {value ? "Activo" : "Inactivo"}
              </span>
            ),
          },
        ]}
        actions={{
          add: false,
          edit: false,
          delete: false,
          view: false,
          import: false,
          export: false,
        }}
        enablePagination={true}
        enableSearch={true}
        enableSort={true}
        itemsPerPage={10}
        loadingMessage="Cargando observaciones..."
        emptyMessage="No hay observaciones registradas"
      />

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
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
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Agregar observación
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            titulo: event.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ej: Error al registrar matrícula"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de observación
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            tipo: event.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {TIPOS_OBSERVACION.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            descripcion: event.target.value,
                          }))
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Describe el bug, sugerencia o pregunta (opcional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subir imagen
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            imagen: event.target.files?.[0] || null,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      {formData.imagen && (
                        <p className="text-xs text-gray-500 mt-1">
                          Imagen seleccionada: {formData.imagen.name}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        disabled={submitting}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Guardando..." : "Guardar observación"}
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

export default Observaciones;
