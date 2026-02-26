// src/services/api/trabajadorService.js
import axios from "axios";
import { StorageService } from "./storageService";

// Base URL del API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta contiene HTML en lugar de JSON
    if (typeof response.data === "string" && response.data.includes("<html>")) {
      console.error("❌ Respuesta HTML detectada en trabajadorService");
      if (import.meta.env.PROD) {
        // En producción, crear una respuesta vacía en lugar de fallar
        return {
          ...response,
          data: { trabajadores: [], data: [], info: { data: [] } },
        };
      }
    }
    return response;
  },
  (error) => {
    console.error("Error en la respuesta del API:", error);

    // Si el token expiró, redirigir al login (solo si no estamos ya en login)
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      console.warn(
        "🔐 Token expirado en trabajadorService, redirigiendo al login"
      );
      localStorage.removeItem("token");
      localStorage.removeItem("auth-storage");

      // En producción, usar reemplazo en lugar de asignación directa
      if (import.meta.env.PROD) {
        window.location.replace("/login");
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Servicio para gestionar trabajadores
 */
export const trabajadorService = {
  /**
   * Obtener todos los trabajadores
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de trabajadores
   */
  async getAllTrabajadores(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Agregar filtros a los parámetros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const response = await api.get(`/trabajador?${params.toString()}`);
      console.log("📋 Respuesta del backend:", response.data);

      // Extraer el array de trabajadores de la respuesta
      // El backend tiene un typo: "sucess" en lugar de "success"
      if (
        (response.data.success || response.data.sucess) &&
        response.data.trabajadores
      ) {
        return response.data.trabajadores;
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener trabajadores"
      );
    }
  },

  /**
   * Obtener un trabajador por ID
   * @param {string|number} id - ID del trabajador
   * @returns {Promise<Object>} Datos del trabajador
   */
  async getTrabajadorById(id) {
    try {
      const response = await api.get(`/trabajador/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener trabajador:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener trabajador"
      );
    }
  },

  /**
   * Obtener aulas asignadas a un trabajador
   * @param {string|number} idTrabajador - ID del trabajador
   * @returns {Promise<Object>} Lista de aulas asignadas al trabajador
   */
  async getAulasPorTrabajador(idTrabajador) {
    try {
      console.log("🏫 Obteniendo aulas del trabajador:", idTrabajador);

      const response = await api.get(`/trabajador/aulas/${idTrabajador}`);
      console.log("✅ Aulas del trabajador obtenidas:", response.data);

      // Estructurar la respuesta para que sea consistente
      return {
        aulas: response.data?.aulas || response.data?.data || [],
        success: true,
      };
    } catch (error) {
      console.error("❌ Error al obtener aulas del trabajador:", error);

      // Si es un error 404 (trabajador no encontrado), devolver array vacío
      if (error.response?.status === 404) {
        console.log("ℹ️ Trabajador no encontrado o sin aulas asignadas");
        return {
          aulas: [],
          success: true,
        };
      }

      throw new Error(
        error.response?.data?.message || "Error al obtener aulas del trabajador"
      );
    }
  },

  /**
   * Crear un nuevo trabajador SIMPLE (sin contrato ni sueldo)
   * @param {Object} trabajadorData - Datos básicos del trabajador
   * @returns {Promise<Object>} Trabajador creado
   */
  async createTrabajadorSimple(trabajadorData) {
    try {
      console.log("📤 Creando trabajador simple:", trabajadorData);

      // Validar solo campos requeridos para el endpoint simple
      const requiredFields = [
        "nombre",
        "apellido",
        "tipoDocumento",
        "nroDocumento",
        "idRol",
      ];
      const missingFields = requiredFields.filter(
        (field) => !trabajadorData[field]
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Campos requeridos faltantes: ${missingFields.join(", ")}`
        );
      }

      // Preparar payload simple según el endpoint POST /trabajador
      const payload = {
        nombre: trabajadorData.nombre.trim(),
        apellido: trabajadorData.apellido.trim(),
        tipoDocumento: trabajadorData.tipoDocumento,
        nroDocumento: trabajadorData.nroDocumento.trim(),
        idRol: trabajadorData.idRol,
        correo: trabajadorData.correo?.trim() || null,
        telefono: trabajadorData.telefono?.trim() || null,
        direccion: trabajadorData.direccion?.trim() || null,
        estaActivo:
          trabajadorData.estaActivo !== undefined
            ? trabajadorData.estaActivo
            : true,
        imagenUrl: trabajadorData.imagenUrl || null,
      };

      console.log("📤 Payload para endpoint /trabajador:", payload);

      const response = await api.post("/trabajador", payload);
      console.log("✅ Trabajador creado exitosamente:", response.data);

      return response.data;
    } catch (error) {
      console.error("❌ Error al crear trabajador simple:", error);

      if (error.response?.data) {
        console.error("Detalles del error del backend:", error.response.data);
      }

      throw new Error(
        error.response?.data?.message || "Error al crear trabajador"
      );
    }
  },

  /**
   * Crear un nuevo trabajador con subida de archivos a Firebase
   * @param {Object} trabajadorData - Datos del trabajador
   * @returns {Promise<Object>} Trabajador creado
   */
  async createTrabajador(trabajadorData) {
    try {
      console.log(
        "📤 Enviando datos del trabajador al backend:",
        trabajadorData
      );

      // Validar datos requeridos según el backend
      const requiredFields = [
        "nombre",
        "apellido",
        "tipoDocumento",
        "nroDocumento",
        "direccion",
        "correo",
        "telefono",
        "idRol",
      ];
      const missingFields = requiredFields.filter(
        (field) => !trabajadorData[field]
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Campos requeridos faltantes: ${missingFields.join(", ")}`
        );
      }

      // Extraer archivos del formulario si existen
      const archivos = trabajadorData.archivos;
      let archivoContratoUrl = null;
      let archivoFirmadoUrl = null;

      // Si hay archivos, subirlos a Firebase Storage
      if (archivos && archivos.length > 0) {
        console.log("📤 Iniciando subida de archivos a Firebase...");

        // Filtrar archivos por tipo (contrato y firmado)
        const archivoContrato = Array.from(archivos).find(
          (file) =>
            file.name.toLowerCase().includes("contrato") ||
            file.name.toLowerCase().includes("contract")
        );

        const archivoFirmado = Array.from(archivos).find(
          (file) =>
            file.name.toLowerCase().includes("firmado") ||
            file.name.toLowerCase().includes("signed") ||
            file.name.toLowerCase().includes("firma")
        );

        // Subir archivo de contrato si existe
        if (archivoContrato) {
          console.log("📄 Subiendo archivo de contrato...");
          const contratoResult = await StorageService.uploadFile(
            archivoContrato,
            "trabajadores/contratos",
            trabajadorData.correo || "anonymous"
          );
          archivoContratoUrl = contratoResult.url;
          console.log("✅ Archivo de contrato subido:", contratoResult.url);
        }

        // Subir archivo firmado si existe
        if (archivoFirmado) {
          console.log("📝 Subiendo archivo firmado...");
          const firmadoResult = await StorageService.uploadFile(
            archivoFirmado,
            "trabajadores/firmados",
            trabajadorData.correo || "anonymous"
          );
          archivoFirmadoUrl = firmadoResult.url;
          console.log("✅ Archivo firmado subido:", firmadoResult.url);
        }

        // Si no se encontraron archivos específicos, subir el primer archivo como contrato
        if (!archivoContrato && !archivoFirmado && archivos.length > 0) {
          console.log("📄 Subiendo primer archivo como contrato...");
          const contratoResult = await StorageService.uploadFile(
            archivos[0],
            "trabajadores/contratos",
            trabajadorData.correo || "anonymous"
          );
          archivoContratoUrl = contratoResult.url;
          console.log("✅ Archivo subido como contrato:", contratoResult.url);
        }
      }

      // Preparar datos exactamente como espera el backend para el endpoint transactional
      const payload = {
        idTrabajador: null,
        nombre: trabajadorData.nombre.trim(),
        apellido: trabajadorData.apellido.trim(),
        tipoDocumento: trabajadorData.tipoDocumento || "DNI",
        nroDocumento: trabajadorData.nroDocumento.trim(),
        direccion: trabajadorData.direccion.trim(),
        correo: trabajadorData.correo.trim(),
        telefono: trabajadorData.telefono.trim(),
        estaActivo:
          trabajadorData.estaActivo !== undefined
            ? trabajadorData.estaActivo
            : true,
        imagenUrl: null,
        idRol: trabajadorData.idRol, // Usar el rol seleccionado en el formulario

        // Objeto contrato anidado con URLs de archivos
        contrato: trabajadorData.idTipoContrato
          ? {
              idTipoContrato: trabajadorData.idTipoContrato,
              numeroContrato: trabajadorData.numeroContrato,
              fechaInicio: trabajadorData.fechaInicio,
              fechaFin: trabajadorData.fechaFin,
              jornadaLaboral: ["COMPLETA", "PARCIAL", "FLEXIBLE"].includes(
                trabajadorData.jornadaLaboral?.toUpperCase()
              )
                ? trabajadorData.jornadaLaboral.toUpperCase()
                : "COMPLETA",
              horasSemanales: parseInt(trabajadorData.horasSemanales) || 40,
              cargoContrato:
                trabajadorData.cargoContrato ||
                trabajadorData.descripcionFunciones ||
                "Trabajador",
              descripcionFunciones: trabajadorData.descripcionFunciones || "",
              lugarTrabajo: trabajadorData.lugarTrabajo || "",
              estadoContrato: "ACTIVO",
              fechaFinalizacionReal: trabajadorData.fechaFin,
              archivoContratoUrl: archivoContratoUrl,
              archivoFirmadoUrl: archivoFirmadoUrl,
              renovacionAutomatica: trabajadorData.renovacion || false,
              diasAvisoRenovacion: parseInt(trabajadorData.diasAviso) || 30,
              fechaAprobacion: trabajadorData.fechaAprobacion,
              creadoEn: new Date().toISOString().split("T")[0],
            }
          : null,

        // Objeto sueldoBase anidado
        sueldoBase: trabajadorData.sueldoBase
          ? {
              sueldoBase: parseFloat(trabajadorData.sueldoBase).toFixed(2),
              bonificacionFamiliar: trabajadorData.bonificacion
                ? parseFloat(trabajadorData.bonificacion).toFixed(2)
                : "0.00",
              asignacionFamiliar: trabajadorData.asignacion
                ? parseFloat(trabajadorData.asignacion).toFixed(2)
                : "0.00",
              fechaAsignacion: trabajadorData.fechaAsignacion,
              fechaVigenciaDesde: trabajadorData.fechaVigenciaDesde,
              fechaVigenciaHasta: trabajadorData.fechaHasta,
              observaciones:
                trabajadorData.observacionesSueldo ||
                "Sueldo inicial de contratación",
              estaActivo:
                trabajadorData.estaActivoSueldo !== undefined
                  ? trabajadorData.estaActivoSueldo
                  : true,
              creadoPor: "459b0eb9-1a9f-474d-91b1-3c3a037673cd",
              actualizadoPor: null,
            }
          : null,
      };

      const response = await api.post("/trabajador/transactional", payload);
      console.log("✅ Trabajador creado exitosamente:", response.data);

      // Extraer el trabajador de la respuesta del backend
      if (response.data.trabajador) {
        return response.data.trabajador;
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error al crear trabajador:", error);

      // Si hay error y ya se subieron archivos, intentar limpiarlos
      if (error.response?.data) {
        console.error("Detalles del error del backend:", error.response.data);
      }

      throw new Error(
        error.response?.data?.message || "Error al crear trabajador"
      );
    }
  },

  /**
   * Actualizar un trabajador existente
   * @param {string|number} id - ID del trabajador
   * @param {Object} trabajadorData - Datos actualizados del trabajador
   * @returns {Promise<Object>} Trabajador actualizado
   */
  async updateTrabajador(id, trabajadorData) {
    try {
      console.log("📤 Actualizando trabajador:", id, trabajadorData);

      // Preparar datos para el backend según el esquema del endpoint PATCH /api/v1/trabajador/{id}
      const payload = {
        nombre: trabajadorData.nombre?.trim(),
        apellido: trabajadorData.apellido?.trim(),
        correo: trabajadorData.correo?.trim(),
        telefono: trabajadorData.telefono?.trim() || trabajadorData.numero?.trim(),
        direccion: trabajadorData.direccion?.trim(),
        tipoDocumento: trabajadorData.tipoDocumento,
        nroDocumento: trabajadorData.nroDocumento?.trim(),
        fechaNacimiento: trabajadorData.fechaNacimiento,
        idRol: trabajadorData.idRol,
        estaActivo: trabajadorData.estaActivo,
      };

      // Remover campos undefined para no enviar datos innecesarios
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === "") {
          delete payload[key];
        }
      });

      console.log("📋 Payload a enviar:", payload);

      const response = await api.patch(`/trabajador/${id}`, payload);
      console.log("✅ Trabajador actualizado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar trabajador:", error);
      console.error("❌ Detalles del error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      throw new Error(
        error.response?.data?.message || "Error al actualizar trabajador"
      );
    }
  },

  /**
   * Actualizar un profesor existente
   * @param {string|number} id - ID del profesor
   * @param {Object} teacherData - Datos actualizados del profesor
   * @returns {Promise<Object>} Profesor actualizado
   */
  async updateTeacher(id, teacherData) {
    try {
      console.log("📤 Actualizando profesor:", id, teacherData);

      // Preparar datos para el backend
      const payload = {
        name: teacherData.name?.trim(),
        email: teacherData.email?.trim(),
        phone: teacherData.phone?.trim(),
        address: teacherData.address?.trim(),
        subject: teacherData.subject,
        degree: teacherData.degree?.trim(),
        experience: teacherData.experience
          ? Number(teacherData.experience)
          : undefined,
        schedule: teacherData.schedule,
        specializations: teacherData.specializations
          ? Array.isArray(teacherData.specializations)
            ? teacherData.specializations
            : teacherData.specializations
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s)
          : undefined,
        notes: teacherData.notes?.trim(),
        photo: teacherData.photo,
        status: teacherData.status,
        rating: teacherData.rating ? Number(teacherData.rating) : undefined,
        students: teacherData.students
          ? Number(teacherData.students)
          : undefined,
        classes: teacherData.classes,
      };

      // Remover campos undefined
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.put(`/teachers/${id}`, payload);
      console.log("✅ Profesor actualizado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al actualizar profesor"
      );
    }
  },

  /**
   * Desactivar/Activar un trabajador
   * @param {string|number} id - ID del trabajador
   * @param {boolean} newStatus - Nuevo estado activo/inactivo
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async toggleTrabajadorStatus(id, newStatus) {
    try {
      console.log(
        `🔄 Cambiando estado del trabajador ID: ${id} a ${newStatus}`
      );

      const response = await api.patch(`/trabajador/${id}`, {
        estaActivo: newStatus,
      });

      console.log("✅ Estado del trabajador actualizado:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al cambiar estado del trabajador:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al cambiar estado del trabajador"
      );
    }
  },

  /**
   * Cambiar el estado de un profesor (activo/inactivo/licencia)
   * @param {string|number} id - ID del profesor
   * @param {string} status - Nuevo estado ('active' | 'inactive' | 'leave')
   * @returns {Promise<Object>} Profesor actualizado
   */
  async changeTeacherStatus(id, status) {
    try {
      console.log("🔄 Cambiando estado del profesor:", id, status);
      const response = await api.patch(`/teachers/${id}/status`, { status });
      console.log("✅ Estado cambiado exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al cambiar estado del profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al cambiar estado del profesor"
      );
    }
  },

  /**
   * Obtener profesores por materia
   * @param {string} subject - Materia a filtrar
   * @returns {Promise<Array>} Lista de profesores de esa materia
   */
  async getTeachersBySubject(subject) {
    try {
      const response = await api.get(
        `/teachers/subject/${encodeURIComponent(subject)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener profesores por materia:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener profesores por materia"
      );
    }
  },

  /**
   * Obtener profesores por horario
   * @param {string} schedule - Horario a filtrar ('Mañana' | 'Tarde' | 'Completo')
   * @returns {Promise<Array>} Lista de profesores con ese horario
   */
  async getTeachersBySchedule(schedule) {
    try {
      const response = await api.get(
        `/teachers/schedule/${encodeURIComponent(schedule)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener profesores por horario:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener profesores por horario"
      );
    }
  },

  /**
   * Buscar profesores por nombre, materia o email
   * @param {string} query - Término de búsqueda
   * @returns {Promise<Array>} Lista de profesores que coinciden
   */
  async searchTeachers(query) {
    try {
      const response = await api.get(
        `/teachers/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error al buscar profesores:", error);
      throw new Error(
        error.response?.data?.message || "Error al buscar profesores"
      );
    }
  },

  /**
   * Obtener clases asignadas a un profesor
   * @param {string|number} teacherId - ID del profesor
   * @returns {Promise<Array>} Lista de clases del profesor
   */
  async getTeacherClasses(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/classes`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener clases del profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener clases del profesor"
      );
    }
  },

  /**
   * Asignar clases a un profesor
   * @param {string|number} teacherId - ID del profesor
   * @param {Array} classIds - IDs de las clases a asignar
   * @returns {Promise<Object>} Resultado de la asignación
   */
  async assignClassesToTeacher(teacherId, classIds) {
    try {
      const response = await api.post(`/teachers/${teacherId}/classes`, {
        classIds,
      });
      return response.data;
    } catch (error) {
      console.error("Error al asignar clases al profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al asignar clases al profesor"
      );
    }
  },

  /**
   * Remover clases de un profesor
   * @param {string|number} teacherId - ID del profesor
   * @param {Array} classIds - IDs de las clases a remover
   * @returns {Promise<void>}
   */
  async removeClassesFromTeacher(teacherId, classIds) {
    try {
      await api.delete(`/teachers/${teacherId}/classes`, {
        data: { classIds },
      });
    } catch (error) {
      console.error("Error al remover clases del profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al remover clases del profesor"
      );
    }
  },

  /**
   * Actualizar calificación de un profesor
   * @param {string|number} teacherId - ID del profesor
   * @param {number} rating - Nueva calificación (1-5)
   * @returns {Promise<Object>} Profesor actualizado
   */
  async updateTeacherRating(teacherId, rating) {
    try {
      console.log(
        "🔄 Actualizando calificación del profesor:",
        teacherId,
        rating
      );

      if (rating < 1 || rating > 5) {
        throw new Error("La calificación debe estar entre 1 y 5");
      }

      const response = await api.patch(`/teachers/${teacherId}/rating`, {
        rating,
      });
      console.log("✅ Calificación actualizada exitosamente:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al actualizar calificación:", error);
      throw new Error(
        error.response?.data?.message || "Error al actualizar calificación"
      );
    }
  },

  /**
   * Obtener horario de un profesor
   * @param {string|number} teacherId - ID del profesor
   * @returns {Promise<Object>} Horario del profesor
   */
  async getTeacherSchedule(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/schedule`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener horario del profesor:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener horario del profesor"
      );
    }
  },

  /**
   * Obtener estadísticas de profesores
   * @returns {Promise<Object>} Estadísticas de profesores
   */
  async getTeacherStats() {
    try {
      const response = await api.get("/teachers/stats");
      return response.data;
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      throw new Error(
        error.response?.data?.message || "Error al obtener estadísticas"
      );
    }
  },

  /**
   * Obtener evaluaciones de un profesor
   * @param {string|number} teacherId - ID del profesor
   * @returns {Promise<Array>} Lista de evaluaciones
   */
  async getTeacherEvaluations(teacherId) {
    try {
      const response = await api.get(`/teachers/${teacherId}/evaluations`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener evaluaciones del profesor:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al obtener evaluaciones del profesor"
      );
    }
  },

  /**
   * Crear una nueva evaluación para un profesor
   * @param {string|number} teacherId - ID del profesor
   * @param {Object} evaluationData - Datos de la evaluación
   * @returns {Promise<Object>} Evaluación creada
   */
  async createTeacherEvaluation(teacherId, evaluationData) {
    try {
      const response = await api.post(
        `/teachers/${teacherId}/evaluations`,
        evaluationData
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear evaluación:", error);
      throw new Error(
        error.response?.data?.message || "Error al crear evaluación"
      );
    }
  },

  /**
   * Exportar profesores a CSV
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo CSV
   */
  async exportTeachersToCSV(filters = {}) {
    try {
      console.log("📤 Exportando profesores a CSV...");
      const params = new URLSearchParams(filters);
      const response = await api.get(
        `/teachers/export/csv?${params.toString()}`,
        {
          responseType: "blob",
        }
      );
      console.log("✅ Exportación completada");
      return response.data;
    } catch (error) {
      console.error("❌ Error al exportar profesores:", error);
      throw new Error(
        error.response?.data?.message || "Error al exportar profesores"
      );
    }
  },

  /**
   * Importar profesores desde CSV
   * @param {File} file - Archivo CSV
   * @returns {Promise<Object>} Resultado de la importación
   */
  async importTeachersFromCSV(file) {
    try {
      console.log("📥 Importando profesores desde CSV...");
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/teachers/import/csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Importación completada:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error al importar profesores:", error);
      throw new Error(
        error.response?.data?.message || "Error al importar profesores"
      );
    }
  },

  /**
   * Eliminar/desactivar un trabajador
   * @param {string|number} id - ID del trabajador
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async deleteTrabajador(id) {
    try {
      console.log("🗑️ Eliminando/desactivando trabajador:", id);

      const response = await api.delete(`/trabajador/${id}`);
      console.log(
        "✅ Trabajador eliminado/desactivado exitosamente:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error al eliminar/desactivar trabajador:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al eliminar/desactivar trabajador"
      );
    }
  },

  /**
   * Cambiar el estado de un trabajador (activar/desactivar)
   * @param {string|number} id - ID del trabajador
   * @returns {Promise<Object>} Trabajador con estado actualizado
   */
  async toggleTrabajadorStatus(id) {
    try {
      console.log("🔄 Cambiando estado del trabajador:", id);

      const response = await api.delete(`/trabajador/${id}`);
      console.log(
        "✅ Estado del trabajador cambiado exitosamente:",
        response.data
      );

      return response.data;
    } catch (error) {
      console.error("❌ Error al cambiar estado del trabajador:", error);
      throw new Error(
        error.response?.data?.message ||
          "Error al cambiar estado del trabajador"
      );
    }
  },

  async getDocentes() {
    try {
      const response = await api.get('/trabajador/docentes');
      if (response.data?.info?.data && Array.isArray(response.data.info.data)) {
        return response.data.info.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener docentes:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener docentes');
    }
  },
};

export default trabajadorService;
