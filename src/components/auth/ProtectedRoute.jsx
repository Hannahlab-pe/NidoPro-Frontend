import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
}) => {
  const { isAuthenticated, user, hasRole, hasPermission, loading } =
    useAuthStore();
  const location = useLocation();

  // Mostrar loading mientras se inicializa la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar si necesita cambiar contraseña (solo para debugging)
  if (user && user.cambioContrasena === false) {
    // Usuario necesita cambiar contraseña
  }

  // Verificar rol específico si es requerido
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p>No tienes permisos para acceder a esta sección.</p>
            <p className="text-sm mt-2">Rol requerido: {requiredRole}</p>
          </div>
        </div>
      </div>
    );
  }

  // Verificar permiso específico si es requerido
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p>No tienes permisos para realizar esta acción.</p>
            <p className="text-sm mt-2">
              Permiso requerido: {requiredPermission}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute;
