import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "../../store";
import { authService } from "../../services/authService";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
  PenTool,
  Book,
  Apple,
  Star,
  Heart,
  Palette,
  Music,
  Smile,
  Baby,
  Scissors,
  Puzzle,
  Trophy,
  Gift,
  Gamepad2,
  Paintbrush,
  Shapes,
  Zap,
  Rocket,
  Bird,
  TreePine,
  Sun,
  Moon,
  Cloud,
  Flower,
  Cake,
  Crown,
  Diamond,
} from "lucide-react";
import loginImage from "../../assets/images/IMG-login.jpg";

const Login = () => {
  const [formData, setFormData] = useState({ usuario: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, setLoading, setError, clearError } = useAuthStore();

  // Ruta a la que redirigir después del login
  const from = location.state?.from?.pathname || "/dashboard";

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario empieza a escribir
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Mapear email a usuario para compatibilidad
    if (name === "usuario") {
      setFormData((prev) => ({
        ...prev,
        email: value, // Mantener compatibilidad con authService
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.usuario) {
      errors.usuario = "El DNI es requerido";
    } else if (formData.usuario.length < 2) {
      errors.usuario = "El DNI debe tener al menos 8 dígitos";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 2) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      // Intentar login con backend
      let userData;
      try {
        userData = await authService.login(formData);
      } catch (backendError) {
        console.warn(
          "Backend no disponible, usando modo desarrollo:",
          backendError.message,
        );
        // Fallback a modo desarrollo
        userData = await authService.loginDev(formData);
      }

      // Actualizar store de Zustand
      login(userData);

      // Guardar token en localStorage
      localStorage.setItem("token", userData.token);

      // Redirigir
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error en login:", error);
      toast.error(error.message || "Error al iniciar sesión");
      setFormErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-purple-100 relative overflow-hidden">
      {/* Background Elements with animations */}
      <div
        className={`absolute inset-0 transition-all duration-1500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Círculos decorativos grandes */}
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-25 blur-2xl"></div>
          <div className="absolute -bottom-12 -right-24 w-64 h-64 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-25 blur-2xl"></div>

          {/* Formas geométricas flotantes con animación suave */}
          <div
            className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-500 rounded-lg rotate-45 opacity-30 animate-bounce"
            style={{
              animationDelay: "0s",
              animation: "float 6s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute top-1/3 right-1/4 w-6 h-6 bg-pink-500 rounded-full opacity-40"
            style={{
              animationDelay: "1s",
              animation: "float 8s ease-in-out infinite reverse",
            }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-yellow-500 rounded-full opacity-50"
            style={{
              animationDelay: "2s",
              animation: "float 7s ease-in-out infinite",
            }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/3 w-7 h-7 bg-purple-500 rounded-lg rotate-12 opacity-35"
            style={{
              animationDelay: "0.5s",
              animation: "float 9s ease-in-out infinite reverse",
            }}
          ></div>

          {/* Partículas de iconos educativos flotantes - NIVEL INTENSO */}

          {/* Partículas GRANDES */}
          <div
            className="absolute top-20 left-16 text-blue-400 opacity-70"
            style={{
              animation: "floatMega 8s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <PenTool className="w-8 h-8" />
          </div>

          <div
            className="absolute top-32 right-20 text-pink-400 opacity-65"
            style={{
              animation: "floatIntense 6s ease-in-out infinite reverse",
              animationDelay: "1.5s",
            }}
          >
            <Book className="w-9 h-9" />
          </div>

          <div
            className="absolute top-1/2 left-12 text-green-400 opacity-75"
            style={{
              animation: "floatMega 10s ease-in-out infinite",
              animationDelay: "3s",
            }}
          >
            <Apple className="w-7 h-7" />
          </div>

          <div
            className="absolute bottom-32 left-24 text-yellow-400 opacity-70"
            style={{
              animation: "floatIntense 7s ease-in-out infinite reverse",
              animationDelay: "2s",
            }}
          >
            <Star className="w-8 h-8" />
          </div>

          <div
            className="absolute bottom-20 right-16 text-red-400 opacity-65"
            style={{
              animation: "floatMega 9s ease-in-out infinite",
              animationDelay: "4s",
            }}
          >
            <Heart className="w-7 h-7" />
          </div>

          {/* PARTÍCULAS EXTRA GRANDES AGREGADAS */}
          <div
            className="absolute top-14 left-6 text-emerald-500 opacity-75"
            style={{
              animation: "floatMega 7s ease-in-out infinite",
              animationDelay: "0.8s",
            }}
          >
            <Cake className="w-10 h-10" />
          </div>

          <div
            className="absolute top-72 right-6 text-purple-500 opacity-80"
            style={{
              animation: "floatIntense 8s ease-in-out infinite reverse",
              animationDelay: "2.3s",
            }}
          >
            <Crown className="w-11 h-11" />
          </div>

          <div
            className="absolute bottom-14 left-6 text-cyan-500 opacity-70"
            style={{
              animation: "floatMega 9s ease-in-out infinite",
              animationDelay: "3.7s",
            }}
          >
            <Diamond className="w-10 h-10" />
          </div>

          <div
            className="absolute bottom-72 right-12 text-orange-500 opacity-75"
            style={{
              animation: "floatIntense 6s ease-in-out infinite reverse",
              animationDelay: "1.4s",
            }}
          >
            <Gift className="w-9 h-9" />
          </div>

          {/* Partículas MEDIANAS */}
          <div
            className="absolute top-40 left-32 text-purple-400 opacity-60"
            style={{
              animation: "floatIntense 8s ease-in-out infinite reverse",
              animationDelay: "1s",
            }}
          >
            <Palette className="w-6 h-6" />
          </div>

          <div
            className="absolute bottom-40 left-8 text-indigo-400 opacity-75"
            style={{
              animation: "floatMega 11s ease-in-out infinite",
              animationDelay: "3.5s",
            }}
          >
            <Music className="w-6 h-6" />
          </div>

          <div
            className="absolute top-60 right-32 text-orange-400 opacity-65"
            style={{
              animation: "floatIntense 6s ease-in-out infinite reverse",
              animationDelay: "2.5s",
            }}
          >
            <Smile className="w-7 h-7" />
          </div>

          <div
            className="absolute bottom-60 right-8 text-teal-400 opacity-70"
            style={{
              animation: "floatMega 12s ease-in-out infinite",
              animationDelay: "5s",
            }}
          >
            <Baby className="w-6 h-6" />
          </div>

          {/* Partículas NUEVAS - Tamaño Grande */}
          <div
            className="absolute top-16 left-40 text-cyan-400 opacity-65"
            style={{
              animation: "floatIntense 9s ease-in-out infinite",
              animationDelay: "1.2s",
            }}
          >
            <Scissors className="w-8 h-8" />
          </div>

          <div
            className="absolute top-80 left-20 text-lime-400 opacity-70"
            style={{
              animation: "floatMega 7s ease-in-out infinite reverse",
              animationDelay: "4.2s",
            }}
          >
            <Puzzle className="w-9 h-9" />
          </div>

          <div
            className="absolute bottom-16 left-40 text-amber-400 opacity-75"
            style={{
              animation: "floatIntense 10s ease-in-out infinite",
              animationDelay: "2.8s",
            }}
          >
            <Trophy className="w-8 h-8" />
          </div>

          <div
            className="absolute top-24 right-8 text-rose-400 opacity-60"
            style={{
              animation: "floatMega 8s ease-in-out infinite reverse",
              animationDelay: "3.8s",
            }}
          >
            <Gift className="w-7 h-7" />
          </div>

          {/* Partículas PEQUEÑAS - Alta densidad */}
          <div
            className="absolute top-28 left-8 text-violet-400 opacity-55"
            style={{
              animation: "floatIntense 5s ease-in-out infinite",
              animationDelay: "0.5s",
            }}
          >
            <Gamepad2 className="w-4 h-4" />
          </div>

          <div
            className="absolute top-44 right-12 text-sky-400 opacity-60"
            style={{
              animation: "floatMega 6s ease-in-out infinite reverse",
              animationDelay: "2.2s",
            }}
          >
            <Flower className="w-5 h-5" />
          </div>

          <div
            className="absolute bottom-28 left-16 text-emerald-400 opacity-65"
            style={{
              animation: "floatIntense 7s ease-in-out infinite",
              animationDelay: "1.8s",
            }}
          >
            <Paintbrush className="w-4 h-4" />
          </div>

          <div
            className="absolute bottom-44 right-24 text-fuchsia-400 opacity-55"
            style={{
              animation: "floatMega 9s ease-in-out infinite reverse",
              animationDelay: "3.2s",
            }}
          >
            <Shapes className="w-5 h-5" />
          </div>

          <div
            className="absolute top-36 left-4 text-orange-300 opacity-50"
            style={{
              animation: "floatIntense 6s ease-in-out infinite",
              animationDelay: "4.5s",
            }}
          >
            <Zap className="w-4 h-4" />
          </div>

          <div
            className="absolute top-52 right-4 text-blue-300 opacity-60"
            style={{
              animation: "floatMega 8s ease-in-out infinite reverse",
              animationDelay: "1.7s",
            }}
          >
            <Rocket className="w-5 h-5" />
          </div>

          <div
            className="absolute bottom-36 left-4 text-pink-300 opacity-55"
            style={{
              animation: "floatIntense 7s ease-in-out infinite",
              animationDelay: "3.7s",
            }}
          >
            <Bird className="w-4 h-4" />
          </div>

          <div
            className="absolute bottom-52 right-4 text-green-300 opacity-65"
            style={{
              animation: "floatMega 5s ease-in-out infinite reverse",
              animationDelay: "2.7s",
            }}
          >
            <TreePine className="w-5 h-5" />
          </div>

          {/* Partículas MICRO - Súper pequeñas */}
          <div
            className="absolute top-12 left-28 text-yellow-300 opacity-45"
            style={{
              animation: "floatIntense 4s ease-in-out infinite",
              animationDelay: "0.8s",
            }}
          >
            <Sun className="w-3 h-3" />
          </div>

          <div
            className="absolute top-68 left-36 text-slate-400 opacity-50"
            style={{
              animation: "floatMega 6s ease-in-out infinite reverse",
              animationDelay: "2.3s",
            }}
          >
            <Moon className="w-3 h-3" />
          </div>

          <div
            className="absolute bottom-12 left-28 text-gray-400 opacity-45"
            style={{
              animation: "floatIntense 5s ease-in-out infinite",
              animationDelay: "4.1s",
            }}
          >
            <Cloud className="w-3 h-3" />
          </div>

          <div
            className="absolute bottom-68 right-28 text-purple-300 opacity-55"
            style={{
              animation: "floatMega 7s ease-in-out infinite reverse",
              animationDelay: "1.3s",
            }}
          >
            <Cake className="w-4 h-4" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-6xl flex items-center justify-center">
            {/* Left Side - Login Form */}
            <div
              className={`w-full lg:w-1/2 flex items-center justify-start pl-6 pr-3 transition-all duration-1000 transform ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-10 opacity-0"
              }`}
            >
              <div className="w-full max-w-md">
                {/* Form Container */}
                <div
                  className={`bg-transparent rounded-3xl border border-white/30 p-8 relative transition-all duration-1200 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100 scale-100"
                      : "translate-y-8 opacity-0 scale-95"
                  }`}
                >
                  {/* Mobile logo */}
                  <div className="lg:hidden flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Form Header */}
                  <div
                    className={`text-center mb-8 transition-all duration-700 transform ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "0.3s" }}
                  >
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      EDA
                    </h3>
                    <p className="text-gray-600">
                      Accede a tu cuenta para continuar
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DNI Field */}
                    <div
                      className={`transition-all duration-700 transform ${
                        isVisible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                      style={{ transitionDelay: "0.5s" }}
                    >
                      <label
                        htmlFor="usuario"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        DNI / Documento
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="usuario"
                          type="text"
                          name="usuario"
                          value={formData.usuario}
                          onChange={handleInputChange}
                          placeholder="12345678"
                          className={`w-full pl-4 pr-4 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                            formErrors.usuario
                              ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                              : "border-gray-200 focus:ring-blue-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          required
                        />
                      </div>
                      {formErrors.usuario && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                          {formErrors.usuario}
                        </p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div
                      className={`transition-all duration-700 transform ${
                        isVisible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                      style={{ transitionDelay: "0.7s" }}
                    >
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={`w-full pl-4 pr-14 py-4 border-2 rounded-2xl focus:outline-none focus:ring-4 transition-all duration-300 bg-white/70 backdrop-blur-sm ${
                            formErrors.password
                              ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                              : "border-gray-200 focus:ring-blue-200 focus:border-blue-500 hover:border-gray-300"
                          }`}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                          {formErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Global Error */}
                    {formErrors.general && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                        <p className="text-sm text-red-600 flex items-center">
                          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          {formErrors.general}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div
                      className={`transition-all duration-700 transform ${
                        isVisible
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                      style={{ transitionDelay: "0.9s" }}
                    >
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                          isLoading
                            ? "bg-gray-400 cursor-not-allowed scale-100"
                            : "bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 hover:bg-blue-700"
                        }`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                            Verificando...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Ingresar al Sistema
                          </div>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Decorative elements for form */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg rotate-45 opacity-20"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-30"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Welcome Panel */}
            <div
              className={`hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 relative transition-all duration-1000 transform ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <div className="relative z-10">
                {/* Logo y Brand */}
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-blue-600 bg-clip-text text-transparent">
                      EDA
                    </h1>
                    <p className="text-sm text-gray-600">Sistema Educativo</p>
                  </div>
                </div>

                {/* Welcome Message */}
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-gray-800 mb-4 leading-tight">
                    Bienvenido a<br />
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      EDA
                    </span>
                  </h2>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Plataforma educativa completa para la gestión integral de
                    centros educativos
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">
                      Gestión de estudiantes y padres
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">
                      Sistema de matrículas integrado
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">
                      Reportes y análisis en tiempo real
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative circles for right panel con animación flotante INTENSA */}
              <div
                className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-40"
                style={{
                  animation: "floatMega 12s ease-in-out infinite",
                  animationDelay: "2s",
                }}
              ></div>
              <div
                className="absolute bottom-20 left-32 w-20 h-20 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-50"
                style={{
                  animation: "floatIntense 10s ease-in-out infinite reverse",
                  animationDelay: "4s",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Powered by HannahLab - Marca en inferior izquierda */}
        <div className="absolute bottom-4 left-6 z-20 hover:-translate-y-1 transition-all duration-400">
          <div
            className={`flex justify-center items-center space-x-2  transition-all duration-1000 transform ${
              isVisible ? "translate-y-0" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "1.5s" }}
          >
            <div className="text-black text-sm font-medium">
              <a
                href="https://hannahlab.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors cursor-pointer"
              >
                Powered by{" "}
                <span className="font-extrabold text-xl bg-gradient-to-r from-green-500 to-emerald-700 bg-clip-text text-transparent">
                  HannahLab
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
