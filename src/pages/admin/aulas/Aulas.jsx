import React, { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAulasAdmin } from "../../../hooks/queries/useAulasQueries";
import ModalAgregarAula from "./modales/ModalAgregarAula";
import ModalEditarAula from "./modales/ModalEditarAula";
import PageHeader from "../../../components/common/PageHeader";

const Aulas = () => {
  const [showModalCrear, setShowModalCrear] = useState(false);
  const [showModalEditar, setShowModalEditar] = useState(false);
  const [aulaSeleccionada, setAulaSeleccionada] = useState(null);
  const navigate = useNavigate();

  const { data: aulas = [], isLoading } = useAulasAdmin();

  const handleEdit = (aula) => {
    setAulaSeleccionada(aula);
    setShowModalEditar(true);
  };

  const handleOpenDetalle = (aula) => {
    const id = aula?.idAula || aula?.id;
    if (id) {
      navigate(`/admin/aulas/${id}`);
    }
  };

  const aulasOrdenadas = useMemo(() => {
    return [...aulas].sort((a, b) =>
      `${a.idGrado?.grado || ""} ${a.seccion || ""}`
        .localeCompare(`${b.idGrado?.grado || ""} ${b.seccion || ""}`)
    );
  }, [aulas]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aulas"
        actions={
          <button
            onClick={() => setShowModalCrear(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Aula
          </button>
        }
      />

      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          Cargando aulas...
        </div>
      )}

      {!isLoading && aulasOrdenadas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          No hay aulas registradas
        </div>
      )}

      {!isLoading && aulasOrdenadas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {aulasOrdenadas.map((aula) => (
            <div
              key={aula.idAula || aula.id}
              role="button"
              tabIndex={0}
              onClick={() => handleOpenDetalle(aula)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenDetalle(aula);
                }
              }}
              className="text-left bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aula</p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {aula.idGrado?.grado || "Sin grado"} - Sección {aula.seccion || "N/A"}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    aula.estado === "inactiva"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {aula.estado === "inactiva" ? "Inactiva" : "Activa"}
                </span>
              </div>

              <div className="mt-4 space-y-1 text-sm text-gray-600">
                <p>
                  Estudiantes: <span className="font-medium text-gray-900">{aula.cantidadEstudiantes || 0}</span>
                </p>
                {aula.capacidadMaxima && (
                  <p>
                    Capacidad: <span className="font-medium text-gray-900">{aula.capacidadMaxima}</span>
                  </p>
                )}
                {aula.ubicacion && (
                  <p>
                    Ubicación: <span className="font-medium text-gray-900">{aula.ubicacion}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleEdit(aula);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalAgregarAula
        isOpen={showModalCrear}
        onClose={() => setShowModalCrear(false)}
      />

      <ModalEditarAula
        isOpen={showModalEditar}
        onClose={() => {
          setShowModalEditar(false);
          setAulaSeleccionada(null);
        }}
        aula={aulaSeleccionada}
      />

    </div>
  );
};

export default Aulas;
