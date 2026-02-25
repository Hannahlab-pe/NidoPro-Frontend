import React, { useEffect, useMemo, useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import TablaPensionesSecretaria from "./tabla/TablaPensionesSecretaria";
import secretariaPagosService from "../../../services/secretariaPagosService";
import { useAulasHook } from "../../../hooks/useAulas";

const STORAGE_KEY = "secretaria_pensiones_aula_seleccionada";

const PensionesSecretaria = () => {
  const { aulas = [], loading: loadingAulas } = useAulasHook();

  // Recuperar aula seleccionada del sessionStorage al montar el componente
  const [selectedAula, setSelectedAula] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved || "";
  });

  const [registros, setRegistros] = useState([]);
  const [loadingRegistros, setLoadingRegistros] = useState(false);

  // Guardar en sessionStorage cada vez que cambia el aula seleccionada
  const handleAulaChange = (aulaId) => {
    setSelectedAula(aulaId);
    if (aulaId) {
      sessionStorage.setItem(STORAGE_KEY, aulaId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  };

  const selectedAulaLabel = useMemo(() => {
    const found = aulas.find(
      (aula) => (aula.idAula || aula.id) === selectedAula,
    );
    if (!found) return "";
    const grado = found.idGrado?.grado || found.grado || "";
    return `${found.seccion}${grado ? ` - ${grado}` : ""}`;
  }, [aulas, selectedAula]);

  const loadRegistros = async () => {
    if (!selectedAula) return;
    try {
      setLoadingRegistros(true);
      const response =
        await secretariaPagosService.getRegistrosByAula(selectedAula);
      const data =
        response?.info?.data || response?.data || response?.registros || [];
      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      setRegistros([]);
    } finally {
      setLoadingRegistros(false);
    }
  };

  useEffect(() => {
    loadRegistros();
  }, [selectedAula]);

  return (
    <div className="space-y-6">
      <PageHeader title="Pensiones" />
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aula
            </label>
            <select
              value={selectedAula}
              onChange={(event) => handleAulaChange(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingAulas}
            >
              <option value="">
                {loadingAulas ? "Cargando aulas..." : "Seleccione un aula"}
              </option>
              {aulas.map((aula) => (
                <option
                  key={aula.idAula || aula.id}
                  value={aula.idAula || aula.id}
                >
                  {aula.seccion} - {aula.idGrado?.grado || aula.grado || ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <TablaPensionesSecretaria
        registros={registros}
        loading={loadingRegistros}
        aulas={aulas}
        selectedAulaLabel={selectedAulaLabel}
        onRefresh={loadRegistros}
      />
    </div>
  );
};

export default PensionesSecretaria;
