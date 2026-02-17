import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useAuthStore } from "./store";
import { ProtectedRoute } from "./components/auth";
import ChangePasswordModal from "./components/auth/ChangePasswordModal";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import TeacherLayout from "./components/layout/TeacherLayout";
import ParentLayout from "./components/layout/ParentLayout";
import SecretaryLayout from "./components/layout/SecretaryLayout";

// Admin Pages
import AdminOverview from "./pages/dashboards/AdminOverview";
import SecretaryOverview from "./pages/dashboards/SecretaryOverview";
import Estudiantes from "./pages/admin/estudiantes/Estudiantes";
import Matricula from "./pages/admin/matricula/Matricula";
import Trabajadores from "./pages/admin/trabajadores/Trabajadores";
import Padres from "./pages/admin/padres/Padres";
import AsignacionAula from "./pages/admin/aulas/AsignacionAula";
import Aulas from "./pages/admin/aulas/Aulas";
import AulaDetalle from "./pages/admin/aulas/AulaDetalle";
import GestionFinanciera from "./pages/admin/finanzas/GestionFinanciera";
import Pensiones from "./pages/admin/pensiones/pensiones";
import Planificaciones from "./pages/admin/planificaciones/Planificaciones";
import Grados from "./pages/admin/grados/aulas";
import Cursos from "./pages/admin/cursos/Cursos";
import Contratos from "./pages/admin/contratos/Contratos";
import Planilla from "./pages/admin/planilla/Planilla";
import Cronogramas from "./pages/admin/cronogramas/Cronogramas";
import EvaluacionDocente from "./pages/admin/evaluacion/EvaluacionDocente";
import AnioEscolar from "./pages/admin/anioescolar/AnioEscolar";
import Bimestres from "./pages/admin/anioescolar/Bimestres";
import Acciones from "./pages/admin/anioescolar/Acciones";
import Seguros from "./pages/admin/seguros/Seguros";
import AdminAIChat from "./pages/admin/iachat/AIChat";
import BimestralDocente from "./pages/admin/bimestralDocente/BimestralDocente";

// Teacher Pages
import TeacherOverview from "./pages/dashboards/TeacherOverview";
import TeacherAIChat from "./pages/teacher/iachat/AIChat";
import Horarios from "./pages/teacher/horarios/Horarios";
import Asistencias from "./pages/teacher/asistencia/Asistencia";
import Juegos from "./pages/teacher/juegos/Juegos";
import MisAulas from "./pages/teacher/misaulas/MisAulas";
import TeacherPlanificaciones from "./pages/teacher/planificaciones/TeacherPlanificaciones";
import { Tareas as TeacherTareas } from "./pages/teacher/tareas";
import TeacherEvaluaciones from "./pages/teacher/evaluaciones/Evaluaciones";
import { EvaluacionesEstudiantes } from "./pages/teacher/evaluaciones";
import Notas from "./pages/teacher/notas/Notas";

// Parent Pages
import ParentOverview from "./pages/dashboards/ParentOverview";
import SecretaryReportes from "./pages/secretaria/reportes/Reportes";
import SecretaryCaja from "./pages/secretaria/caja/Caja";
import SecretaryPensiones from "./pages/secretaria/pensiones/Pensiones";
import ParentTareas from "./pages/parent/tareas/Tareas";
import ParentAsistencia from "./pages/parent/asistencia/Asistencia";
import Anotaciones from "./pages/parent/anotaciones/Anotaciones";
import Cronograma from "./pages/parent/cronograma/Cronograma";
import ParentAIChat from "./pages/parent/iachat/ParentAIChat";
import ParentPensiones from "./pages/parent/pensiones/Pensiones";

// Configuración del QueryClient con cache de 5-10 minutos
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - tiempo antes de considerar datos obsoletos
      gcTime: 10 * 60 * 1000, // 10 minutos - tiempo antes de limpiar cache (antes cacheTime)
      retry: 1, // Reintentar una vez en caso de error
      refetchOnWindowFocus: false, // No refetch al cambiar de ventana
      refetchOnReconnect: true, // Refetch al reconectar internet
    },
    mutations: {
      retry: 1, // Reintentar mutaciones una vez
    },
  },
});

function App() {
  const { initializeAuth, isAuthenticated, loading, user } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Inicializar autenticación al cargar la app
  useEffect(() => {
    initializeAuth();
  }, []);

  const handlePasswordChangeSuccess = (success) => {
    if (success) {
      setShowPasswordModal(false);
      useAuthStore.setState((state) => ({
        ...state,
        user: {
          ...state.user,
          cambioContrasena: true,
        },
      }));
    }
  };

  // Mostrar loading mientras se inicializa la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Función helper para redirigir según el rol
  const getDefaultRouteByRole = (user) => {
    if (!user || !user.role) return "/login";

    const roleName = user.role.nombre?.toLowerCase();

    if (
      roleName === "admin" ||
      roleName === "administrador" ||
      roleName === "directora"
    ) {
      return "/admin";
    }
    if (
      roleName === "trabajador" ||
      roleName === "docente" ||
      roleName === "profesor"
    ) {
      return "/teacher";
    }
    if (
      roleName === "padre" ||
      roleName === "parent" ||
      roleName === "estudiante"
    ) {
      return "/parent";
    }
    if (roleName === "secretaria") {
      return "/secretaria";
    }

    return "/login";
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container min-h-screen bg-gray-50">
        <Router>
          <Routes>
            {/* Ruta raíz - redirige según autenticación y rol */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to={getDefaultRouteByRole(user)} replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Login - solo accesible si no está autenticado */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to={getDefaultRouteByRole(user)} replace />
                ) : (
                  <Login />
                )
              }
            />

            {/* Change Password - accesible solo si está autenticado */}
            <Route
              path="/change-password"
              element={
                isAuthenticated ? (
                  <ChangePassword />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* ========== ADMIN ROUTES ========== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="estudiantes" element={<Estudiantes />} />
              <Route path="matricula" element={<Matricula />} />
              <Route path="trabajadores" element={<Trabajadores />} />
              <Route path="padres" element={<Padres />} />
              <Route path="planificaciones" element={<Planificaciones />} />
              <Route path="cronogramas" element={<Cronogramas />} />
              <Route
                path="evaluacion-docente"
                element={<EvaluacionDocente />}
              />
              <Route path="bimestral-docente" element={<BimestralDocente />} />
              <Route path="aulas" element={<Aulas />} />
              <Route path="aulas/:id" element={<AulaDetalle />} />
              <Route path="asignacion-aula" element={<AsignacionAula />} />
              <Route path="finanzas" element={<GestionFinanciera />} />
              <Route path="pensiones" element={<Pensiones />} />
              <Route path="contratos" element={<Contratos />} />
              <Route path="planilla" element={<Planilla />} />
              <Route path="seguros" element={<Seguros />} />
              <Route path="ai-chat" element={<AdminAIChat />} />
              <Route path="anio-escolar" element={<AnioEscolar />} />
              <Route path="bimestres" element={<Bimestres />} />
              <Route path="acciones-periodo" element={<Acciones />} />
              <Route path="grados" element={<Grados />} />
              <Route path="cursos" element={<Cursos />} />
            </Route>

            {/* ========== SECRETARIA ROUTES ========== */}
            <Route
              path="/secretaria"
              element={
                <ProtectedRoute requiredRole="SECRETARIA">
                  <SecretaryLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SecretaryOverview />} />
              <Route path="reportes" element={<SecretaryReportes />} />
              <Route path="caja" element={<SecretaryCaja />} />
              <Route path="pensiones" element={<SecretaryPensiones />} />
            </Route>

            {/* ========== TEACHER ROUTES ========== */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherOverview />} />
              <Route path="ai-chat" element={<TeacherAIChat />} />
              <Route path="juegos" element={<Juegos />} />
              <Route path="cronograma" element={<Horarios />} />
              <Route path="asistencia" element={<Asistencias />} />
              <Route path="tareas" element={<TeacherTareas />} />
              <Route
                path="evaluaciones-estudiantes"
                element={<EvaluacionesEstudiantes />}
              />
              <Route path="anotaciones" element={<Notas />} />
              <Route
                path="planificaciones"
                element={<TeacherPlanificaciones />}
              />
              <Route path="aulas" element={<MisAulas />} />
              <Route path="evaluaciones" element={<TeacherEvaluaciones />} />
            </Route>

            {/* ========== PARENT ROUTES ========== */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute>
                  <ParentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ParentOverview />} />
              <Route path="iachat" element={<ParentAIChat />} />
              <Route path="juegos" element={<Juegos />} />
              <Route path="tareas" element={<ParentTareas />} />
              <Route path="cronograma" element={<Cronograma />} />
              <Route path="anotaciones" element={<Anotaciones />} />
              <Route path="asistencia" element={<ParentAsistencia />} />
              <Route path="pensiones" element={<ParentPensiones />} />
            </Route>

            {/* Ruta 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      404
                    </h1>
                    <p className="text-gray-600 mb-4">Página no encontrada</p>
                    <Navigate
                      to={
                        isAuthenticated ? getDefaultRouteByRole(user) : "/login"
                      }
                      replace
                    />
                  </div>
                </div>
              }
            />
          </Routes>
        </Router>

        {/* Toaster para notificaciones globales */}
        <Toaster position="top-right" richColors closeButton duration={4000} />

        {/* Modal de cambio de contraseña obligatorio */}
        {showPasswordModal && user && (
          <ChangePasswordModal
            isOpen={showPasswordModal}
            onClose={handlePasswordChangeSuccess}
            userId={user.id}
            userName={user.nombre || user.fullName}
          />
        )}
      </div>

      {/* React Query DevTools - solo en desarrollo */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
