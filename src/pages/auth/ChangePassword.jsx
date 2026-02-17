import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store';

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [formData, setFormData] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmacionContrasena: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isObligatory = user?.cambioContrasena === false;

  // Prevenir navegación hacia atrás si es obligatorio
  useEffect(() => {
    if (isObligatory) {
      window.history.pushState(null, '', window.location.href);
      window.onpopstate = () => {
        window.history.pushState(null, '', window.location.href);
      };
    }
    return () => {
      window.onpopstate = null;
    };
  }, [isObligatory]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.contrasenaNueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.contrasenaNueva !== formData.confirmacionContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.changePassword(formData);
      
      // Si el backend devuelve el usuario actualizado, guardarlo
      if (response.user) {
        useAuthStore.getState().setUser(response.user);
      }
      
      alert('Contraseña actualizada exitosamente');
      
      // Si era obligatorio, hacer login nuevamente con las nuevas credenciales
      if (isObligatory) {
        // Limpiar y redirigir al login para que inicie sesión con la nueva contraseña
        logout();
        navigate('/login', { 
          replace: true,
          state: { message: 'Contraseña actualizada. Por favor, inicia sesión con tu nueva contraseña.' }
        });
      } else {
        // Si no era obligatorio, volver a la página anterior
        navigate(-1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isObligatory ? 'Cambio de Contraseña Obligatorio' : 'Cambiar Contraseña'}
          </h2>
          {isObligatory ? (
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Por seguridad, debes cambiar tu contraseña antes de continuar. Tu contraseña actual es la misma que tu documento de identidad.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Actualiza tu contraseña de forma segura
            </p>
          )}
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="contrasenaActual" className="sr-only">
                Contraseña Actual
              </label>
              <input
                id="contrasenaActual"
                name="contrasenaActual"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña Actual"
                value={formData.contrasenaActual}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="contrasenaNueva" className="sr-only">
                Nueva Contraseña
              </label>
              <input
                id="contrasenaNueva"
                name="contrasenaNueva"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Nueva Contraseña (mínimo 8 caracteres)"
                value={formData.contrasenaNueva}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmacionContrasena" className="sr-only">
                Confirmar Contraseña
              </label>
              <input
                id="confirmacionContrasena"
                name="confirmacionContrasena"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar Nueva Contraseña"
                value={formData.confirmacionContrasena}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
            
            {isObligatory && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
