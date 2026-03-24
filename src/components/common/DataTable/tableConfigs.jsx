import React from "react";
import { BookOpen, Users } from "lucide-react";
import StudentAvatar from "../StudentAvatar";

/**
 * Configuraciones de columnas para diferentes tipos de tablas
 */

// Configuración de columnas para estudiantes
export const studentsColumns = [
  {
    Header: "Estudiante",
    accessor: "nombre",
    sortable: true,
    width: 200,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          {row.imagen_estudiante ? (
            <img
              src={row.imagen_estudiante}
              alt={`${value} ${row.apellido}`}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium text-sm">
              {value?.charAt(0)?.toUpperCase()}
              {row.apellido?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900 truncate">{`${value} ${
            row.apellido || ""
          }`}</div>
          <div className="text-sm text-gray-500 truncate">
            {row.nroDocumento
              ? `${row.tipoDocumento || "DNI"}: ${row.nroDocumento}`
              : "Sin documento"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Usuario",
    accessor: "idUsuario.usuario",
    sortable: true,
    width: 120,
    Cell: ({ value, row }) => (
      <div>
        <div
          className="font-mono text-sm text-gray-900 truncate max-w-[100px]"
          title={value}
        >
          {value || "Sin usuario"}
        </div>
        <div className="text-xs text-gray-500">
          {row.idUsuario?.estaActivo ? "Activo" : "Inactivo"}
        </div>
      </div>
    ),
  },
  {
    Header: "Contacto Emergencia",
    accessor: "contactosEmergencia",
    sortable: false,
    width: 150,
    Cell: ({ value }) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return <div className="text-sm text-gray-400 italic">Sin contacto</div>;
      }

      const principal =
        value.find((contacto) => contacto.esPrincipal) || value[0];
      return (
        <div className="max-w-[140px]">
          <div
            className="text-sm font-medium text-gray-900 truncate"
            title={`${principal.nombre} ${principal.apellido}`}
          >
            {principal.nombre} {principal.apellido}
          </div>
          <div
            className="text-xs text-gray-600 truncate"
            title={principal.tipoContacto || principal.relacionEstudiante}
          >
            {principal.tipoContacto || principal.relacionEstudiante}
          </div>
        </div>
      );
    },
  },
  {
    Header: "Email Contacto",
    accessor: "contactosEmergencia",
    sortable: false,
    width: 140,
    Cell: ({ value }) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return <div className="text-sm text-gray-400 italic">Sin email</div>;
      }

      const principal =
        value.find((contacto) => contacto.esPrincipal) || value[0];
      return (
        <div
          className="text-sm text-gray-600 truncate max-w-[120px]"
          title={principal.email}
        >
          {principal.email || "Sin email"}
        </div>
      );
    },
  },
  {
    Header: "Estado",
    accessor: "idUsuario.estaActivo",
    type: "status",
    sortable: true,
    Cell: ({ value, row }) => {
      // Obtener el estado desde idUsuario.estaActivo o directamente desde estaActivo
      const isActive = value !== undefined ? value : row.idUsuario?.estaActivo;
      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
  {
    Header: "Fecha Registro",
    accessor: "idUsuario.creado",
    sortable: true,
    width: 110,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-600">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
  {
    Header: "Aula",
    accessor: "matriculas",
    sortable: true,
    width: 120,
    Cell: ({ value }) => {
      // Buscar la matrícula activa más reciente
      const matriculaActiva =
        value?.find((m) => m.matriculaAula?.estado === "activo") || value?.[0];
      const aula = matriculaActiva?.matriculaAula?.aula;

      if (!aula) {
        return <div className="text-sm text-gray-400 italic">Sin aula</div>;
      }

      return (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {aula.seccion || "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {aula.idGrado?.grado || ""}
          </div>
        </div>
      );
    },
  },
];

// Filtros para estudiantes
export const studentsFilters = {
  status: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
    ],
  },
  tipoDocumento: {
    label: "Tipo Documento",
    placeholder: "Todos los tipos",
    options: [
      { value: "DNI", label: "DNI" },
      { value: "CE", label: "Carnet de Extranjería" },
      { value: "PASAPORTE", label: "Pasaporte" },
    ],
  },
  contactoEmergencia: {
    label: "Tipo Contacto",
    placeholder: "Todos los tipos",
    options: [
      { value: "Madre", label: "Madre" },
      { value: "Padre", label: "Padre" },
      { value: "Abuelo", label: "Abuelo/a" },
      { value: "Tío", label: "Tío/a" },
      { value: "Otro", label: "Otro" },
    ],
  },
};

// Configuración de columnas para grados
export const gradosColumns = [
  {
    Header: "Grado",
    accessor: "grado",
    sortable: true,
  },
  {
    Header: "Descripción",
    accessor: "descripcion",
    sortable: false,
    Cell: ({ value }) => (
      <div className="text-gray-600">
        {value || <span className="text-gray-400 italic">Sin descripción</span>}
      </div>
    ),
  },
];

// Filtros para grados
export const gradosFilters = {
  status: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
    ],
  },
  pension: {
    label: "Pensión",
    placeholder: "Todas las pensiones",
    options: [
      { value: "assigned", label: "Con pensión asignada" },
      { value: "unassigned", label: "Sin pensión asignada" },
    ],
  },
};

// Configuración de columnas para informes/reportes
export const informesColumns = [
  {
    Header: "ID Informe",
    accessor: "idInforme",
    sortable: true,
    Cell: ({ value }) => (
      <span className="font-mono text-xs text-gray-600">
        {value ? value.substring(0, 8) + "..." : "Sin ID"}
      </span>
    ),
  },
  {
    Header: "Detalle del Informe",
    accessor: "detalleInforme",
    sortable: false,
    Cell: ({ value }) => (
      <div className="max-w-xs">
        <p className="text-sm text-gray-900 truncate" title={value}>
          {value || "Sin detalle"}
        </p>
      </div>
    ),
  },
  {
    Header: "Fecha de Registro",
    accessor: "fechaRegistro",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <span className="text-sm text-gray-900">
        {value ? new Date(value + "T00:00:00").toLocaleDateString("es-PE") : "Sin fecha"}
      </span>
    ),
  },
];

// Filtros para informes
export const informesFilters = {
  fechaRegistro: {
    label: "Fecha",
    placeholder: "Todas las fechas",
    options: [
      { value: "hoy", label: "Hoy" },
      { value: "semana", label: "Esta semana" },
      { value: "mes", label: "Este mes" },
      { value: "año", label: "Este año" },
    ],
  },
};

// Configuración de columnas para pensiones base (GET /pension)
export const pensionesColumns = [
  {
    Header: "Pensión",
    accessor: "monto",
    sortable: true,
    Cell: ({ value }) => (
      <div className="flex items-center">
        <span className="font-semibold text-green-600 text-lg">
          S/ {value ? parseFloat(value).toFixed(2) : "0.00"}
        </span>
      </div>
    ),
  },
];

// Filtros para pensiones
export const pensionesFilters = {
  aula: {
    label: "Aula",
    placeholder: "Todas las aulas",
    type: "select",
    options: [], // Se llenará dinámicamente en el componente
  },
  estudiante: {
    label: "Estudiante",
    placeholder: "Todos los estudiantes",
    type: "select",
    options: [], // Se llenará dinámicamente en el componente
  },
  mes: {
    label: "Mes",
    placeholder: "Todos los meses",
    options: [
      { value: "1", label: "Enero" },
      { value: "2", label: "Febrero" },
      { value: "3", label: "Marzo" },
      { value: "4", label: "Abril" },
      { value: "5", label: "Mayo" },
      { value: "6", label: "Junio" },
      { value: "7", label: "Julio" },
      { value: "8", label: "Agosto" },
      { value: "9", label: "Septiembre" },
      { value: "10", label: "Octubre" },
      { value: "11", label: "Noviembre" },
      { value: "12", label: "Diciembre" },
    ],
  },
  montoPension: {
    label: "Monto de Pensión",
    placeholder: "Todos los montos",
    options: [
      { value: "300-349", label: "S/ 300 - 349" },
      { value: "350-399", label: "S/ 350 - 399" },
      { value: "400-449", label: "S/ 400 - 449" },
      { value: "450-499", label: "S/ 450 - 499" },
      { value: "500+", label: "S/ 500 +" },
    ],
  },
  estadoPension: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "PENDIENTE", label: "Pendiente" },
      { value: "PAGADO", label: "Pagado" },
      { value: "VENCIDO", label: "Vencido" },
      { value: "CANCELADO", label: "Cancelado" },
    ],
  },
  anio: {
    label: "Año",
    placeholder: "Todos los años",
    options: [
      { value: "2024", label: "2024" },
      { value: "2025", label: "2025" },
      { value: "2026", label: "2026" },
    ],
  },
};

// Configuración de columnas para trabajadores (estructura simplificada del GET /trabajador)
export const trabajadoresColumns = [
  {
    Header: "Trabajador",
    accessor: "nombre",
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {value?.charAt(0)?.toUpperCase()}
            {row.apellido?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{`${value} ${
            row.apellido || ""
          }`}</div>
          <div className="text-sm text-gray-500">
            {row.correo || "Sin correo"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Documento",
    accessor: "nroDocumento",
    sortable: true,
    Cell: ({ value, row }) => (
      <div>
        <div className="text-sm text-gray-900">
          {row.tipoDocumento || "DNI"}
        </div>
        <div className="text-sm text-gray-500">{value || "Sin documento"}</div>
      </div>
    ),
  },
  {
    Header: "Rol",
    accessor: "idRol",
    sortable: true,
    Cell: ({ value, row }) => {
      const getRolBadgeColor = (rol) => {
        switch (rol?.toUpperCase()) {
          case "ADMINISTRADOR":
            return "bg-purple-100 text-purple-800";
          case "DOCENTE":
            return "bg-blue-100 text-blue-800";
          case "SECRETARIA":
            return "bg-green-100 text-green-800";
          case "ESPECIALISTA":
            return "bg-yellow-100 text-yellow-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      };

      // Usar el array roles si tiene contenido, sino fallback a idRol
      const rolesList =
        row.roles && row.roles.length > 0
          ? row.roles
          : value
            ? [value]
            : [];

      return (
        <div className="flex flex-wrap gap-1">
          {rolesList.length > 0 ? (
            rolesList.map((rol) => (
              <span
                key={rol.idRol}
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolBadgeColor(
                  rol.nombre,
                )}`}
              >
                {rol.nombre}
              </span>
            ))
          ) : (
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              Sin rol
            </span>
          )}
        </div>
      );
    },
  },
  {
    Header: "Curso Asignado",
    accessor: "asignacionCursos",
    sortable: false,
    Cell: ({ value }) => {
      const cursosActivos = (value || []).filter((a) => a.estaActivo);
      if (cursosActivos.length === 0) {
        return <span className="text-sm text-gray-400">Sin curso</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {cursosActivos.map((asignacion) => (
            <span
              key={asignacion.idAsignacionCurso}
              className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800"
            >
              {asignacion.idCurso?.nombreCurso || "—"}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    Header: "Contacto",
    accessor: "telefono",
    sortable: false,
    Cell: ({ value, row }) => (
      <div>
        <div className="text-sm text-gray-900">{value || "Sin teléfono"}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {row.direccion || "Sin dirección"}
        </div>
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "estaActivo",
    sortable: true,
    Cell: ({ value }) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {value ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

// Filtros para trabajadores
export const trabajadoresFilters = {
  "idRol.nombre": {
    label: "Rol",
    placeholder: "Todos los roles",
    options: [
      { value: "ADMINISTRADOR", label: "Administrador" },
      { value: "DOCENTE", label: "Docente" },
      { value: "SECRETARIA", label: "Secretaria" },
      { value: "ESPECIALISTA", label: "Especialista" },
    ],
  },
  estaActivo: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
};

// Configuración de columnas para profesores
export const teachersColumns = [
  {
    Header: "Profesor",
    accessor: "name",
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {row.photo ? (
            <img
              src={row.photo}
              alt={value}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {value?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      </div>
    ),
  },
  {
    Header: "Materia",
    accessor: "subject",
    sortable: true,
  },
  {
    Header: "Experiencia",
    accessor: "experience",
    type: "number",
    sortable: true,
    Cell: ({ value }) => `${value} años`,
  },
  {
    Header: "Horario",
    accessor: "schedule",
    sortable: false,
  },
  {
    Header: "Calificación",
    accessor: "rating",
    type: "number",
    sortable: true,
    Cell: ({ value }) => (
      <div className="flex items-center space-x-1">
        <span className="text-yellow-500">⭐</span>
        <span className="font-semibold">{value || "-"}</span>
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "status",
    type: "status",
    sortable: true,
    statusColors: {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      on_leave: "bg-yellow-100 text-yellow-800",
    },
    statusLabels: {
      active: "Activo",
      inactive: "Inactivo",
      on_leave: "En licencia",
    },
  },
];

// Filtros para profesores
export const teachersFilters = {
  subject: {
    label: "Materia",
    placeholder: "Todas las materias",
    options: [
      { value: "mathematics", label: "Matemáticas" },
      { value: "science", label: "Ciencias" },
      { value: "language", label: "Lenguaje" },
      { value: "english", label: "Inglés" },
      { value: "art", label: "Arte" },
      { value: "physical_education", label: "Educación Física" },
      { value: "music", label: "Música" },
    ],
  },
  status: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
      { value: "on_leave", label: "En licencia" },
    ],
  },
};

// Configuración de columnas para padres
export const parentsColumns = [
  {
    Header: "Apoderado",
    accessor: "nombre",
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-blue-600 font-medium">
            {value?.charAt(0)?.toUpperCase()}
            {row.apellido?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{`${value || ""} ${
            row.apellido || ""
          }`}</div>
          <div className="text-sm text-gray-500">
            {row.correo || "Sin correo"}
          </div>
          <div className="text-sm text-gray-500">
            {row.numero || "Sin teléfono"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Tipo",
    accessor: "tipoApoderado",
    sortable: true,
    Cell: ({ value }) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === "Padre"
            ? "bg-blue-100 text-blue-800"
            : value === "Madre"
              ? "bg-pink-100 text-pink-800"
              : "bg-gray-100 text-gray-800"
        }`}
      >
        {value || "Sin tipo"}
      </span>
    ),
  },
  {
    Header: "Documento",
    accessor: "documentoIdentidad",
    sortable: true,
    Cell: ({ value, row }) => (
      <div>
        <div className="font-mono text-sm text-gray-900">
          {value || "Sin documento"}
        </div>
        <div className="text-xs text-gray-500">
          {row.tipoDocumentoIdentidad || "DNI"}
        </div>
      </div>
    ),
  },
  {
    Header: "Estudiantes Asociados",
    accessor: "matriculas",
    sortable: false,
    Cell: ({ value }) => {
      if (!value || !Array.isArray(value) || value.length === 0) {
        return (
          <div className="text-sm text-gray-400 italic">Sin estudiantes</div>
        );
      }

      return (
        <div className="space-y-2">
          {value.map((matricula, index) => (
            <div key={index} className="bg-gray-50 p-2 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">
                      {matricula.idEstudiante?.nombre?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {matricula.idEstudiante?.nombre}{" "}
                      {matricula.idEstudiante?.apellido}
                    </div>
                    <div className="text-xs text-gray-500">
                      {matricula.idEstudiante?.tipoDocumento}:{" "}
                      {matricula.idEstudiante?.nroDocumento}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    S/ {matricula.costoMatricula || "0.00"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {matricula.fechaIngreso
                      ? new Date(matricula.fechaIngreso + "T00:00:00").toLocaleDateString(
                          "es-ES",
                        )
                      : "Sin fecha"}
                  </div>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                Método: {matricula.metodoPago || "No especificado"} • Año:{" "}
                {matricula.anioEscolar || "N/A"}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    Header: "Total Hijos",
    accessor: "matriculas",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-center">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
            (value?.length || 0) > 0
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {value?.length || 0}
        </span>
      </div>
    ),
  },
  {
    Header: "Fecha Registro",
    accessor: "creado",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-PE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
];

// Filtros para padres
export const parentsFilters = {
  tipoApoderado: {
    label: "Tipo de Apoderado",
    placeholder: "Todos los tipos",
    options: [
      { value: "Padre", label: "Padre" },
      { value: "Madre", label: "Madre" },
    ],
  },
  tipoDocumentoIdentidad: {
    label: "Tipo de Documento",
    placeholder: "Todos los tipos",
    options: [
      { value: "DNI", label: "DNI" },
      { value: "Carnet de Extranjería", label: "Carnet de Extranjería" },
      { value: "Pasaporte", label: "Pasaporte" },
    ],
  },
};

// Configuración de columnas para usuarios
export const usersColumns = [
  {
    Header: "Usuario",
    accessor: "name",
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={value}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {value?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.username}</div>
        </div>
      </div>
    ),
  },
  {
    Header: "Email",
    accessor: "email",
    sortable: true,
  },
  {
    Header: "Rol",
    accessor: "role",
    sortable: true,
    Cell: ({ value }) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === "administracion"
            ? "bg-purple-100 text-purple-800"
            : value === "docente"
              ? "bg-blue-100 text-blue-800"
              : value === "padre"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
        }`}
      >
        {value === "administracion"
          ? "Admin"
          : value === "docente"
            ? "Docente"
            : value === "padre"
              ? "Padre"
              : value}
      </span>
    ),
  },
  {
    Header: "Último acceso",
    accessor: "lastLogin",
    type: "date",
    sortable: true,
  },
  {
    Header: "Estado",
    accessor: "status",
    type: "status",
    sortable: true,
    statusColors: {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    },
    statusLabels: {
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
    },
  },
];

// Filtros para usuarios
export const usersFilters = {
  role: {
    label: "Rol",
    placeholder: "Todos los roles",
    options: [
      { value: "administracion", label: "Administración" },
      { value: "docente", label: "Docente" },
      { value: "padre", label: "Padre" },
      { value: "especialista", label: "Especialista" },
    ],
  },
  status: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
      { value: "pending", label: "Pendiente" },
    ],
  },
};

// Configuración de columnas para matrícula
export const matriculaColumns = [
  {
    Header: "Estudiante",
    accessor: "idEstudiante",
    sortable: true,
    Cell: ({ value }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {value?.nombre?.charAt(0)?.toUpperCase()}
            {value?.apellido?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{`${value?.nombre || ""} ${
            value?.apellido || ""
          }`}</div>
          <div className="text-sm text-gray-500">
            {value?.nroDocumento || "Sin documento"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Apoderado",
    accessor: "idApoderado",
    sortable: true,
    Cell: ({ value }) => (
      <div>
        <div className="font-medium text-gray-900">{`${value?.nombre || ""} ${
          value?.apellido || ""
        }`}</div>
        <div className="text-sm text-gray-500">
          {value?.correo || "Sin correo"}
        </div>
        <div className="text-sm text-gray-500">
          {value?.numero || "Sin teléfono"}
        </div>
      </div>
    ),
  },
  {
    Header: "Grado",
    accessor: "idGrado",
    sortable: true,
    Cell: ({ value }) => (
      <div>
        <div className="font-medium text-gray-900">
          {value?.grado || "Sin grado"}
        </div>
        <div className="text-sm text-gray-500">{value?.descripcion || ""}</div>
      </div>
    ),
  },
  {
    Header: "Fecha Ingreso",
    accessor: "fechaIngreso",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900">
        {value ? new Date(value + "T00:00:00").toLocaleDateString("es-PE") : "Sin fecha"}
      </div>
    ),
  },
  {
    Header: "Voucher",
    accessor: "voucherImg",
    sortable: false,
    Cell: ({ value }) => (
      <div>
        {value ? (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Con voucher
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Sin voucher
          </span>
        )}
      </div>
    ),
  },
];

// Filtros para matrícula
export const matriculaFilters = {};

// Configuración de columnas para aulas (GET /aula)
export const aulasColumns = [
  {
    Header: "Grado",
    accessor: "idGrado",
    sortable: true,
    Cell: ({ value }) => <span>{value?.grado || "Sin grado"}</span>,
  },
  {
    Header: "Sección",
    accessor: "seccion",
    sortable: true,
  },
  {
    Header: "Cantidad de Estudiantes",
    accessor: "cantidadEstudiantes",
    sortable: true,
    Cell: ({ value }) => <span>{value || 0} estudiantes</span>,
  },
  {
    Header: "Descripción",
    accessor: "idGrado.descripcion",
    sortable: false,
    Cell: ({ row }) => (
      <span className="text-gray-600">
        {row.idGrado?.descripcion || (
          <span className="text-gray-400 italic">Sin descripción</span>
        )}
      </span>
    ),
  },
  {
    Header: "Tutor",
    accessor: "asignacionAulas",
    sortable: false,
    Cell: ({ value }) => {
      const asignacionActiva = value?.find((a) => a.estadoActivo);
      if (!asignacionActiva?.idTrabajador) {
        return <span className="text-gray-400 italic">Sin tutor</span>;
      }
      const { nombre, apellido } = asignacionActiva.idTrabajador;
      return (
        <span>
          {nombre} {apellido}
        </span>
      );
    },
  },
];

// Filtros para aulas
export const aulasFilters = {
  seccion: {
    label: "Sección",
    placeholder: "Todas las secciones",
    options: [
      { value: "A", label: "Sección A" },
      { value: "B", label: "Sección B" },
      { value: "C", label: "Sección C" },
      { value: "D", label: "Sección D" },
      { value: "E", label: "Sección E" },
    ],
  },
  estado: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "activa", label: "Activa" },
      { value: "inactiva", label: "Inactiva" },
    ],
  },
};

// Configuración de columnas para usuarios
export const usuariosColumns = [
  {
    Header: "Usuario",
    accessor: "usuario", // Cambiado de 'nombre' a 'usuario'
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-sm font-medium text-purple-600">
            {value?.charAt(0)?.toUpperCase() || "U"}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {value || "Sin usuario"}
          </div>
          <div className="text-sm text-gray-500">
            ID: {row.idUsuario?.substring(0, 8)}...
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Tipo",
    accessor: "estudiantes", // Determinar tipo basado en relaciones
    sortable: false,
    Cell: ({ value, row }) => {
      let tipo = "Sistema";
      let color = "bg-gray-100 text-gray-800";

      if (row.estudiantes) {
        tipo = "Estudiante/Apoderado";
        color = "bg-blue-100 text-blue-800";
      } else if (row.trabajadores) {
        tipo = "Trabajador";
        color = "bg-green-100 text-green-800";
      }

      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${color}`}
        >
          {tipo}
        </span>
      );
    },
  },
  {
    Header: "Nombre Asociado",
    accessor: "estudiantes",
    sortable: false,
    Cell: ({ value, row }) => {
      if (row.estudiantes) {
        return (
          <div>
            <div className="font-medium text-gray-900">
              {`${row.estudiantes.nombre} ${row.estudiantes.apellido}`}
            </div>
            <div className="text-sm text-gray-500">Estudiante</div>
          </div>
        );
      }

      if (row.trabajadores) {
        return (
          <div>
            <div className="font-medium text-gray-900">
              {`${row.trabajadores.nombre} ${row.trabajadores.apellido}`}
            </div>
            <div className="text-sm text-gray-500">Trabajador</div>
          </div>
        );
      }

      return <div className="text-sm text-gray-500">Usuario del sistema</div>;
    },
  },
  {
    Header: "Contacto",
    accessor: "estudiantes",
    sortable: false,
    Cell: ({ value, row }) => {
      if (row.estudiantes) {
        return (
          <div>
            <div className="text-sm text-gray-900">
              {row.estudiantes.contactoEmergencia || "Sin contacto"}
            </div>
            <div className="text-sm text-gray-500">
              {row.estudiantes.nroEmergencia || "Sin teléfono"}
            </div>
          </div>
        );
      }

      if (row.trabajadores) {
        return (
          <div>
            <div className="text-sm text-gray-900">
              {row.trabajadores.correo || "Sin email"}
            </div>
            <div className="text-sm text-gray-500">
              {row.trabajadores.telefono || "Sin teléfono"}
            </div>
          </div>
        );
      }

      return <div className="text-sm text-gray-500">Sin información</div>;
    },
  },
  {
    Header: "Fecha Creación",
    accessor: "creado",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-PE", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "estaActivo",
    type: "status",
    sortable: true,
    Cell: ({ value }) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {value ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

// Filtros para usuarios (actualizados según la estructura de datos)
export const usuariosFilters = {
  tipo: {
    label: "Tipo de Usuario",
    placeholder: "Todos los tipos",
    options: [
      { value: "estudiante", label: "Estudiante/Apoderado" },
      { value: "trabajador", label: "Trabajador" },
      { value: "sistema", label: "Usuario del Sistema" },
    ],
  },
  estaActivo: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "true", label: "Activos" },
      { value: "false", label: "Inactivos" },
    ],
  },
};

// Configuración de columnas para roles
export const rolesColumns = [
  {
    Header: "ID Rol",
    accessor: "idRol",
    sortable: true,
    Cell: ({ value }) => (
      <div className="font-mono text-xs text-gray-600">
        {value ? value.slice(0, 8) + "..." : "N/A"}
      </div>
    ),
  },
  {
    Header: "Nombre del Rol",
    accessor: "nombre",
    sortable: true,
    Cell: ({ value, row }) => (
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-purple-600 font-bold text-sm">
            {value?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">
            {row.descripcion || "Sin descripción"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Descripción",
    accessor: "descripcion",
    sortable: true,
    Cell: ({ value }) => (
      <div className="max-w-xs truncate">
        {value || <span className="text-gray-400 italic">Sin descripción</span>}
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "estaActivo",
    sortable: true,
    Cell: ({ value }) => {
      const isActive = value === true || value === "true" || value === 1;
      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
  {
    Header: "Fecha Creación",
    accessor: "creado",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-600">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
  {
    Header: "Última Actualización",
    accessor: "actualizado",
    type: "date",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-600">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-ES", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
];

// Filtros para roles
export const rolesFilters = {
  status: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "active", label: "Activo" },
      { value: "inactive", label: "Inactivo" },
    ],
  },
  nombre: {
    label: "Nombre del Rol",
    placeholder: "Buscar por nombre",
    type: "text",
  },
};

// Configuración de columnas para asignaciones de cursos
export const asignacionCursosColumns = [
  {
    Header: "Docente",
    accessor: "idTrabajador",
    sortable: true,
    Cell: ({ value }) => (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {value?.nombre?.charAt(0)?.toUpperCase()}
            {value?.apellido?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {`${value?.nombre || ""} ${value?.apellido || ""}`.trim()}
          </div>
          <div className="text-sm text-gray-500">
            {value?.correo || "Sin correo"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Curso",
    accessor: "idCurso",
    sortable: true,
    Cell: ({ value }) => (
      <div>
        <div className="font-medium text-gray-900">
          {value?.nombreCurso || "Sin nombre"}
        </div>
        <div className="text-sm text-gray-500">
          {value?.descripcion || "Sin descripción"}
        </div>
      </div>
    ),
  },
  {
    Header: "Fecha de Asignación",
    accessor: "fechaAsignacion",
    sortable: true,
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900">
        {value
          ? new Date(value + "T00:00:00").toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Sin fecha"}
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "estaActivo",
    type: "status",
    sortable: true,
    Cell: ({ value }) => (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {value ? "Activo" : "Inactivo"}
      </span>
    ),
  },
];

// Filtros para asignaciones de cursos
export const asignacionCursosFilters = {
  "idTrabajador.nombre": {
    label: "Docente",
    placeholder: "Buscar por docente",
    type: "text",
  },
  "idCurso.nombreCurso": {
    label: "Curso",
    placeholder: "Buscar por curso",
    type: "text",
  },
  estaActivo: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "true", label: "Activos" },
      { value: "false", label: "Inactivos" },
    ],
  },
};

// Configuración de columnas para cursos
export const cursosColumns = [
  {
    Header: "Curso",
    accessor: "nombreCurso",
    Cell: ({ value, row }) => (
      <div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
        <div className="text-sm text-gray-500 truncate max-w-xs">
          {row.descripcion || "Sin descripci�n"}
        </div>
      </div>
    ),
  },
  {
    Header: "Estado",
    accessor: "estaActivo",
    Cell: ({ value }) => {
      const getEstadoColor = (estado) => {
        return estado
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800";
      };

      return (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
            value,
          )}`}
        >
          {value ? "Activo" : "Inactivo"}
        </span>
      );
    },
  },
];

// Filtros para cursos
export const cursosFilters = {
  nombreCurso: {
    label: "Nombre del curso",
    placeholder: "Buscar por nombre",
    type: "text",
  },
  estaActivo: {
    label: "Estado",
    placeholder: "Todos los estados",
    options: [
      { value: "true", label: "Activos" },
      { value: "false", label: "Inactivos" },
    ],
  },
};

// Configuración de columnas para evaluaciones docentes
export const evaluacionesColumns = [
  {
    Header: "Docente",
    accessor: "idTrabajador",
    Cell: ({ value }) => (
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 text-lg">👨‍🏫</span>
          </div>
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">
            {value?.nombre} {value?.apellido}
          </div>
          <div className="text-sm text-gray-500">
            {value?.idRol?.nombre || "Docente"}
          </div>
        </div>
      </div>
    ),
  },
  {
    Header: "Motivo",
    accessor: "motivo",
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900 font-medium">{value}</div>
    ),
  },
  {
    Header: "Descripción",
    accessor: "descripcion",
    Cell: ({ value }) => (
      <div className="text-sm text-gray-900 max-w-xs">
        <div className="flex items-start gap-2">
          <span className="text-gray-400">💬</span>
          <span className="truncate" title={value}>
            {value && value.length > 60
              ? value.substring(0, 60) + "..."
              : value}
          </span>
        </div>
      </div>
    ),
  },
  {
    Header: "Fecha",
    accessor: "fechaCreacion",
    Cell: ({ value }) => {
      const formatearFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      };

      return (
        <div className="flex items-center gap-2">
          <span className="text-gray-400">📅</span>
          <span className="text-sm text-gray-900">{formatearFecha(value)}</span>
        </div>
      );
    },
  },
  {
    Header: "Archivo",
    accessor: "archivoUrl",
    Cell: ({ value }) => {
      if (value) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
          >
            <span>📎</span>
            Ver archivo
          </a>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            <span>📄</span>
            Sin archivo
          </span>
        );
      }
    },
  },
];

// Filtros para evaluaciones
export const evaluacionesFilters = {
  motivo: {
    label: "Motivo",
    placeholder: "Buscar por motivo",
    type: "text",
  },
  "idTrabajador.nombre": {
    label: "Docente",
    placeholder: "Buscar por docente",
    type: "text",
  },
};
