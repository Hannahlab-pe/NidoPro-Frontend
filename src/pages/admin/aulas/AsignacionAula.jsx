import React from "react";
import TablaAulas from "./tablas/TablaAula";
import { useAulasAsignacion } from "../../../hooks/useAulasAsignacion";
import PageHeader from "../../../components/common/PageHeader";

const AsignacionAula = () => {
  const {
    asignaciones = [],
    loadingAsignaciones,
    refetchAsignaciones,
  } = useAulasAsignacion();

  return (
    <div className="space-y-6">
      <PageHeader title="Asignación docente Aula" />

      <TablaAulas
        asignaciones={asignaciones}
        loading={loadingAsignaciones}
        onRefresh={refetchAsignaciones}
      />
    </div>
  );
};

export default AsignacionAula;
