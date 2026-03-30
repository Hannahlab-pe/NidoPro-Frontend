import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Shield, FileText, Calendar,
  UserCheck, Briefcase, DollarSign, Clock, Building, Loader2
} from 'lucide-react';
import trabajadorService from '../../../services/trabajadorService';
import PageHeader from '../../../components/common/PageHeader';

const InfoField = ({ label, value, icon: Icon }) => (
  <div className="bg-gray-50 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-medium text-gray-900 ml-6">{value || 'No especificado'}</p>
  </div>
);

const PerfilTrabajador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar } = useOutletContext() || {};
  const [trabajador, setTrabajador] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await trabajadorService.getTrabajadorById(id);
        // The response might be { success, trabajador } or direct object
        const trab = data.trabajador || data.info?.data || data;
        setTrabajador(trab);

        // Try to get roles
        try {
          const rolesData = await trabajadorService.getTrabajadorRoles(id);
          setRoles(rolesData.roles || []);
        } catch {
          // Fallback to single role from worker data
          if (trab.idRol) {
            const rolData = typeof trab.idRol === 'object' ? [trab.idRol] : [];
            setRoles(trab.roles?.length > 0 ? trab.roles : rolData);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  if (error || !trabajador) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-red-500">{error || 'Trabajador no encontrado'}</p>
        <button onClick={() => navigate('/admin/trabajadores')} className="text-sm text-blue-600 hover:underline">
          Volver a trabajadores
        </button>
      </div>
    );
  }

  const getRolColor = (nombre) => {
    switch (nombre?.toUpperCase()) {
      case 'ADMINISTRADOR': return 'bg-purple-100 text-purple-800';
      case 'DOCENTE': return 'bg-blue-100 text-blue-800';
      case 'SECRETARIA': return 'bg-green-100 text-green-800';
      case 'ESPECIALISTA': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/trabajadores')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <PageHeader title="Perfil del Trabajador" theme="blue" />
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {trabajador.nombre?.charAt(0)}{trabajador.apellido?.charAt(0)}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {trabajador.nombre} {trabajador.apellido}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                {roles.length > 0 ? roles.map(rol => (
                  <span key={rol.idRol} className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRolColor(rol.nombre)}`}>
                    {rol.nombre}
                  </span>
                )) : trabajador.idRol?.nombre && (
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getRolColor(trabajador.idRol.nombre)}`}>
                    {trabajador.idRol.nombre}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick info bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: 'Documento', value: `${trabajador.tipoDocumento || 'DNI'} ${trabajador.nroDocumento || '-'}`, icon: FileText },
            { label: 'Correo', value: trabajador.correo || 'Sin correo', icon: Mail },
            { label: 'Teléfono', value: trabajador.telefono || 'Sin teléfono', icon: Phone },
            { label: 'Estado', value: trabajador.estaActivo ? 'Activo' : 'Inactivo', icon: UserCheck },
          ].map((item, i) => (
            <div key={i} className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-0.5">
                <item.icon className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoField label="Nombre" value={trabajador.nombre} icon={User} />
            <InfoField label="Apellido" value={trabajador.apellido} icon={User} />
            <InfoField label="Tipo Documento" value={trabajador.tipoDocumento} icon={FileText} />
            <InfoField label="Nro. Documento" value={trabajador.nroDocumento} icon={FileText} />
            <InfoField label="Correo" value={trabajador.correo} icon={Mail} />
            <InfoField label="Teléfono" value={trabajador.telefono} icon={Phone} />
            <InfoField label="Dirección" value={trabajador.direccion} icon={MapPin} />
            <InfoField label="Estado" value={trabajador.estaActivo ? 'Activo' : 'Inactivo'} icon={UserCheck} />
          </div>
        </div>

        {/* Roles */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Roles Asignados
          </h3>
          {roles.length > 0 ? (
            <div className="space-y-3">
              {roles.map(rol => (
                <div key={rol.idRol} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getRolColor(rol.nombre)}`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{rol.nombre}</p>
                    {rol.descripcion && <p className="text-xs text-gray-500">{rol.descripcion}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Sin roles asignados</p>
          )}
        </div>

        {/* Contratos */}
        {trabajador.contratoTrabajadors3 && trabajador.contratoTrabajadors3.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-orange-600" />
              Contratos
            </h3>
            <div className="space-y-4">
              {trabajador.contratoTrabajadors3.map((contrato, index) => (
                <div key={contrato.idContrato || index} className="border border-gray-100 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {contrato.numeroContrato && <InfoField label="Nro. Contrato" value={contrato.numeroContrato} icon={FileText} />}
                    {contrato.idTipoContrato?.nombreTipo && <InfoField label="Tipo" value={contrato.idTipoContrato.nombreTipo} icon={Briefcase} />}
                    {contrato.cargoContrato && <InfoField label="Cargo" value={contrato.cargoContrato} icon={UserCheck} />}
                    {contrato.jornadaLaboral && <InfoField label="Jornada" value={contrato.jornadaLaboral} icon={Clock} />}
                    {contrato.horasSemanales && <InfoField label="Horas/Semana" value={`${contrato.horasSemanales}h`} icon={Clock} />}
                    {contrato.estadoContrato && <InfoField label="Estado" value={contrato.estadoContrato} icon={UserCheck} />}
                    {contrato.fechaInicio && <InfoField label="Inicio" value={new Date(contrato.fechaInicio + 'T00:00:00').toLocaleDateString('es-PE')} icon={Calendar} />}
                    {contrato.fechaFin && <InfoField label="Fin" value={new Date(contrato.fechaFin + 'T00:00:00').toLocaleDateString('es-PE')} icon={Calendar} />}
                    {contrato.lugarTrabajo && <InfoField label="Lugar" value={contrato.lugarTrabajo} icon={Building} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asignación de Cursos */}
        {trabajador.asignacionCursos && trabajador.asignacionCursos.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-teal-600" />
              Cursos Asignados
            </h3>
            <div className="flex flex-wrap gap-2">
              {trabajador.asignacionCursos.map((asig) => (
                <div key={asig.idAsignacionCurso} className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg">
                  <Building className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">
                    {asig.idCurso?.nombreCurso || 'Curso'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usuario del Sistema */}
        {trabajador.idUsuario && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              Usuario del Sistema
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <InfoField label="Usuario" value={trabajador.idUsuario.usuario} icon={User} />
              <InfoField label="Estado" value={trabajador.idUsuario.estaActivo ? 'Activo' : 'Inactivo'} icon={UserCheck} />
              {trabajador.idUsuario.creado && (
                <InfoField label="Creado" value={new Date(trabajador.idUsuario.creado + 'T00:00:00').toLocaleDateString('es-PE')} icon={Calendar} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilTrabajador;
