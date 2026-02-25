import React, { useState } from "react";
import { useEvaluacionesProfesor } from "../../../hooks/useEvaluacionesProfesor";
import {
  FileText,
  ExternalLink,
  Calendar,
  User,
  Search,
  Users,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";
import { formatFechaEvaluacion } from "../../../utils/dateUtils";
import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../../../components/common/StatCard";

const EvaluacionCard = ({ evaluacion }) => {
  const handleOpenArchivo = (archivoUrl) => {
    if (!archivoUrl) {
      toast.error("No hay archivo adjunto para abrir");
      return;
    }

    try {
      // Abrir el archivo en una nueva pestaña/ventana
      window.open(archivoUrl, "_blank", "noopener,noreferrer");
      toast.success("Archivo abierto en nueva pestaña");
    } catch (error) {
      console.error("Error al abrir archivo:", error);
      toast.error("Error al abrir el archivo: " + error.message);
    }
  };

  const formatDate = (dateString) => {
    return formatFechaEvaluacion(dateString);
  };

  return (
    <div className="w-full mb-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {evaluacion.motivo || "Evaluación"}
          </h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            {formatDate(evaluacion.fechaCreacion)}
          </span>
        </div>

        {evaluacion.coordinador && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <User className="w-4 h-4 mr-2" />
            <span>
              Evaluado por: {evaluacion.coordinador.nombre || "Coordinador"}
              {evaluacion.coordinador.apellido &&
                ` ${evaluacion.coordinador.apellido}`}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {evaluacion.descripcion && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Descripción:</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                {evaluacion.descripcion}
              </p>
            </div>
          )}

          {evaluacion.archivoUrl && evaluacion.archivoUrl.trim() !== "" && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm text-gray-700">
                  Archivo adjunto disponible
                </span>
              </div>
              <button
                onClick={() => handleOpenArchivo(evaluacion.archivoUrl)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir
              </button>
            </div>
          )}

          {(!evaluacion.archivoUrl || evaluacion.archivoUrl.trim() === "") && (
            <div className="text-sm text-gray-500 italic">
              No hay archivo adjunto en esta evaluación
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Evaluaciones = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: evaluaciones = [],
    isLoading,
    error,
    isError,
  } = useEvaluacionesProfesor();

  // Estadisticas
  const statistics = {
    total: evaluaciones.length,
    conArchivo: evaluaciones.filter(
      (e) => e.archivoUrl && e.archivoUrl.trim() !== "",
    ).length,
    sinArchivo: evaluaciones.filter(
      (e) => !e.archivoUrl || e.archivoUrl.trim() === "",
    ).length,
    coordinadores: new Set(
      evaluaciones.map((e) => e.coordinador?.nombre).filter(Boolean),
    ).size,
  };

  // Filtrar
  const evaluacionesFiltradas = evaluaciones.filter((e) => {
    const motivo = (e.motivo || "").toLowerCase();
    const desc = (e.descripcion || "").toLowerCase();
    const coord =
      `${e.coordinador?.nombre || ""} ${e.coordinador?.apellido || ""}`.toLowerCase();
    return (
      motivo.includes(searchTerm.toLowerCase()) ||
      desc.includes(searchTerm.toLowerCase()) ||
      coord.includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Cargando evaluaciones...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-64">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">
            Error al cargar evaluaciones
          </h3>
          <p className="text-sm">
            {error?.message || "Ocurrio un error inesperado"}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Mis Evaluaciones" theme="green" />

      {/* Estadisticas */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Total"
          value={statistics.total}
          color="#6b7280"
        />
        <StatCard
          icon={Paperclip}
          label="Con archivo"
          value={statistics.conArchivo}
          color="#16a34a"
        />
        <StatCard
          icon={FileText}
          label="Sin archivo"
          value={statistics.sinArchivo}
          color="#dc2626"
        />
        <StatCard
          icon={Users}
          label="Coordinadores"
          value={statistics.coordinadores}
          color="#9333ea"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar evaluacion
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Motivo, descripcion o coordinador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Lista de evaluaciones */}
      {evaluacionesFiltradas.length === 0 ? (
        <div className="flex flex-col justify-center items-center min-h-48">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchTerm
              ? "No se encontraron evaluaciones"
              : "No tienes evaluaciones recibidas"}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Intenta con otros terminos de busqueda"
              : "Aun no tienes evaluaciones."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {evaluacionesFiltradas.map((evaluacion) => (
            <EvaluacionCard
              key={
                evaluacion.idEvaluacionDocente ||
                evaluacion.idComentario ||
                evaluacion.id
              }
              evaluacion={evaluacion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Evaluaciones;
