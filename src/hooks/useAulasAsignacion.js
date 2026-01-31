import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { aulaService } from "../services/aulaService";
import { asignacionAulaService } from "../services/asignacionAulaService";

/**
 * Hook personalizado para gestión de aulas y asignaciones
 */
export const useAulasAsignacion = (
  soloSinAsignacion = false,
  enabled = true,
) => {
  const queryClient = useQueryClient();

  console.log(
    soloSinAsignacion,
    "enabled:",
    enabled,
  );

  // Estado para aulas disponibles por grado
  const [aulasDisponiblesPorGrado, setAulasDisponiblesPorGrado] = useState([]);
  const [loadingAulasPorGrado, setLoadingAulasPorGrado] = useState(false);
  const {
    data: aulas = [],
    isLoading: loadingAulas,
    error: errorAulas,
    refetch: refetchAulas,
  } = useQuery({
    queryKey: ["aulas", soloSinAsignacion ? "sin-asignacion" : "todas"],
    queryFn: () => {

      return soloSinAsignacion
        ? aulaService.getAulasSinAsignacion()
        : aulaService.getAllAulas();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: enabled,
    onSuccess: (data) => {
      console.log(
        "✅ Aulas cargadas:",
        data?.length || 0,
        "aulas, tipo:",
        soloSinAsignacion ? "sin-asignacion" : "todas",
      );
    },
    onError: (error) => {
      console.error("❌ Error al cargar aulas:", error);
      toast.error("Error al cargar las aulas disponibles");
    },
  });

  // Query para obtener todas las asignaciones de aula
  const {
    data: asignacionesResponse = [],
    isLoading: loadingAsignaciones,
    error: errorAsignaciones,
    refetch: refetchAsignaciones,
  } = useQuery({
    queryKey: ["asignaciones-aula"],
    queryFn: () => asignacionAulaService.getAllAsignaciones(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    onSuccess: (data) => {
      if (data?.asignacionesAula) {
      }
    },
    onError: (error) => {
      console.error("❌ Error al cargar asignaciones:", error);
      toast.error("Error al cargar las asignaciones de aula");
    },
  });

  // Mutation para crear asignación de aula
  const createAsignacionMutation = useMutation({
    mutationFn: (asignacionData) =>
      asignacionAulaService.createAsignacion(asignacionData),
    onSuccess: (data) => {
      console.log("✅ Asignación creada exitosamente:", data);
      toast.success("Aula asignada correctamente al docente");

      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries(["asignaciones-aula"]);
      queryClient.invalidateQueries(["asignaciones"]);
      queryClient.invalidateQueries(["trabajadores"]);
    },
    onError: (error) => {
      console.error("❌ Error al crear asignación:", error);
      toast.error(error.message || "Error al asignar aula al docente");
    },
  });

  // Mutation para actualizar asignación
  const updateAsignacionMutation = useMutation({
    mutationFn: ({ idAsignacion, updateData }) =>
      asignacionAulaService.updateAsignacion(idAsignacion, updateData),
    onSuccess: () => {
      toast.success("Asignación actualizada correctamente");
      queryClient.invalidateQueries(["asignaciones-aula"]);
      queryClient.invalidateQueries(["asignaciones"]);
      queryClient.invalidateQueries(["trabajadores"]);
    },
    onError: (error) => {
      console.error("❌ Error al actualizar asignación:", error);
      toast.error(error.message || "Error al actualizar asignación");
    },
  });

  // Mutation para eliminar asignación
  const deleteAsignacionMutation = useMutation({
    mutationFn: (idAsignacion) =>
      asignacionAulaService.deleteAsignacion(idAsignacion),
    onSuccess: () => {
      toast.success("Asignación eliminada correctamente");
      queryClient.invalidateQueries(["asignaciones-aula"]);
      queryClient.invalidateQueries(["asignaciones"]);
      queryClient.invalidateQueries(["trabajadores"]);
    },
    onError: (error) => {
      toast.error(error.message || "Error al eliminar asignación");
    },
  });

  // Función helper para obtener asignaciones por trabajador
  const getAsignacionesByTrabajador = (idTrabajador) => {
    return useQuery({
      queryKey: ["asignaciones", idTrabajador],
      queryFn: () =>
        asignacionAulaService.getAsignacionesByTrabajador(idTrabajador),
      enabled: !!idTrabajador,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error("Error al cargar asignaciones:", error);
        toast.error("Error al cargar asignaciones del trabajador");
      },
    });
  };

  // Función para crear asignación de aula para docente
  const asignarAulaADocente = async (idTrabajador, idAula) => {
    try {
      const asignacionData = {
        fechaAsignacion: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
        estadoActivo: true,
        idAula: idAula,
        idTrabajador: idTrabajador,
      };

      const result = await createAsignacionMutation.mutateAsync(asignacionData);
      console.log("✅ Aula asignada exitosamente:", result);

      toast.success("Aula asignada al docente exitosamente");
      return result;
    } catch (error) {
      console.error("❌ Error en asignarAulaADocente:", error);
      toast.error("Error al asignar aula al docente");
      throw error;
    }
  };

  // Función para obtener aulas disponibles (sin asignar)
  const getAulasDisponibles = () => {
    // TODO: Implementar lógica para filtrar aulas ya asignadas
    // Por ahora retorna todas las aulas
    return aulas;
  };

  // Función para obtener aulas disponibles por grado
  const fetchAulasPorGrado = useCallback(
    async (idGrado) => {
      try {
        console.log("🎯 Obteniendo aulas disponibles para grado:", idGrado);

        // Si el idGrado no está definido, limpiar el estado
        if (!idGrado) {
          console.log(
            "⚠️ No se proporcionó idGrado, limpiando aulas disponibles",
          );
          setAulasDisponiblesPorGrado([]);
          setLoadingAulasPorGrado(false);
          return;
        }

        // Evitar llamadas duplicadas si ya estamos cargando
        if (loadingAulasPorGrado) {
          console.log(
            "⚠️ Ya estamos cargando aulas, omitiendo llamada duplicada",
          );
          return;
        }

        setLoadingAulasPorGrado(true);

        // Usar el nuevo endpoint para obtener aulas disponibles por grado
        const aulasDisponibles =
          await aulaService.getAulasDisponiblesPorGrado(idGrado);

        console.log("✅ Aulas disponibles obtenidas:", aulasDisponibles);
        setAulasDisponiblesPorGrado(aulasDisponibles || []);
      } catch (error) {
        console.error(
          "❌ Error al obtener aulas disponibles por grado:",
          error,
        );
        toast.error(
          "Error al cargar aulas disponibles para el grado seleccionado",
        );
        setAulasDisponiblesPorGrado([]);
      } finally {
        setLoadingAulasPorGrado(false);
      }
    },
    [loadingAulasPorGrado],
  );

  // Log para verificar qué se está retornando

  return {
    // Datos
    aulas,
    aulasDisponiblesPorGrado,
    asignaciones:
      asignacionesResponse?.data ||
      asignacionesResponse?.asignacionesAula ||
      asignacionesResponse?.info?.data ||
      asignacionesResponse ||
      [],
    aulasDisponibles: getAulasDisponibles(),

    // Estados de carga
    loadingAulas,
    loadingAulasPorGrado,
    loadingAsignaciones,
    loadingAsignacion: createAsignacionMutation.isLoading,
    loadingUpdate: updateAsignacionMutation.isLoading,
    loadingDelete: deleteAsignacionMutation.isLoading,

    // Errores
    errorAulas,
    errorAsignaciones,
    errorAsignacion: createAsignacionMutation.error,

    // Funciones
    refetchAulas,
    refetchAsignaciones,
    fetchAulasPorGrado,
    asignarAulaADocente,
    getAsignacionesByTrabajador,

    // Mutations directas para casos avanzados
    createAsignacion: createAsignacionMutation.mutateAsync,
    updateAsignacion: updateAsignacionMutation.mutateAsync,
    deleteAsignacion: deleteAsignacionMutation.mutateAsync,

    // Estados de las mutations
    isCreatingAsignacion: createAsignacionMutation.isLoading,
    isUpdatingAsignacion: updateAsignacionMutation.isLoading,
    isDeletingAsignacion: deleteAsignacionMutation.isLoading,
  };
};

export default useAulasAsignacion;
